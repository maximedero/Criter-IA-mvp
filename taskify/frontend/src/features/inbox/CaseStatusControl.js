import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CASE_STATUS_LABELS } from "../../domain/models/CaseStatus";
import { COVERAGE_DIMENSION_LABELS } from "../../domain/models/CoverageResult";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import { canTransition } from "../../domain/workflow/caseStateMachine";
export function CaseStatusControl({ status, items, onStatusChange }) {
    const coverage = evaluateMinimumCoverage(items);
    if (status === "CRITICAL_REVIEW") {
        return (_jsxs("section", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", CASE_STATUS_LABELS[status]] }), _jsx("p", { children: "Revisi\u00F3n cr\u00EDtica pendiente." })] }));
    }
    if (status !== "IN_ANALYSIS") {
        return (_jsx("section", { children: _jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", CASE_STATUS_LABELS[status]] }) }));
    }
    const transition = canTransition("IN_ANALYSIS", "CRITICAL_REVIEW", {
        hasUserValidatedOrEditedItem: true,
        hasMinimumCoverage: coverage.hasMinimumCoverage,
        startCriticalReviewRequested: true,
        criticalReviewComplete: false,
        criticalBlockers: 0,
        humanSeverity: "UNASSESSED",
        briefExists: false,
        briefReviewed: false,
        humanApproved: false
    });
    return (_jsxs("section", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", CASE_STATUS_LABELS[status]] }), coverage.hasMinimumCoverage ? (_jsx("button", { type: "button", onClick: () => {
                    if (transition.allowed) {
                        onStatusChange("CRITICAL_REVIEW");
                    }
                }, children: "Iniciar revisi\u00F3n" })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: "Faltan dimensiones para cobertura m\u00EDnima." }), _jsx("ul", { children: coverage.missingDimensions.map((dimension) => (_jsx("li", { children: COVERAGE_DIMENSION_LABELS[dimension] }, dimension))) })] }))] }));
}
