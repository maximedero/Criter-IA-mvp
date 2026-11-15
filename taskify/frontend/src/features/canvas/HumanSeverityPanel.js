import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { COVERAGE_DIMENSION_LABELS } from "../../domain/models/CoverageResult";
import { TRANSITION_BLOCKERS } from "../../domain/workflow/caseStateMachine";
import { canAdvanceToBriefDraft } from "../../domain/workflow/humanSeverityWorkflow";
import { getHumanSeverityAssessment, saveHumanSeverityAssessment } from "../../providers/storage/humanSeverityStorage";
import { HUMAN_SEVERITY_LABELS } from "../../domain/models/HumanSeverityAssessment";
const SEVERITY_OPTIONS = ["UNASSESSED", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
export function HumanSeverityPanel({ caseId, caseStatus, criticalReviewComplete, hasMinimumCoverage, missingCoverageLabels, openBlockers, openWarnings, onSaved, onContinueToBriefDraft }) {
    const persisted = useMemo(() => getHumanSeverityAssessment(caseId), [caseId]);
    const [severity, setSeverity] = useState(persisted.severity);
    const [savedSeverity, setSavedSeverity] = useState(persisted.severity);
    const [rationale, setRationale] = useState(persisted.rationale ?? "");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        const current = getHumanSeverityAssessment(caseId);
        setSeverity(current.severity);
        setSavedSeverity(current.severity);
        setRationale(current.rationale ?? "");
        setMessage(null);
        setError(null);
    }, [caseId]);
    const canEdit = caseStatus === "HUMAN_EVALUATION" && criticalReviewComplete && hasMinimumCoverage && openBlockers === 0;
    if (caseStatus !== "HUMAN_EVALUATION") {
        return null;
    }
    const transition = canAdvanceToBriefDraft({
        currentStatus: "HUMAN_EVALUATION",
        criticalReviewComplete,
        hasMinimumCoverage,
        openBlockers,
        humanSeverity: savedSeverity
    });
    const tryContinue = () => {
        setError(null);
        setMessage(null);
        if (!transition.allowed) {
            if (transition.blockers.includes(TRANSITION_BLOCKERS.HUMAN_SEVERITY_UNASSESSED)) {
                setError("Seleccioná una gravedad antes de continuar.");
                return;
            }
            if (!criticalReviewComplete) {
                setError("Completá la revisión crítica antes de evaluar la gravedad.");
                return;
            }
            if (!hasMinimumCoverage) {
                setError("Faltan dimensiones para cobertura mínima.");
                return;
            }
            if (openBlockers > 0) {
                setError("No podés continuar mientras existan bloqueos críticos abiertos.");
                return;
            }
            setError("No se puede continuar por reglas del workflow.");
            return;
        }
        onContinueToBriefDraft();
    };
    const save = () => {
        setError(null);
        setMessage(null);
        if (!canEdit) {
            if (!criticalReviewComplete) {
                setError("Completá la revisión crítica antes de evaluar la gravedad.");
                return;
            }
            if (!hasMinimumCoverage) {
                setError("Faltan dimensiones para cobertura mínima.");
                return;
            }
            if (openBlockers > 0) {
                setError("No podés evaluar la gravedad mientras existan bloqueos críticos abiertos.");
                return;
            }
            setError("La evaluación humana no está habilitada en este estado.");
            return;
        }
        const payload = {
            caseId,
            severity,
            rationale
        };
        try {
            const saved = saveHumanSeverityAssessment(payload);
            setSeverity(saved.severity);
            setSavedSeverity(saved.severity);
            setRationale(saved.rationale ?? "");
            setMessage("Evaluación guardada.");
            onSaved(saved);
        }
        catch {
            setError("No se pudo guardar la evaluación.");
        }
    };
    return (_jsxs("section", { "aria-label": "Evaluaci\u00F3n humana de gravedad", children: [_jsx("h4", { children: "EVALUACI\u00D3N HUMANA DE GRAVEDAD" }), _jsx("p", { children: "Esta evaluaci\u00F3n debe ser realizada por una persona. La IA no asigna ni recomienda la gravedad." }), _jsx("p", { children: "Evaluaci\u00F3n realizada por el usuario." }), openWarnings > 0 ? _jsxs("p", { children: ["Advertencias abiertas: ", openWarnings] }) : null, !criticalReviewComplete ? _jsx("p", { children: "Complet\u00E1 la revisi\u00F3n cr\u00EDtica antes de evaluar la gravedad." }) : null, !hasMinimumCoverage ? (_jsxs(_Fragment, { children: [_jsx("p", { children: "Faltan dimensiones para cobertura m\u00EDnima." }), _jsx("ul", { children: missingCoverageLabels.map((label) => (_jsx("li", { children: label }, label))) })] })) : null, openBlockers > 0 ? _jsx("p", { children: "No pod\u00E9s evaluar la gravedad mientras existan bloqueos cr\u00EDticos abiertos." }) : null, _jsxs("p", { children: [_jsx("strong", { children: "Gravedad:" }), " ", HUMAN_SEVERITY_LABELS[severity]] }), severity === "UNASSESSED" ? (_jsx("p", { children: "No se puede preparar el brief hasta que el usuario complete esta evaluaci\u00F3n." })) : null, _jsxs("fieldset", { disabled: !canEdit, children: [_jsx("legend", { children: "Gravedad del riesgo" }), SEVERITY_OPTIONS.map((option) => (_jsxs("label", { children: [_jsx("input", { type: "radio", name: "human-severity", value: option, checked: severity === option, onChange: () => setSeverity(option) }), HUMAN_SEVERITY_LABELS[option]] }, option)))] }), _jsxs("label", { children: ["Fundamento de la evaluaci\u00F3n (opcional)", _jsx("textarea", { value: rationale, onChange: (event) => setRationale(event.target.value), disabled: !canEdit })] }), _jsx("button", { type: "button", onClick: save, disabled: !canEdit, children: "Guardar evaluaci\u00F3n" }), _jsx("button", { type: "button", onClick: tryContinue, children: "Continuar a preparaci\u00F3n del brief" }), transition.allowed ? _jsx("p", { children: "Evaluaci\u00F3n completa. El caso puede avanzar a preparaci\u00F3n del brief." }) : null, error ? _jsx("p", { role: "alert", children: error }) : null, message ? _jsx("p", { children: message }) : null] }));
}
export function mapMissingCoverageLabels(missing) {
    return missing.map((value) => COVERAGE_DIMENSION_LABELS[value]);
}
