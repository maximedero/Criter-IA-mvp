import { describe, expect, it } from "vitest";
import { evaluateMinimumCoverage } from "../../src/domain/rules/coverageRules";
import {
  BRIEF_GATE_ERRORS,
  calculateBriefStale,
  canMarkBriefAsReviewed,
  createBriefGenerationInput,
  evaluateBriefGenerationGate,
  markBriefAsReviewed,
  updateCommunicationAsEdited,
  updateSectionAsEdited
} from "../../src/domain/workflow/briefWorkflow";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";
import type { CriticalReview, ReviewFinding } from "../../src/domain/models/CriticalReview";
import type { HumanSeverityAssessment } from "../../src/domain/models/HumanSeverityAssessment";
import { MockAIProvider } from "../../src/providers/ai";

const CASE_ID = "case-brief";
const PRODUCCION_NARRATIVE =
  "Las líneas de producción tuvieron microcortes durante los últimos tres turnos y distintos equipos técnicos reportaron comportamientos intermitentes en sistemas de control. No está claro si el origen está en red, energía o integración entre componentes. Hay registros parciales y percepciones de operadores, pero no existe todavía una línea de causalidad validada de punta a punta.";

function item(
  id: string,
  dimension: CanvasItem["dimension"],
  content: string,
  epistemicType: CanvasItem["epistemicType"],
  validationStatus: CanvasItem["validationStatus"] = "VALIDATED"
): CanvasItem {
  const now = new Date().toISOString();
  return {
    id,
    caseId: CASE_ID,
    dimension,
    content,
    epistemicType,
    origin: "USER",
    validationStatus,
    createdAt: now,
    updatedAt: now
  };
}

function dynamicsItems(): CanvasItem[] {
  return [
    item("ctx-1", "CONTEXT", "El contrato con el proveedor venció el 31/10/2026.", "FACT"),
    item("ctx-2", "CONTEXT", "El proveedor continúa únicamente hasta finalizar el proyecto actual.", "FACT", "EDITED"),
    item("exp-1", "EXPOSURE", "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT"),
    item(
      "imp-1",
      "IMPACT",
      "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.",
      "INFERENCE"
    ),
    item(
      "evi-1",
      "EVIDENCE",
      "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.",
      "FACT"
    ),
    item("unc-1", "UNCERTAINTY", "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION"),
    item(
      "unc-2",
      "UNCERTAINTY",
      "No conocemos la demanda de nuevos trabajos durante los próximos meses.",
      "MISSING_INFORMATION"
    ),
    item(
      "alt-1",
      "ALTERNATIVE",
      "Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.",
      "ASSUMPTION"
    ),
    item(
      "int-1",
      "INTERVENTION",
      "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.",
      "HUMAN_EVALUATION"
    ),
    item("pending-1", "SCENARIO", "No consolidable", "INFERENCE", "PENDING"),
    item("rejected-1", "SCENARIO", "No consolidable", "INFERENCE", "REJECTED")
  ];
}

function reviewFinding(status: ReviewFinding["status"]): ReviewFinding {
  return {
    id: `finding-${status}`,
    type: "HIDDEN_ASSUMPTION",
    level: status === "OPEN" ? "WARNING" : "BLOCKER",
    title: status === "OPEN" ? "Alternativa todavía no confirmada" : "finding",
    message:
      status === "OPEN" ? "La viabilidad de una prórroga contractual todavía no está confirmada." : "finding message",
    relatedItemIds: ["alt-1"],
    rationale: "r",
    suggestedHumanAction: "a",
    status
  };
}

function completedReview(): CriticalReview {
  const now = new Date().toISOString();
  return {
    reviewId: "review-1",
    caseId: CASE_ID,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
    findings: [reviewFinding("OPEN"), reviewFinding("RESOLVED_BY_EDIT")],
    summary: { totalFindings: 2, openBlockers: 0, openWarnings: 1, resolvedFindings: 1 },
    canCompleteReview: true,
    status: "COMPLETED"
  };
}

function severity(): HumanSeverityAssessment {
  const now = new Date().toISOString();
  return {
    caseId: CASE_ID,
    severity: "HIGH",
    rationale:
      "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto.",
    assessedBy: "USER",
    assessedAt: now,
    updatedAt: now,
    status: "ASSESSED"
  };
}

