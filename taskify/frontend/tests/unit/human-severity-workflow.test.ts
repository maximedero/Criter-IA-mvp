import { describe, expect, it } from "vitest";
import { TRANSITION_BLOCKERS } from "../../src/domain/workflow/caseStateMachine";
import { canAdvanceToBriefDraft, canAdvanceToHumanEvaluation } from "../../src/domain/workflow/humanSeverityWorkflow";

describe("humanSeverityWorkflow", () => {
  it("blocks CRITICAL_REVIEW -> HUMAN_EVALUATION when review incomplete", () => {
    const result = canAdvanceToHumanEvaluation({
      currentStatus: "CRITICAL_REVIEW",
      criticalReviewComplete: false,
      hasMinimumCoverage: true,
      openBlockers: 0,
      humanSeverity: "UNASSESSED"
    });

    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.CRITICAL_REVIEW_INCOMPLETE);
  });

  it("blocks CRITICAL_REVIEW -> HUMAN_EVALUATION when open blocker exists", () => {
    const result = canAdvanceToHumanEvaluation({
      currentStatus: "CRITICAL_REVIEW",
      criticalReviewComplete: true,
      hasMinimumCoverage: true,
      openBlockers: 1,
      humanSeverity: "UNASSESSED"
    });

    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.CRITICAL_BLOCKERS_PRESENT);
  });

  it("blocks CRITICAL_REVIEW -> HUMAN_EVALUATION when coverage is below minimum", () => {
    const result = canAdvanceToHumanEvaluation({
      currentStatus: "CRITICAL_REVIEW",
      criticalReviewComplete: true,
      hasMinimumCoverage: false,
      openBlockers: 0,
      humanSeverity: "UNASSESSED"
    });

    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.MINIMUM_COVERAGE_NOT_REACHED);
  });

  it("allows CRITICAL_REVIEW -> HUMAN_EVALUATION when review complete, coverage ok and no blockers", () => {
    const result = canAdvanceToHumanEvaluation({
      currentStatus: "CRITICAL_REVIEW",
      criticalReviewComplete: true,
      hasMinimumCoverage: true,
      openBlockers: 0,
      humanSeverity: "UNASSESSED"
    });

    expect(result.allowed).toBe(true);
  });

  it("blocks HUMAN_EVALUATION -> BRIEF_DRAFT when severity is UNASSESSED with existing blocker code", () => {
    const result = canAdvanceToBriefDraft({
      currentStatus: "HUMAN_EVALUATION",
      criticalReviewComplete: true,
      hasMinimumCoverage: true,
      openBlockers: 0,
      humanSeverity: "UNASSESSED"
    });

    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.HUMAN_SEVERITY_UNASSESSED);
  });

  it("allows HUMAN_EVALUATION -> BRIEF_DRAFT when severity HIGH and all gates pass", () => {
    const result = canAdvanceToBriefDraft({
      currentStatus: "HUMAN_EVALUATION",
      criticalReviewComplete: true,
      hasMinimumCoverage: true,
      openBlockers: 0,
      humanSeverity: "HIGH"
    });

    expect(result.allowed).toBe(true);
  });

  it("warnings do not block BRIEF_DRAFT gate when blockers are zero", () => {
    const result = canAdvanceToBriefDraft({
      currentStatus: "HUMAN_EVALUATION",
      criticalReviewComplete: true,
      hasMinimumCoverage: true,
      openBlockers: 0,
      humanSeverity: "MEDIUM"
    });

    expect(result.allowed).toBe(true);
  });
});
