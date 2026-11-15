import type { HumanSeverity } from "../models/CaseStatus";
import { TRANSITION_BLOCKERS, canTransition, type TransitionBlockerCode, type TransitionResult } from "./caseStateMachine";

type HumanWorkflowContext = {
  currentStatus: "CRITICAL_REVIEW" | "HUMAN_EVALUATION";
  hasMinimumCoverage: boolean;
  criticalReviewComplete: boolean;
  openBlockers: number;
  humanSeverity: HumanSeverity;
};

function addIfMissing(target: TransitionBlockerCode[], blocker: TransitionBlockerCode): void {
  if (!target.includes(blocker)) {
    target.push(blocker);
  }
}

export function canAdvanceToHumanEvaluation(context: HumanWorkflowContext): TransitionResult {
  const transition = canTransition(context.currentStatus, "HUMAN_EVALUATION", {
    hasUserValidatedOrEditedItem: true,
    hasMinimumCoverage: context.hasMinimumCoverage,
    startCriticalReviewRequested: true,
    criticalReviewComplete: context.criticalReviewComplete,
    criticalBlockers: context.openBlockers,
    humanSeverity: context.humanSeverity,
    briefExists: false,
    briefReviewed: false,
    humanApproved: false
  });

  const blockers = [...transition.blockers];

  if (!context.hasMinimumCoverage) {
    addIfMissing(blockers, TRANSITION_BLOCKERS.MINIMUM_COVERAGE_NOT_REACHED);
  }

  if (context.openBlockers > 0) {
    addIfMissing(blockers, TRANSITION_BLOCKERS.CRITICAL_BLOCKERS_PRESENT);
  }

  return {
    allowed: blockers.length === 0,
    blockers
  };
}

export function canAdvanceToBriefDraft(context: HumanWorkflowContext): TransitionResult {
  const transition = canTransition(context.currentStatus, "BRIEF_DRAFT", {
    hasUserValidatedOrEditedItem: true,
    hasMinimumCoverage: context.hasMinimumCoverage,
    startCriticalReviewRequested: true,
    criticalReviewComplete: context.criticalReviewComplete,
    criticalBlockers: context.openBlockers,
    humanSeverity: context.humanSeverity,
    briefExists: false,
    briefReviewed: false,
    humanApproved: false
  });

  const blockers = [...transition.blockers];

  if (!context.criticalReviewComplete) {
    addIfMissing(blockers, TRANSITION_BLOCKERS.CRITICAL_REVIEW_INCOMPLETE);
  }

  if (!context.hasMinimumCoverage) {
    addIfMissing(blockers, TRANSITION_BLOCKERS.MINIMUM_COVERAGE_NOT_REACHED);
  }

  if (context.openBlockers > 0) {
    addIfMissing(blockers, TRANSITION_BLOCKERS.CRITICAL_BLOCKERS_PRESENT);
  }

  return {
    allowed: blockers.length === 0,
    blockers
  };
}