function assertInterventionPreserved(body: string, expectedConcepts: string[]): void {
  const normalized = body.toLowerCase();
  expectedConcepts.forEach((concept) => {
    expect(normalized).toContain(concept.toLowerCase());
  });

  const paragraphs = body
    .split(/\n\s*\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const lastParagraph = paragraphs.at(-1) ?? "";
  expect(lastParagraph.length).toBeGreaterThan(0);
  expect(expectedConcepts.some((concept) => lastParagraph.toLowerCase().includes(concept.toLowerCase()))).toBe(true);
}

describe("slice9 brief workflow", () => {
  it("brief status enum supports expected values", async () => {
    const provider = new MockAIProvider();
    const validItems = dynamicsItems().filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");
    const result = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative:
        "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      activeCanvasItems: validItems,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    expect(["NOT_GENERATED", "GENERATED", "EDITED_BY_USER", "REVIEWED_BY_USER"]).toContain(result.status);
    expect(result.status).toBe("GENERATED");
    expect(result.reviewedByUser).toBe(false);
    expect(result.reviewedAt).toBeNull();
    expect(result.generatedBy).toBe("AI");
  });

  it("generation input includes only VALIDATED/EDITED items", () => {
    const all = dynamicsItems();
    const input = createBriefGenerationInput({
      caseId: CASE_ID,
      caseTitle: "Caso",
      initialNarrative: "n",
      activeItems: all,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    expect(input.activeCanvasItems.some((entry) => entry.validationStatus === "PENDING")).toBe(false);
    expect(input.activeCanvasItems.some((entry) => entry.validationStatus === "REJECTED")).toBe(false);
  });

  it("gate blocks when preconditions fail", () => {
    const gate = evaluateBriefGenerationGate({
      caseStatus: "BRIEF_DRAFT",
      hasMinimumCoverage: false,
      criticalReviewComplete: false,
      openBlockers: 1,
      humanSeverity: "UNASSESSED",
      criticalReview: null
    });

    expect(gate.allowed).toBe(false);
    expect(gate.reasons).toContain(BRIEF_GATE_ERRORS.MINIMUM_COVERAGE_LOST);
    expect(gate.reasons).toContain(BRIEF_GATE_ERRORS.CRITICAL_REVIEW_INCOMPLETE);
    expect(gate.reasons).toContain(BRIEF_GATE_ERRORS.OPEN_BLOCKERS);
    expect(gate.reasons).toContain(BRIEF_GATE_ERRORS.SEVERITY_UNASSESSED);
  });

  it("dynamics brief keeps uncertainty visible and inference prudent", async () => {
    const provider = new MockAIProvider();
    const all = dynamicsItems();
    const validItems = all.filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");

    const result = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative:
        "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      activeCanvasItems: validItems,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    expect(result.executive.uncertainties.content).toMatch(/No se conoce cuándo termina exactamente/);
    expect(result.executive.possibleImpacts.content).toMatch(/podrían/);
    expect(result.executive.scenariosAndAlternatives.content).toMatch(/podría/);
    expect(result.executive.scenariosAndAlternatives.limitations.length).toBeGreaterThan(0);
    expect(result.executive.severity.value).toBe("HIGH");
    expect(result.executive.severity.assessedBy).toBe("USER");
    expect(result.executive.severity.notice).toBe("Evaluación realizada por el usuario.");
  });

  it("source ids are valid and invalid ids are rejected", async () => {
    const provider = new MockAIProvider();
    const all = dynamicsItems().filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");
    const result = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative:
        "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      activeCanvasItems: all,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    const allIds = new Set(all.map((entry) => entry.id));
    const allSourceIds = Object.values(result.traceability.sectionSources).flat();
    expect(allSourceIds.every((id) => allIds.has(id))).toBe(true);

    expect(allSourceIds.includes("missing-id")).toBe(false);
  });

  it("empty scenarios use explicit placeholder", async () => {
    const provider = new MockAIProvider();
    const base = dynamicsItems()
      .filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED")
      .filter((entry) => entry.dimension !== "ALTERNATIVE" && entry.dimension !== "SCENARIO");

    const result = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso no reconocido",
      initialNarrative: "Relato no reconocido",
      activeCanvasItems: base,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    expect(result.executive.scenariosAndAlternatives.content).toBe("No identificados con la evidencia disponible.");
  });

  it("editing updates status and keeps source ids", async () => {
    const provider = new MockAIProvider();
    const valid = dynamicsItems().filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");
    const generated = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative:
        "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      activeCanvasItems: valid,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    const previousIds = generated.executive.whyItMatters.sourceItemIds;
    const edited = updateSectionAsEdited(generated, "whyItMatters", "Texto editado");

    expect(edited.status).toBe("EDITED_BY_USER");
    expect(edited.executive.whyItMatters.sourceItemIds).toEqual(previousIds);
  });

  it("communication is generated with required structure, grounded content and narrative format", async () => {
    const provider = new MockAIProvider();
    const valid = dynamicsItems().filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");
    const result = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative:
        "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      activeCanvasItems: valid,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    expect(result.communication.email.subject.trim().length).toBeGreaterThan(0);
    expect(result.communication.email.body.trim().length).toBeGreaterThan(0);
    expect(result.communication.message.body.trim().length).toBeGreaterThan(0);
    expect(result.communication.message.body.length).toBeLessThan(result.communication.email.body.length);

    expect(result.communication.email.body).not.toContain("Situación:");
    expect(result.communication.email.body).not.toContain("Por qué importa:");
    expect(result.communication.email.body).not.toContain("Impactos posibles:");
    expect(result.communication.email.body).not.toContain("Intervención requerida:");

    expect(result.communication.email.body).toContain("gravedad fue evaluada por el usuario");
    expect(result.communication.email.body).toContain("alternativa");
    expect(result.communication.email.body).toContain("incertidumbre");
    assertInterventionPreserved(result.communication.email.body, ["compras", "alternativas contractuales", "plazos"]);
  });

  it("communication excludes PENDING and REJECTED content", async () => {
    const provider = new MockAIProvider();
    const valid = dynamicsItems().filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");
    const result = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative: "Caso de prueba",
      activeCanvasItems: valid,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    expect(result.communication.email.body).not.toContain("No consolidable");
    expect(result.communication.message.body).not.toContain("No consolidable");
  });

  it("production communication preserves uncertainty and avoids invented quantitative claims", async () => {
    const provider = new MockAIProvider();
    const valid = [
      item("ctx-p1", "CONTEXT", "Las líneas de producción tuvieron microcortes en tres turnos.", "FACT"),
      item("exp-p1", "EXPOSURE", "Varias áreas operativas intervienen en la resolución.", "FACT"),
      item("imp-p1", "IMPACT", "Existe riesgo de afectación operativa si no se estabiliza la situación.", "INFERENCE"),
      item("unc-p1", "UNCERTAINTY", "No hay evidencia suficiente para estimar probabilidad confiable.", "MISSING_INFORMATION"),
      item("int-p1", "INTERVENTION", "Definir si se habilita un análisis transversal y refuerzo de recolección de información.", "HUMAN_EVALUATION")
    ];

    const result = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Producción",
      initialNarrative: PRODUCCION_NARRATIVE,
      activeCanvasItems: valid,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: [],
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    expect(result.communication.email.body).toContain("incertidumbre");
    assertInterventionPreserved(result.communication.email.body, ["análisis transversal", "recolección de información"]);
    expect(result.communication.message.body).toContain("Incertidumbre");

    const combined = `${result.communication.email.body} ${result.communication.message.body}`.toLowerCase();
    expect(combined).not.toMatch(/\d+%/);
    expect(combined).not.toMatch(/probabilidad\s+de\s+\d/);
    expect(combined).not.toMatch(/fecha\s+(estimada|calculada)/);
  });

  it("editing communication updates flags and forces new review", async () => {
    const provider = new MockAIProvider();
    const valid = dynamicsItems().filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");
    const generated = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative:
        "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      activeCanvasItems: valid,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    const reviewed = markBriefAsReviewed(generated);
    const edited = updateCommunicationAsEdited(reviewed, "messageBody", "Texto exacto editado para mensaje.");

    expect(edited.status).toBe("EDITED_BY_USER");
    expect(edited.communication.message.body).toBe("Texto exacto editado para mensaje.");
    expect(edited.communication.message.editedByUser).toBe(true);
    expect(edited.reviewedByUser).toBe(false);
    expect(edited.reviewedAt).toBeNull();
    expect(edited.executive.severity.value).toBe(reviewed.executive.severity.value);
  });

  it("mark reviewed keeps BRIEF_DRAFT workflow external and sets reviewed fields", async () => {
    const provider = new MockAIProvider();
    const valid = dynamicsItems().filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");
    const generated = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative:
        "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      activeCanvasItems: valid,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    const gate = canMarkBriefAsReviewed({
      brief: generated,
      hasViewedExecutive: true,
      stale: false,
      hasMinimumCoverage: evaluateMinimumCoverage(valid).hasMinimumCoverage,
      openBlockers: 0,
      humanSeverity: "HIGH",
      generationError: false
    });

    expect(gate.allowed).toBe(true);

    const reviewed = markBriefAsReviewed(generated);
    expect(reviewed.status).toBe("REVIEWED_BY_USER");
    expect(reviewed.reviewedByUser).toBe(true);
    expect(reviewed.reviewedAt).not.toBeNull();
  });

  it("stale flag calculated from canvas updates", async () => {
    const provider = new MockAIProvider();
    const valid = dynamicsItems().filter((entry) => entry.validationStatus === "VALIDATED" || entry.validationStatus === "EDITED");
    const generated = await provider.generateBrief({
      caseId: CASE_ID,
      caseTitle: "Caso Dynamics",
      initialNarrative:
        "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
      activeCanvasItems: valid,
      humanSeverityAssessment: severity(),
      completedCriticalReview: completedReview(),
      openWarnings: completedReview().findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN"),
      contextualQuestionHistory: [],
      currentCaseStatus: "BRIEF_DRAFT"
    });

    const stale = calculateBriefStale(generated, [
      ...valid,
      {
        ...valid[0],
        updatedAt: new Date(Date.now() + 60_000).toISOString()
      }
    ]);

    expect(stale).toBe(true);
  });
});
