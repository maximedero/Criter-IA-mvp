import { describe, expect, it } from "vitest";
import { canTransition, TRANSITION_BLOCKERS, type WorkflowContext } from "../../src/domain/workflow/caseStateMachine";

function context(partial?: Partial<WorkflowContext>): WorkflowContext {
  return {
    hasUserValidatedOrEditedItem: false,
    hasMinimumCoverage: false,
    startCriticalReviewRequested: false,
    criticalReviewComplete: false,
    criticalBlockers: 0,
    humanSeverity: "UNASSESSED",
    briefExists: false,
    briefReviewed: false,
    humanApproved: false,
    ...partial
  };
}

describe("caseStateMachine", () => {
  it("NEW -> DRAFT allowed", () => {
    const result = canTransition("NEW", "DRAFT", context());
    expect(result.allowed).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });

  it("DRAFT -> IN_ANALYSIS blocked without valid user item", () => {
    const result = canTransition("DRAFT", "IN_ANALYSIS", context({ hasUserValidatedOrEditedItem: false }));
    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.MISSING_USER_VALIDATED_CONTENT);
  });

  it("DRAFT -> IN_ANALYSIS allowed with USER/VALIDATED item", () => {
    const result = canTransition("DRAFT", "IN_ANALYSIS", context({ hasUserValidatedOrEditedItem: true }));
    expect(result.allowed).toBe(true);
  });

  it("IN_ANALYSIS -> CRITICAL_REVIEW blocked with coverage 5/6", () => {
    const result = canTransition(
      "IN_ANALYSIS",
      "CRITICAL_REVIEW",
      context({ hasMinimumCoverage: false, startCriticalReviewRequested: true })
    );
    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.MINIMUM_COVERAGE_NOT_REACHED);
  });

  it("IN_ANALYSIS -> CRITICAL_REVIEW allowed with coverage 6/6 and explicit action", () => {
    const result = canTransition(
      "IN_ANALYSIS",
      "CRITICAL_REVIEW",
      context({ hasMinimumCoverage: true, startCriticalReviewRequested: true })
    );
    expect(result.allowed).toBe(true);
  });

  it("DRAFT -> READY_TO_ESCALATE blocked", () => {
    const result = canTransition("DRAFT", "READY_TO_ESCALATE", context());
    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.NON_SEQUENTIAL_TRANSITION);
  });

  it("CRITICAL_REVIEW -> HUMAN_EVALUATION blocked when criticalReviewComplete=false", () => {
    const result = canTransition(
      "CRITICAL_REVIEW",
      "HUMAN_EVALUATION",
      context({ criticalReviewComplete: false })
    );
    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.CRITICAL_REVIEW_INCOMPLETE);
  });

  it("BRIEF_DRAFT -> READY_TO_ESCALATE blocked when humanApproved=false", () => {
    const result = canTransition(
      "BRIEF_DRAFT",
      "READY_TO_ESCALATE",
      context({
        hasMinimumCoverage: true,
        criticalReviewComplete: true,
        criticalBlockers: 0,
        humanSeverity: "LOW",
        briefExists: true,
        briefReviewed: true,
        humanApproved: false
      })
    );
    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(TRANSITION_BLOCKERS.HUMAN_APPROVAL_REQUIRED);
  });

  it("non sequential transitions are blocked", () => {
    const one = canTransition("IN_ANALYSIS", "BRIEF_DRAFT", context());
    const two = canTransition("CRITICAL_REVIEW", "READY_TO_ESCALATE", context());

    expect(one.allowed).toBe(false);
    expect(two.allowed).toBe(false);
    expect(one.blockers).toContain(TRANSITION_BLOCKERS.NON_SEQUENTIAL_TRANSITION);
    expect(two.blockers).toContain(TRANSITION_BLOCKERS.NON_SEQUENTIAL_TRANSITION);
  });
});
