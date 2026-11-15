import { describe, expect, it } from "vitest";
import { parseReviewCaseInput, parseReviewCaseResult } from "../../src/providers/ai/aiParsing";
import { MockAIProvider } from "../../src/providers/ai";
import { evaluateMinimumCoverage } from "../../src/domain/rules/coverageRules";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";

const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

function item(id: string, dimension: CanvasItem["dimension"], content: string, epistemicType: CanvasItem["epistemicType"]): CanvasItem {
  return {
    id,
    caseId: "case-review",
    dimension,
    content,
    epistemicType,
    origin: "USER",
    validationStatus: "VALIDATED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function fixtureItems(): CanvasItem[] {
  return [
    item("ctx-1", "CONTEXT", "El contrato con el proveedor venció el 31/10/2026.", "FACT"),
    item("ctx-2", "CONTEXT", "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.", "FACT"),
    item("exp-1", "EXPOSURE", "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT"),
    item("evi-1", "EVIDENCE", "Existe respaldo documental interno sobre necesidad de continuidad.", "FACT"),
    item("imp-1", "IMPACT", "200 usuarios quedarán sin servicio.", "FACT"),
    item("unc-1", "UNCERTAINTY", "No conocemos el plazo definitivo de contratación.", "MISSING_INFORMATION"),
    item("alt-1", "ALTERNATIVE", "Una prórroga contractual podría ser una alternativa.", "ASSUMPTION"),
    item("int-1", "INTERVENTION", "Que mi jefe vea el tema.", "HUMAN_EVALUATION")
  ];
}

describe("reviewCase contract and mock behavior", () => {
  it("validates input with coverage and contextual history", () => {
    const items = fixtureItems();

    expect(() =>
      parseReviewCaseInput({
        caseId: "case-review",
        initialNarrative: NARRATIVE,
        currentItems: items,
        rejectedAiItems: [],
        coverageResult: evaluateMinimumCoverage(items),
        contextualQuestionHistory: [],
        currentCaseStatus: "CRITICAL_REVIEW"
      })
    ).not.toThrow();
  });

  it("output passes zod and findings start OPEN", async () => {
    const provider = new MockAIProvider();
    const items = fixtureItems();

    const result = await provider.reviewCase({
      caseId: "case-review",
      initialNarrative: NARRATIVE,
      currentItems: items,
      rejectedAiItems: [],
      coverageResult: evaluateMinimumCoverage(items),
      contextualQuestionHistory: [],
      currentCaseStatus: "CRITICAL_REVIEW"
    });

    expect(() => parseReviewCaseResult(result)).not.toThrow();
    expect(result.findings.every((finding) => finding.status === "OPEN")).toBe(true);
  });

  it("invalid output fails explicitly", () => {
    expect(() =>
      parseReviewCaseResult({
        reviewId: "r1",
        findings: [
          {
            id: "f1",
            type: "UNSUPPORTED_CLAIM",
            level: "BLOCKER",
            title: "t",
            message: "m",
            relatedItemIds: [],
            rationale: "r",
            suggestedHumanAction: "a",
            status: "RESOLVED_BY_EDIT"
          }
        ],
        summary: {
          totalFindings: 1,
          openBlockers: 1,
          openWarnings: 0,
          resolvedFindings: 0
        },
        canCompleteReview: false
      })
    ).toThrow();
  });

  it("mock returns deterministic dynamics findings", async () => {
    const provider = new MockAIProvider();
    const items = fixtureItems();

    const result = await provider.reviewCase({
      caseId: "case-review",
      initialNarrative: NARRATIVE,
      currentItems: items,
      rejectedAiItems: [],
      coverageResult: evaluateMinimumCoverage(items),
      contextualQuestionHistory: [],
      currentCaseStatus: "CRITICAL_REVIEW"
    });

    expect(result.findings.map((finding) => finding.id)).toEqual([
      "dw-review-dyn-1",
      "dw-review-dyn-2",
      "dw-review-dyn-3",
      "dw-review-dyn-4"
    ]);
    expect(result.findings.every((finding) => ["BLOCKER", "WARNING"].includes(finding.level))).toBe(true);
  });

  it("potential contradiction stays WARNING and not confirmed contradiction", async () => {
    const provider = new MockAIProvider();
    const items = fixtureItems();

    const result = await provider.reviewCase({
      caseId: "case-review",
      initialNarrative: NARRATIVE,
      currentItems: items,
      rejectedAiItems: [],
      coverageResult: evaluateMinimumCoverage(items),
      contextualQuestionHistory: [],
      currentCaseStatus: "CRITICAL_REVIEW"
    });

    const contradiction = result.findings.find((finding) => finding.type === "POTENTIAL_CONTRADICTION");
    expect(contradiction?.level).toBe("WARNING");
  });

  it("actionable intervention does not generate intervention blocker", async () => {
    const provider = new MockAIProvider();
    const items = fixtureItems().map((entry) =>
      entry.dimension === "INTERVENTION"
        ? {
            ...entry,
            content:
              "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos."
          }
        : entry
    );

    const result = await provider.reviewCase({
      caseId: "case-review",
      initialNarrative: NARRATIVE,
      currentItems: items,
      rejectedAiItems: [],
      coverageResult: evaluateMinimumCoverage(items),
      contextualQuestionHistory: [],
      currentCaseStatus: "CRITICAL_REVIEW"
    });

    expect(result.findings.some((finding) => finding.type === "INTERVENTION_NOT_ACTIONABLE")).toBe(false);
  });

  it("non recognized case returns empty findings and explicit summary", async () => {
    const provider = new MockAIProvider();
    const items = fixtureItems();

    const result = await provider.reviewCase({
      caseId: "case-review",
      initialNarrative: "Relato desconocido",
      currentItems: items,
      rejectedAiItems: [],
      coverageResult: evaluateMinimumCoverage(items),
      contextualQuestionHistory: [],
      currentCaseStatus: "CRITICAL_REVIEW"
    });

    expect(result.findings).toHaveLength(0);
    expect(result.summary.totalFindings).toBe(0);
  });
});
