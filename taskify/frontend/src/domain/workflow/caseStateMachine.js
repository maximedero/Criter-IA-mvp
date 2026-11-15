export const TRANSITION_BLOCKERS = {
    NON_SEQUENTIAL_TRANSITION: "NON_SEQUENTIAL_TRANSITION",
    MISSING_USER_VALIDATED_CONTENT: "MISSING_USER_VALIDATED_CONTENT",
    MINIMUM_COVERAGE_NOT_REACHED: "MINIMUM_COVERAGE_NOT_REACHED",
    USER_ACTION_REQUIRED_START_REVIEW: "USER_ACTION_REQUIRED_START_REVIEW",
    CRITICAL_REVIEW_INCOMPLETE: "CRITICAL_REVIEW_INCOMPLETE",
    HUMAN_SEVERITY_UNASSESSED: "HUMAN_SEVERITY_UNASSESSED",
    CRITICAL_BLOCKERS_PRESENT: "CRITICAL_BLOCKERS_PRESENT",
    BRIEF_NOT_EXISTS: "BRIEF_NOT_EXISTS",
    BRIEF_NOT_REVIEWED: "BRIEF_NOT_REVIEWED",
    HUMAN_APPROVAL_REQUIRED: "HUMAN_APPROVAL_REQUIRED"
};
const ORDERED_FLOW = [
    "NEW",
    "DRAFT",
    "IN_ANALYSIS",
    "CRITICAL_REVIEW",
    "HUMAN_EVALUATION",
    "BRIEF_DRAFT",
    "READY_TO_ESCALATE"
];
function isSequentialTransition(currentStatus, targetStatus) {
    const currentIndex = ORDERED_FLOW.indexOf(currentStatus);
    const targetIndex = ORDERED_FLOW.indexOf(targetStatus);
    return currentIndex >= 0 && targetIndex === currentIndex + 1;
}
export function canTransition(currentStatus, targetStatus, workflowContext) {
    const blockers = [];
    if (!isSequentialTransition(currentStatus, targetStatus)) {
        return {
            allowed: false,
            blockers: [TRANSITION_BLOCKERS.NON_SEQUENTIAL_TRANSITION]
        };
    }
    if (currentStatus === "NEW" && targetStatus === "DRAFT") {
        return { allowed: true, blockers };
    }
    if (currentStatus === "DRAFT" && targetStatus === "IN_ANALYSIS") {
        if (!workflowContext.hasUserValidatedOrEditedItem) {
            blockers.push(TRANSITION_BLOCKERS.MISSING_USER_VALIDATED_CONTENT);
        }
        return { allowed: blockers.length === 0, blockers };
    }
    if (currentStatus === "IN_ANALYSIS" && targetStatus === "CRITICAL_REVIEW") {
        if (!workflowContext.hasMinimumCoverage) {
            blockers.push(TRANSITION_BLOCKERS.MINIMUM_COVERAGE_NOT_REACHED);
        }
        if (!workflowContext.startCriticalReviewRequested) {
            blockers.push(TRANSITION_BLOCKERS.USER_ACTION_REQUIRED_START_REVIEW);
        }
        return { allowed: blockers.length === 0, blockers };
    }
    if (currentStatus === "CRITICAL_REVIEW" && targetStatus === "HUMAN_EVALUATION") {
        if (!workflowContext.criticalReviewComplete) {
            blockers.push(TRANSITION_BLOCKERS.CRITICAL_REVIEW_INCOMPLETE);
        }
        return { allowed: blockers.length === 0, blockers };
    }
    if (currentStatus === "HUMAN_EVALUATION" && targetStatus === "BRIEF_DRAFT") {
        if (workflowContext.humanSeverity === "UNASSESSED") {
            blockers.push(TRANSITION_BLOCKERS.HUMAN_SEVERITY_UNASSESSED);
        }
        return { allowed: blockers.length === 0, blockers };
    }
    if (currentStatus === "BRIEF_DRAFT" && targetStatus === "READY_TO_ESCALATE") {
        if (!workflowContext.hasMinimumCoverage) {
            blockers.push(TRANSITION_BLOCKERS.MINIMUM_COVERAGE_NOT_REACHED);
        }
        if (!workflowContext.criticalReviewComplete) {
            blockers.push(TRANSITION_BLOCKERS.CRITICAL_REVIEW_INCOMPLETE);
        }
        if (workflowContext.criticalBlockers > 0) {
            blockers.push(TRANSITION_BLOCKERS.CRITICAL_BLOCKERS_PRESENT);
        }
        if (workflowContext.humanSeverity === "UNASSESSED") {
            blockers.push(TRANSITION_BLOCKERS.HUMAN_SEVERITY_UNASSESSED);
        }
        if (!workflowContext.briefExists) {
            blockers.push(TRANSITION_BLOCKERS.BRIEF_NOT_EXISTS);
        }
        if (!workflowContext.briefReviewed) {
            blockers.push(TRANSITION_BLOCKERS.BRIEF_NOT_REVIEWED);
        }
        if (!workflowContext.humanApproved) {
            blockers.push(TRANSITION_BLOCKERS.HUMAN_APPROVAL_REQUIRED);
        }
        return { allowed: blockers.length === 0, blockers };
    }
    return {
        allowed: false,
        blockers: [TRANSITION_BLOCKERS.NON_SEQUENTIAL_TRANSITION]
    };
}
