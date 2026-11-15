import { describe, expect, it } from "vitest";
import { canTransition, TRANSITION_BLOCKERS } from "../../src/domain/workflow/caseStateMachine";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";
import type { DecisionBrief } from "../../src/domain/models/DecisionBrief";
import type { HumanSeverityAssessment } from "../../src/domain/models/HumanSeverityAssessment";
import {
  HUMAN_APPROVAL_ERRORS,
  approvalAppliesToBrief,
  canTransitionToReadyWithHumanApproval,
  createNotApprovedHumanBriefApproval,
  reevaluateAndCreateApproval
} from "../../src/domain/workflow/humanApprovalWorkflow";
import { evaluateApprovalReadiness } from "../../src/domain/rules/readyToElevateRules";

const CASE_ID = "case-approval";

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

function baseItems(): CanvasItem[] {
  return [
    item("ctx-1", "CONTEXT", "El contrato con el proveedor venció el 31/10/2026.", "FACT"),
    item("ctx-2", "CONTEXT", "El proveedor continúa únicamente hasta finalizar el proyecto actual.", "FACT", "EDITED"),
    item("exp-1", "EXPOSURE", "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT"),
    item("imp-1", "IMPACT", "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", "INFERENCE"),
    item("evi-1", "EVIDENCE", "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", "FACT"),
    item("unc-1", "UNCERTAINTY", "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION"),
    item("int-1", "INTERVENTION", "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.", "HUMAN_EVALUATION")
  ];
}

function severity(): HumanSeverityAssessment {
  const now = new Date().toISOString();
  return {
    caseId: CASE_ID,
    severity: "HIGH",
    rationale: "rationale",
    assessedBy: "USER",
    assessedAt: now,
    updatedAt: now,
    status: "ASSESSED"
  };
}

function reviewedBrief(version = 2): DecisionBrief {
  const now = new Date().toISOString();
  return {
    id: `brief-${version}`,
    caseId: CASE_ID,
    version,
    status: "REVIEWED_BY_USER",
    executive: {
      situation: { content: "Situación", sourceItemIds: ["ctx-1"], hasSufficientInformation: true, limitations: [] },
      whyItMatters: { content: "Exposición", sourceItemIds: ["exp-1"], hasSufficientInformation: true, limitations: [] },
      possibleImpacts: { content: "Impacto", sourceItemIds: ["imp-1"], hasSufficientInformation: true, limitations: [] },
      evidence: { content: "Evidencia", sourceItemIds: ["evi-1"], hasSufficientInformation: true, limitations: [] },
      uncertainties: { content: "Incertidumbres", sourceItemIds: ["unc-1"], hasSufficientInformation: true, limitations: [] },
      scenariosAndAlternatives: {
        content: "No identificados con la evidencia disponible.",
        sourceItemIds: [],
        hasSufficientInformation: false,
        limitations: ["No se identificaron escenarios o alternativas válidas."]
      },
      severity: {
        value: "HIGH",
        label: "Alta",
        rationale: "rationale",
        assessedBy: "USER",
        assessedAt: now,
        notice: "Evaluación realizada por el usuario."
      },
      requiredIntervention: { content: "Intervención", sourceItemIds: ["int-1"], hasSufficientInformation: true, limitations: [] }
    },
    expanded: {
      facts: [],
      inferences: [],
      assumptions: [],
      missingInformation: [],
      humanEvaluations: [],
      evidenceItems: [],
      openWarnings: [],
      resolvedFindings: [],
      sources: [],
      generationLimitations: []
    },
    traceability: {
      sectionSources: {
        situation: ["ctx-1"],
        whyItMatters: ["exp-1"],
        possibleImpacts: ["imp-1"],
        evidence: ["evi-1"],
        uncertainties: ["unc-1"],
        scenariosAndAlternatives: [],
        requiredIntervention: ["int-1"]
      },
      severityAssessmentRef: `${CASE_ID}:severity`,
      criticalReviewId: "review-1",
      generatedFromCanvasUpdatedAt: now,
      generationProvider: "MockAIProvider",
      generationTimestamp: now,
      editedSections: [],
      userReviewTimestamp: now
    },
    generatedBy: "AI",
    reviewedByUser: true,
    createdAt: now,
    updatedAt: now,
    reviewedAt: now
  };
}

