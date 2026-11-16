import { describe, expect, it } from "vitest";
import type { AnalyzeNarrativeResult, ComposeExecutiveCommunicationInput, GenerateBriefInput } from "../../src/providers/ai/AIProvider.ts";
import { MockAIProvider, buildMechanicalProjectionForComparison } from "../../src/providers/ai/MockAIProvider.ts";
import { parseAnalyzeNarrativeResult } from "../../src/providers/ai/aiParsing.ts";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";
import type { CriticalReview, ReviewFinding } from "../../src/domain/models/CriticalReview";

const DYNAMICS_NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";
const SHAREPOINT_NARRATIVE =
  "Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint sobre los que tenemos montadas distintas soluciones que utilizan Nintex Workflow. En 2023 advertimos esta situación y comenzamos una modernización de las soluciones.";
const PRODUCCION_NARRATIVE =
  "Para producir un bien necesitamos comprometer una fecha de entrega. En la fabricación intervienen distintas áreas y actualmente no conocemos con suficiente precisión la probabilidad de cumplimiento de esa fecha.";

function nowIso(): string {
  return new Date().toISOString();
}

function item(
  id: string,
  caseId: string,
  dimension: CanvasItem["dimension"],
  content: string,
  epistemicType: CanvasItem["epistemicType"],
  validationStatus: CanvasItem["validationStatus"] = "VALIDATED"
): CanvasItem {
  const now = nowIso();
  return {
    id,
    caseId,
    dimension,
    content,
    epistemicType,
    origin: "USER",
    validationStatus,
    createdAt: now,
    updatedAt: now
  };
}

function finding(id: string, status: ReviewFinding["status"], level: ReviewFinding["level"], message: string): ReviewFinding {
  return {
    id,
    type: "HIDDEN_ASSUMPTION",
    level,
    title: "finding",
    message,
    relatedItemIds: ["alt-1"],
    rationale: "r",
    suggestedHumanAction: "a",
    status
  };
}

function completedReview(caseId: string, warnings: ReviewFinding[] = []): CriticalReview {
  const now = nowIso();
  return {
    reviewId: `${caseId}-review`,
    caseId,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
    findings: [...warnings, finding(`${caseId}-resolved`, "RESOLVED_BY_EDIT", "WARNING", "resolved")],
    summary: { totalFindings: warnings.length + 1, openBlockers: 0, openWarnings: warnings.length, resolvedFindings: 1 },
    canCompleteReview: true,
    status: "COMPLETED"
  };
}

function createInput(caseId: string, caseTitle: string, initialNarrative: string, activeCanvasItems: CanvasItem[]): GenerateBriefInput {
  const warnings = [finding(`${caseId}-open`, "OPEN", "WARNING", "Advertencia abierta para trazabilidad.")];
  return {
    caseId,
    caseTitle,
    initialNarrative,
    activeCanvasItems,
    humanSeverityAssessment: {
      caseId,
      severity: "HIGH",
      rationale: "Evaluación humana",
      assessedBy: "USER",
      assessedAt: nowIso(),
      updatedAt: nowIso(),
      status: "ASSESSED"
    },
    completedCriticalReview: completedReview(caseId, warnings),
    openWarnings: warnings,
    contextualQuestionHistory: [],
    currentCaseStatus: "BRIEF_DRAFT"
  };
}

function buildComposeInputFromGenerated(input: GenerateBriefInput, generated: Awaited<ReturnType<MockAIProvider["generateBrief"]>>): ComposeExecutiveCommunicationInput {
  return {
    caseId: input.caseId,
    caseTitle: input.caseTitle,
    audience: "DIRECT_LEADER",
    validatedCanvasItems: input.activeCanvasItems,
    criticalReview: input.completedCriticalReview,
    openWarnings: input.openWarnings,
    humanSeverityAssessment: input.humanSeverityAssessment,
    structuredBrief: generated.executive,
    requiredIntervention: generated.executive.requiredIntervention.content,
    language: "es"
  };
}

