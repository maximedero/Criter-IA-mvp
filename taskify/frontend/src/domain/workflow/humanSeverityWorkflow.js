import { TRANSITION_BLOCKERS, canTransition } from "./caseStateMachine";
function addIfMissing(target, blocker) {
    if (!target.includes(blocker)) {
        target.push(blocker);
    }
}
export function canAdvanceToHumanEvaluation(context) {
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
export function canAdvanceToBriefDraft(context) {
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