describe("slice10 human approval workflow", () => {
  it("initial human approval is NOT_APPROVED with null approvedAt", () => {
    const created = createNotApprovedHumanBriefApproval(CASE_ID, reviewedBrief(2));
    expect(created.status).toBe("NOT_APPROVED");
    expect(created.approvedBy).toBe("USER");
    expect(created.approvedAt).toBeNull();
    expect(created.confirmedBriefVersion).toBeNull();
  });

  it("readiness requires all checklist checks and has no score/percent", () => {
    const readiness = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: reviewedBrief(2),
      stale: false
    });

    expect(readiness.checks).toHaveLength(17);
    expect(readiness.ready).toBe(true);
    expect((readiness as unknown as Record<string, unknown>).score).toBeUndefined();
    expect((readiness as unknown as Record<string, unknown>).percentage).toBeUndefined();
  });

  it("coverage 5/6 blocks readiness", () => {
    const items = baseItems().filter((entry) => entry.dimension !== "INTERVENTION");
    const readiness = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: items,
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: reviewedBrief(2),
      stale: false
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.some((blocker) => blocker.id === "F" || blocker.id === "G")).toBe(true);
  });

  it("review completion, blockers and human severity are required", () => {
    const pendingReview = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: false,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: reviewedBrief(2),
      stale: false
    });

    const blockerOpen = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 1,
      severityAssessment: severity(),
      brief: reviewedBrief(2),
      stale: false
    });

    const severityUnassessed = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: { ...severity(), severity: "UNASSESSED", status: "UNASSESSED" },
      brief: reviewedBrief(2),
      stale: false
    });

    expect(pendingReview.ready).toBe(false);
    expect(blockerOpen.ready).toBe(false);
    expect(severityUnassessed.ready).toBe(false);
  });

  it("assessedBy USER is required", () => {
    const readiness = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: { ...severity(), assessedBy: "USER" },
      brief: reviewedBrief(2),
      stale: false
    });

    expect(readiness.ready).toBe(true);
    expect(readiness.checks.find((entry) => entry.id === "K")?.passed).toBe(true);
  });

  it("brief existence, stale=false, reviewedByUser=true and REVIEWED_BY_USER are required", () => {
    const missingBrief = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: null,
      stale: false
    });

    const staleBrief = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: reviewedBrief(2),
      stale: true
    });

    const notReviewed = evaluateApprovalReadiness({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: { ...reviewedBrief(2), reviewedByUser: false, status: "GENERATED", reviewedAt: null },
      stale: false
    });

    expect(missingBrief.ready).toBe(false);
    expect(staleBrief.ready).toBe(false);
    expect(notReviewed.ready).toBe(false);
  });

  it("case status BRIEF_DRAFT is required", () => {
    const readiness = evaluateApprovalReadiness({
      caseStatus: "READY_TO_ESCALATE",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: reviewedBrief(2),
      stale: false
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.some((blocker) => blocker.id === "Q")).toBe(true);
  });

  it("approval creation registers brief id/version/user/approvedAt and checklist snapshot", () => {
    const result = reevaluateAndCreateApproval({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: reviewedBrief(2),
      stale: false
    });

    expect(result.allowed).toBe(true);
    if (!result.allowed) {
      throw new Error("expected allowed result");
    }

    expect(result.approval.briefId).toBe("brief-2");
    expect(result.approval.briefVersion).toBe(2);
    expect(result.approval.approvedBy).toBe("USER");
    expect(result.approval.approvedAt).not.toBeNull();
    expect(result.approval.confirmedBriefVersion).toBe(2);
    expect(result.approval.checklistSnapshot.checks).toHaveLength(17);
  });

  it("reevaluation blocks approval when stale during confirmation", () => {
    const result = reevaluateAndCreateApproval({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: reviewedBrief(2),
      stale: true
    });

    expect(result.allowed).toBe(false);
    if (result.allowed) {
      throw new Error("expected blocked result");
    }

    expect(result.message).toBe(HUMAN_APPROVAL_ERRORS.CONDITIONS_CHANGED);
  });

  it("approved v1 does not apply to v2", () => {
    const approvedResult = reevaluateAndCreateApproval({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: reviewedBrief(1),
      stale: false
    });

    if (!approvedResult.allowed) {
      throw new Error("expected allowed result");
    }

    const appliesToV1 = approvalAppliesToBrief(approvedResult.approval, reviewedBrief(1));
    const appliesToV2 = approvalAppliesToBrief(approvedResult.approval, reviewedBrief(2));

    expect(appliesToV1).toBe(true);
    expect(appliesToV2).toBe(false);
  });

  it("state machine blocks ready when humanApproved=false and allows when true with all gates", () => {
    const blocked = canTransition("BRIEF_DRAFT", "READY_TO_ESCALATE", {
      hasUserValidatedOrEditedItem: true,
      hasMinimumCoverage: true,
      startCriticalReviewRequested: true,
      criticalReviewComplete: true,
      criticalBlockers: 0,
      humanSeverity: "HIGH",
      briefExists: true,
      briefReviewed: true,
      humanApproved: false
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.blockers).toContain(TRANSITION_BLOCKERS.HUMAN_APPROVAL_REQUIRED);

    const allowed = canTransitionToReadyWithHumanApproval({
      caseStatus: "BRIEF_DRAFT",
      hasMinimumCoverage: true,
      criticalReviewComplete: true,
      openBlockers: 0,
      severity: "HIGH",
      briefExists: true,
      briefReviewed: true,
      humanApproved: true
    });

    expect(allowed.allowed).toBe(true);
  });

  it("transition remains sequential only BRIEF_DRAFT -> READY_TO_ESCALATE", () => {
    const direct = canTransition("HUMAN_EVALUATION", "READY_TO_ESCALATE", {
      hasUserValidatedOrEditedItem: true,
      hasMinimumCoverage: true,
      startCriticalReviewRequested: true,
      criticalReviewComplete: true,
      criticalBlockers: 0,
      humanSeverity: "HIGH",
      briefExists: true,
      briefReviewed: true,
      humanApproved: true
    });

    expect(direct.allowed).toBe(false);
    expect(direct.blockers).toContain(TRANSITION_BLOCKERS.NON_SEQUENTIAL_TRANSITION);
  });

  it("approval workflow does not alter brief content or severity", () => {
    const brief = reviewedBrief(2);
    const severityValue = severity();

    const result = reevaluateAndCreateApproval({
      caseStatus: "BRIEF_DRAFT",
      activeItems: baseItems(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severityValue,
      brief,
      stale: false
    });

    if (!result.allowed) {
      throw new Error("expected allowed result");
    }

    expect(brief.executive.situation.content).toBe("Situación");
    expect(severityValue.severity).toBe("HIGH");
  });
});
