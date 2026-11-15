import { describe, expect, it } from "vitest";
import { evaluateMinimumCoverage } from "../../src/domain/rules/coverageRules";
import { MockAIProvider, parseSuggestNextQuestionResult } from "../../src/providers/ai";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";

const provider = new MockAIProvider();
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

function item(partial: Partial<CanvasItem>): CanvasItem {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? crypto.randomUUID(),
    caseId: partial.caseId ?? "case-1",
    dimension: partial.dimension ?? "CONTEXT",
    content: partial.content ?? "contenido",
    epistemicType: partial.epistemicType ?? "FACT",
    origin: partial.origin ?? "USER",
    validationStatus: partial.validationStatus ?? "VALIDATED",
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    aiSuggestion: partial.aiSuggestion
  };
}

describe("suggestNextQuestion", () => {
  it("returns exactly one question for dynamics", async () => {
    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: [
        item({ dimension: "CONTEXT" }),
        item({ dimension: "EXPOSURE" })
      ],
      coverageResult: evaluateMinimumCoverage([
        item({ dimension: "CONTEXT" }),
        item({ dimension: "EXPOSURE" })
      ]),
      previousQuestions: [],
      questionCount: 0,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.shouldStop).toBe(false);
    expect(result.question).not.toBeNull();
  });

  it("output passes zod", async () => {
    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: [item({ dimension: "CONTEXT" }), item({ dimension: "EXPOSURE" })],
      coverageResult: evaluateMinimumCoverage([item({ dimension: "CONTEXT" }), item({ dimension: "EXPOSURE" })]),
      previousQuestions: [],
      questionCount: 0,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(() => parseSuggestNextQuestionResult(result)).not.toThrow();
  });

  it("invalid output fails explicitly", () => {
    expect(() =>
      parseSuggestNextQuestionResult({
        question: null,
        shouldStop: false,
        stopReason: null,
        remainingMissingDimensions: [],
        provisionalBriefAllowed: false,
        message: null
      })
    ).toThrow();
  });

  it("does not allow question + shouldStop=true", () => {
    expect(() =>
      parseSuggestNextQuestionResult({
        question: {
          id: "q",
          targetDimension: "IMPACT",
          question: "q",
          reason: "r",
          priority: "HIGH",
          suggestedEpistemicType: "INFERENCE",
          answerOptions: ["ANSWER"]
        },
        shouldStop: true,
        stopReason: "NO_MATERIAL_QUESTION",
        remainingMissingDimensions: ["IMPACT"],
        provisionalBriefAllowed: false,
        message: "m"
      })
    ).toThrow();
  });

  it("asks IMPACT when missing", async () => {
    const items = [item({ dimension: "CONTEXT" }), item({ dimension: "EXPOSURE" })];
    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [],
      questionCount: 0,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.question?.targetDimension).toBe("IMPACT");
  });

  it("asks EVIDENCE when impact covered and evidence missing", async () => {
    const items = [
      item({ dimension: "CONTEXT" }),
      item({ dimension: "EXPOSURE" }),
      item({ dimension: "IMPACT", epistemicType: "INFERENCE" })
    ];

    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [],
      questionCount: 0,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.question?.targetDimension).toBe("EVIDENCE");
  });

  it("asks UNCERTAINTY when evidence covered and uncertainty missing", async () => {
    const items = [
      item({ dimension: "CONTEXT" }),
      item({ dimension: "EXPOSURE" }),
      item({ dimension: "IMPACT", epistemicType: "INFERENCE" }),
      item({ dimension: "EVIDENCE", epistemicType: "FACT" })
    ];

    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [],
      questionCount: 0,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.question?.targetDimension).toBe("UNCERTAINTY");
  });

  it("asks INTERVENTION when uncertainty covered and intervention missing", async () => {
    const items = [
      item({ dimension: "CONTEXT" }),
      item({ dimension: "EXPOSURE" }),
      item({ dimension: "IMPACT", epistemicType: "INFERENCE" }),
      item({ dimension: "EVIDENCE", epistemicType: "FACT" }),
      item({ dimension: "UNCERTAINTY", epistemicType: "MISSING_INFORMATION" })
    ];

    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [],
      questionCount: 0,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.question?.targetDimension).toBe("INTERVENTION");
  });

  it("does not ask already covered dimension again", async () => {
    const items = [
      item({ dimension: "CONTEXT" }),
      item({ dimension: "EXPOSURE" }),
      item({ dimension: "IMPACT", epistemicType: "INFERENCE" })
    ];

    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [
        {
          id: "q-impact",
          caseId: "case-1",
          targetDimension: "IMPACT",
          question: "impact q",
          reason: "r",
          priority: "HIGH",
          suggestedEpistemicType: "INFERENCE",
          answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"],
          status: "ANSWERED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      questionCount: 1,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.question?.targetDimension).toBe("EVIDENCE");
  });

  it("coverage 6/6 returns MINIMUM_COVERAGE_REACHED", async () => {
    const items = [
      item({ dimension: "CONTEXT" }),
      item({ dimension: "EXPOSURE" }),
      item({ dimension: "IMPACT", epistemicType: "INFERENCE" }),
      item({ dimension: "EVIDENCE", epistemicType: "FACT" }),
      item({ dimension: "UNCERTAINTY", epistemicType: "MISSING_INFORMATION" }),
      item({ dimension: "INTERVENTION", epistemicType: "HUMAN_EVALUATION" })
    ];

    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [],
      questionCount: 3,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.shouldStop).toBe(true);
    expect(result.stopReason).toBe("MINIMUM_COVERAGE_REACHED");
  });

  it("returns ORIENTATIVE_LIMIT_REACHED at question count 8", async () => {
    const items = [item({ dimension: "CONTEXT" }), item({ dimension: "EXPOSURE" })];

    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [],
      questionCount: 8,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.shouldStop).toBe(true);
    expect(result.stopReason).toBe("ORIENTATIVE_LIMIT_REACHED");
  });

  it("does not generate scenario or alternative for minimum coverage", async () => {
    const items = [item({ dimension: "CONTEXT" }), item({ dimension: "EXPOSURE" })];
    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [],
      questionCount: 0,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(["SCENARIO", "ALTERNATIVE"]).not.toContain(result.question?.targetDimension);
  });

  it("no applicable is not included for required dimensions", async () => {
    const items = [item({ dimension: "CONTEXT" }), item({ dimension: "EXPOSURE" })];
    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: evaluateMinimumCoverage(items),
      previousQuestions: [],
      questionCount: 0,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result.question?.answerOptions).not.toContain("NOT_APPLICABLE");
  });

  it("input includes coverage and history", async () => {
    const items = [item({ dimension: "CONTEXT" }), item({ dimension: "EXPOSURE" })];
    const coverage = evaluateMinimumCoverage(items);
    const history = [
      {
        id: "q1",
        caseId: "case-1",
        targetDimension: "IMPACT" as const,
        question: "q",
        reason: "r",
        priority: "HIGH" as const,
        suggestedEpistemicType: "INFERENCE" as const,
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"] as const,
        status: "ANSWERED" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const result = await provider.suggestNextQuestion({
      caseId: "case-1",
      initialNarrative: NARRATIVE,
      currentItems: items,
      coverageResult: coverage,
      previousQuestions: history,
      questionCount: 1,
      currentCaseStatus: "IN_ANALYSIS"
    });

    expect(result).toBeDefined();
  });
});