describe("MockAIProvider", () => {
  it("returns exactly three suggestions for Dynamics narrative", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: DYNAMICS_NARRATIVE,
      existingItems: []
    });

    expect(result.suggestions).toHaveLength(3);
  });

  it("keeps deterministic order of Dynamics suggestions", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: DYNAMICS_NARRATIVE,
      existingItems: []
    });

    expect(result.suggestions.map((item) => item.id)).toEqual([
      "dw-ai-dynamics-1",
      "dw-ai-dynamics-2",
      "dw-ai-dynamics-3"
    ]);
  });

  it("validates Dynamics output with Zod", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: DYNAMICS_NARRATIVE,
      existingItems: []
    });

    expect(() => parseAnalyzeNarrativeResult(result)).not.toThrow();
  });

  it("fails explicitly on invalid output", () => {
    const invalidResult: AnalyzeNarrativeResult = {
      suggestions: [
        {
          id: "bad",
          dimension: "CONTEXT",
          epistemicType: "FACT",
          content: "dato",
          rationale: "x",
          source: "INITIAL_NARRATIVE"
        }
      ]
    };

    expect(() =>
      parseAnalyzeNarrativeResult({
        ...invalidResult,
        suggestions: [{ ...invalidResult.suggestions[0], dimension: "NOT_A_DIMENSION" }]
      })
    ).toThrow();
  });

  it("returns empty suggestions for unrecognized narrative", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: "Relato no reconocido por fixture",
      existingItems: []
    });

    expect(result.suggestions).toHaveLength(0);
  });

  it("applies epistemic prudence: future possibility is not FACT", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: "Si termina el proveedor seguramente no podremos mantener las aplicaciones.",
      existingItems: []
    });

    expect(result.suggestions).toEqual([]);
    expect(result.suggestions.some((item) => item.epistemicType === "FACT")).toBe(false);
  });

  it("composes natural communication for Dynamics and avoids headings", async () => {
    const provider = new MockAIProvider();
    const input = createInput("dyn-1", "Caso Dynamics", DYNAMICS_NARRATIVE, [
      item("ctx-1", "dyn-1", "CONTEXT", "El contrato con el proveedor venció el 31/10/2026.", "FACT"),
      item("ctx-2", "dyn-1", "CONTEXT", "El proveedor continúa únicamente hasta finalizar el proyecto actual.", "FACT", "EDITED"),
      item("exp-1", "dyn-1", "EXPOSURE", "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT"),
      item("imp-1", "dyn-1", "IMPACT", "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", "INFERENCE"),
      item("evi-1", "dyn-1", "EVIDENCE", "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", "FACT"),
      item("unc-1", "dyn-1", "UNCERTAINTY", "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION"),
      item("unc-2", "dyn-1", "UNCERTAINTY", "No conocemos la demanda de nuevos trabajos durante los próximos meses.", "MISSING_INFORMATION"),
      item("int-1", "dyn-1", "INTERVENTION", "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.", "HUMAN_EVALUATION")
    ]);

    const generated = await provider.generateBrief(input);

    expect(generated.communication.email.subject.trim().length).toBeGreaterThan(0);
    expect(generated.communication.email.body).not.toMatch(/(^|\n)\s*(Situación|Evidencia|Intervención requerida)\s*:/i);
    expect(generated.communication.message.body.length).toBeLessThan(generated.communication.email.body.length);
    expect(generated.communication.email.body).toContain("La gravedad fue evaluada por el usuario como Alta.");
    expect(generated.communication.email.body).toContain(input.activeCanvasItems[7].content);
  });

  it("composes controlled communication for SharePoint/Nintex without invented quantities", async () => {
    const provider = new MockAIProvider();
    const input = createInput("sp-1", "Caso SharePoint", SHAREPOINT_NARRATIVE, [
      item("ctx-1", "sp-1", "CONTEXT", "Microsoft informó fin de soporte para workflows de SharePoint en julio de 2026.", "FACT"),
      item("exp-1", "sp-1", "EXPOSURE", "Existen soluciones que dependen de workflows con Nintex.", "FACT"),
      item("imp-1", "sp-1", "IMPACT", "Puede existir riesgo de discontinuidad si no se completa la migración.", "INFERENCE"),
      item("unc-1", "sp-1", "UNCERTAINTY", "No hay inventario completo y validado de aplicaciones, workflows y usuarios afectados.", "MISSING_INFORMATION"),
      item("int-1", "sp-1", "INTERVENTION", "Solicitar definición de priorización y plan de relevamiento transversal.", "HUMAN_EVALUATION")
    ]);

    const generated = await provider.generateBrief(input);
    const combined = `${generated.communication.email.body} ${generated.communication.message.body}`.toLocaleLowerCase("es");

    expect(combined).toContain("incertidumbre");
    expect(combined).not.toMatch(/\b\d+\s+(aplicaciones|usuarios|workflows)\b/);
    expect(combined).toContain(input.activeCanvasItems[4].content.toLocaleLowerCase("es"));
  });

  it("composes controlled communication for Producción without invented probability", async () => {
    const provider = new MockAIProvider();
    const input = createInput("prod-1", "Caso Producción", PRODUCCION_NARRATIVE, [
      item("ctx-1", "prod-1", "CONTEXT", "Se incumplen fechas comprometidas de entrega con frecuencia.", "FACT"),
      item("exp-1", "prod-1", "EXPOSURE", "Intervienen distintas áreas y la coordinación actual no alcanza para sostener previsibilidad.", "FACT"),
      item("imp-1", "prod-1", "IMPACT", "Existe riesgo de afectar compromisos operativos y comerciales si continúa la variabilidad.", "INFERENCE"),
      item("unc-1", "prod-1", "UNCERTAINTY", "No existe evidencia consolidada suficiente para estimar probabilidad de cumplimiento defendible.", "MISSING_INFORMATION"),
      item("int-1", "prod-1", "INTERVENTION", "Definir si se habilita análisis transversal y refuerzo de recolección de información.", "HUMAN_EVALUATION")
    ]);

    const generated = await provider.generateBrief(input);
    const combined = `${generated.communication.email.body} ${generated.communication.message.body}`.toLocaleLowerCase("es");

    expect(combined).toContain("intervienen varias áreas");
    expect(combined).toContain("no existe evidencia consolidada suficiente para estimar una probabilidad defendible");
    expect(combined).not.toMatch(/\d+%/);
    expect(combined).not.toMatch(/entre\s+\d+\s+y\s+\d+/);
  });

  it("keeps grounding and outperforms mechanical projection in comparison", async () => {
    const provider = new MockAIProvider();
    const input = createInput("cmp-1", "Caso Comparación", DYNAMICS_NARRATIVE, [
      item("ctx-1", "cmp-1", "CONTEXT", "El contrato con el proveedor venció el 31/10/2026.", "FACT"),
      item("exp-1", "cmp-1", "EXPOSURE", "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT"),
      item("imp-1", "cmp-1", "IMPACT", "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", "INFERENCE"),
      item("evi-1", "cmp-1", "EVIDENCE", "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", "FACT"),
      item("unc-1", "cmp-1", "UNCERTAINTY", "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION"),
      item("int-1", "cmp-1", "INTERVENTION", "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.", "HUMAN_EVALUATION")
    ]);

    const generated = await provider.generateBrief(input);
    const composeInput = buildComposeInputFromGenerated(input, generated);

    expect(composeInput.validatedCanvasItems.every((item) => item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED")).toBe(true);

    const mechanical = buildMechanicalProjectionForComparison(composeInput);
    const composed = generated.communication.email.body;

    expect(composed).not.toContain("Situación:");
    expect(composed).not.toContain("Evidencia:");
    expect(composed.length).toBeLessThan(mechanical.emailBody.length);
    expect(composed).toContain("La gravedad fue evaluada por el usuario como Alta.");
    expect(composed).toContain(composeInput.requiredIntervention);
  });
});
