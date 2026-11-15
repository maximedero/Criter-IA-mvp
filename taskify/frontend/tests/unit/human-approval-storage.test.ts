import { afterEach, describe, expect, it } from "vitest";
import {
  clearHumanBriefApprovalsForTests,
  getHumanBriefApproval,
  removeHumanBriefApproval,
  saveHumanBriefApproval
} from "../../src/providers/storage/humanApprovalStorage";
import { createNotApprovedHumanBriefApproval, reevaluateAndCreateApproval } from "../../src/domain/workflow/humanApprovalWorkflow";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";
import type { DecisionBrief } from "../../src/domain/models/DecisionBrief";
import type { HumanSeverityAssessment } from "../../src/domain/models/HumanSeverityAssessment";

const CASE_ID = "case-approval-storage";

function item(id: string, dimension: CanvasItem["dimension"], content: string, epistemicType: CanvasItem["epistemicType"]): CanvasItem {
  const now = new Date().toISOString();
  return {
    id,
    caseId: CASE_ID,
    dimension,
    content,
    epistemicType,
    origin: "USER",
    validationStatus: "VALIDATED",
    createdAt: now,
    updatedAt: now
  };
}

function items(): CanvasItem[] {
  return [
    item("ctx-1", "CONTEXT", "ctx", "FACT"),
    item("exp-1", "EXPOSURE", "exp", "FACT"),
    item("imp-1", "IMPACT", "imp", "INFERENCE"),
    item("evi-1", "EVIDENCE", "evi", "FACT"),
    item("unc-1", "UNCERTAINTY", "unc", "MISSING_INFORMATION"),
    item("int-1", "INTERVENTION", "int", "HUMAN_EVALUATION")
  ];
}

function severity(): HumanSeverityAssessment {
  const now = new Date().toISOString();
  return {
    caseId: CASE_ID,
    severity: "HIGH",
    rationale: "r",
    assessedBy: "USER",
    assessedAt: now,
    updatedAt: now,
    status: "ASSESSED"
  };
}

function brief(version: number): DecisionBrief {
  const now = new Date().toISOString();
  return {
    id: `brief-${version}`,
    caseId: CASE_ID,
    version,
    status: "REVIEWED_BY_USER",
    executive: {
      situation: { content: "s", sourceItemIds: ["ctx-1"], hasSufficientInformation: true, limitations: [] },
      whyItMatters: { content: "w", sourceItemIds: ["exp-1"], hasSufficientInformation: true, limitations: [] },
      possibleImpacts: { content: "i", sourceItemIds: ["imp-1"], hasSufficientInformation: true, limitations: [] },
      evidence: { content: "e", sourceItemIds: ["evi-1"], hasSufficientInformation: true, limitations: [] },
      uncertainties: { content: "u", sourceItemIds: ["unc-1"], hasSufficientInformation: true, limitations: [] },
      scenariosAndAlternatives: {
        content: "No identificados con la evidencia disponible.",
        sourceItemIds: [],
        hasSufficientInformation: false,
        limitations: ["No se identificaron escenarios o alternativas válidas."]
      },
      severity: {
        value: "HIGH",
        label: "Alta",
        rationale: "r",
        assessedBy: "USER",
        assessedAt: now,
        notice: "Evaluación realizada por el usuario."
      },
      requiredIntervention: { content: "int", sourceItemIds: ["int-1"], hasSufficientInformation: true, limitations: [] }
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
      criticalReviewId: "review",
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

afterEach(() => {
  clearHumanBriefApprovalsForTests();
});

describe("human approval storage", () => {
  it("persists and reloads approval with snapshot", () => {
    const approvalResult = reevaluateAndCreateApproval({
      caseStatus: "BRIEF_DRAFT",
      activeItems: items(),
      criticalReviewComplete: true,
      openBlockers: 0,
      severityAssessment: severity(),
      brief: brief(2),
      stale: false
    });

    if (!approvalResult.allowed) {
      throw new Error("expected approval");
    }

    saveHumanBriefApproval(approvalResult.approval);

    const loaded = getHumanBriefApproval(CASE_ID);
    expect(loaded?.status).toBe("APPROVED");
    expect(loaded?.confirmedBriefVersion).toBe(2);
    expect(loaded?.checklistSnapshot.checks.length).toBe(17);
  });

  it("remove clears persisted approval", () => {
    const notApproved = createNotApprovedHumanBriefApproval(CASE_ID, brief(2));
    saveHumanBriefApproval(notApproved);
    expect(getHumanBriefApproval(CASE_ID)).not.toBeNull();

    removeHumanBriefApproval(CASE_ID);
    expect(getHumanBriefApproval(CASE_ID)).toBeNull();
  });
});
