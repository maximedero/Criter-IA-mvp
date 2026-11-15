import { evaluateApprovalReadiness } from "../rules/readyToElevateRules";
import { canTransition } from "./caseStateMachine";
export const HUMAN_APPROVAL_ERRORS = {
    CONDITIONS_CHANGED: "Las condiciones cambiaron y el brief ya no puede aprobarse.",
    STORAGE_ERROR: "No se pudo guardar la aprobación.",
    TRANSITION_ERROR: "No se pudo completar la transición a Listo para elevar."
};
function nowIso() {
    return new Date().toISOString();
}
function toSnapshot(ready) {
    return {
        ready: ready.ready,
        checks: ready.checks,
        blockers: ready.blockers,
        evaluatedAt: nowIso()
    };
}
export function createNotApprovedHumanBriefApproval(caseId, brief) {
    const now = nowIso();
    return {
        caseId,
        briefId: brief.id,
        briefVersion: brief.version,
        status: "NOT_APPROVED",
        approvedBy: "USER",
        approvedAt: null,
        confirmedBriefVersion: null,
        checklistSnapshot: {
            ready: false,
            checks: [],
            blockers: [],
            evaluatedAt: now
        },
        createdAt: now,
        updatedAt: now
    };
}
export function approvalAppliesToBrief(approval, brief) {
    if (!approval || !brief) {
        return false;
    }
    return (approval.status === "APPROVED" &&
        approval.briefId === brief.id &&
        approval.confirmedBriefVersion === brief.version);
}
export function reevaluateAndCreateApproval(input) {
    const readiness = evaluateApprovalReadiness({
        caseStatus: input.caseStatus,
        activeItems: input.activeItems,
        criticalReviewComplete: input.criticalReviewComplete,
        openBlockers: input.openBlockers,
        severityAssessment: input.severityAssessment,
        brief: input.brief,
        stale: input.stale
    });
    if (!readiness.ready || !input.brief) {
        return {
            allowed: false,
            message: HUMAN_APPROVAL_ERRORS.CONDITIONS_CHANGED,
            readiness
        };
    }
    const now = nowIso();
    const approval = {
        caseId: input.brief.caseId,
        briefId: input.brief.id,
        briefVersion: input.brief.version,
        status: "APPROVED",
        approvedBy: "USER",
        approvedAt: now,
        confirmedBriefVersion: input.brief.version,
        checklistSnapshot: toSnapshot(readiness),
        createdAt: now,
        updatedAt: now
    };
    return {
        allowed: true,
        approval,
        readiness
    };
}
export function canTransitionToReadyWithHumanApproval(input) {
    return canTransition(input.caseStatus, "READY_TO_ESCALATE", {
        hasUserValidatedOrEditedItem: true,
        hasMinimumCoverage: input.hasMinimumCoverage,
        startCriticalReviewRequested: true,
        criticalReviewComplete: input.criticalReviewComplete,
        criticalBlockers: input.openBlockers,
        humanSeverity: input.severity,
        briefExists: input.briefExists,
        briefReviewed: input.briefReviewed,
        humanApproved: input.humanApproved
    });
}
