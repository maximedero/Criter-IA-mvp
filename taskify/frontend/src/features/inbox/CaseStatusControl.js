import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CASE_STATUS_LABELS } from "../../domain/models/CaseStatus";
import { COVERAGE_DIMENSION_LABELS } from "../../domain/models/CoverageResult";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import { getBriefRecord } from "../../providers/storage/briefStorage";
import { canTransition } from "../../domain/workflow/caseStateMachine";
import { canAdvanceToHumanEvaluation } from "../../domain/workflow/humanSeverityWorkflow";
export function CaseStatusControl({ status, items, criticalReviewComplete, openBlockers, humanSeverity, onStatusChange }) {
    const coverage = evaluateMinimumCoverage(items);
    if (status === "CRITICAL_REVIEW") {
        const humanEvaluationTransition = canAdvanceToHumanEvaluation({
            currentStatus: "CRITICAL_REVIEW",
            criticalReviewComplete,
            hasMinimumCoverage: coverage.hasMinimumCoverage,
            openBlockers,
            humanSeverity
        });
        return (_jsxs("section", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", CASE_STATUS_LABELS[status]] }), humanEvaluationTransition.allowed ? (_jsxs(_Fragment, { children: [_jsx("p", { children: "Revisi\u00F3n completada. El caso puede avanzar a evaluaci\u00F3n humana." }), _jsx("button", { type: "button", onClick: () => onStatusChange("HUMAN_EVALUATION"), children: "Avanzar a evaluaci\u00F3n humana" })] })) : (_jsx("p", { children: "Revisi\u00F3n cr\u00EDtica pendiente." }))] }));
    }
    if (status === "BRIEF_DRAFT") {
        const hasBrief = getBriefRecord(items[0]?.caseId ?? "").current !== null;
        return (_jsxs("section", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", CASE_STATUS_LABELS[status]] }), _jsx("p", { children: "El caso est\u00E1 listo para preparar el brief." }), _jsx("p", { children: hasBrief ? "Existe un borrador de brief disponible para revisión." : "Todavía no hay un brief generado." })] }));
    }
    if (status === "READY_TO_ESCALATE") {
        return (_jsxs("section", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", CASE_STATUS_LABELS[status]] }), _jsx("p", { children: "El brief fue revisado y aprobado por el usuario." })] }));
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
