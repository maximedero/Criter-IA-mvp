import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import { acknowledgeFindingAsUncertainty, completeCriticalReview, dismissFinding, markFindingResolvedByEdit, resolveFindingByClarification } from "../../domain/workflow/criticalReviewActions";
import { parseReviewCaseResult } from "../../providers/ai";
import { getAiQuestionSession } from "../../providers/storage/aiSessionStorage";
import { getCriticalReview, isCriticalReviewComplete, persistReviewResult, setCriticalReviewCompleteFlag } from "../../providers/storage/criticalReviewStorage";
import { calculateReviewSummary, canAcknowledgeAsUncertainty, canCompleteCriticalReview } from "../../domain/rules/reviewRules";
import { Button } from "../../app/ui/Button";
import "./critical-review-panel.css";
function findingLevelLabel(level) {
    return level === "BLOCKER" ? "BLOQUEO CRÍTICO" : "ADVERTENCIA";
}
function statusText(status) {
    switch (status) {
        case "OPEN":
            return "Abierto";
        case "RESOLVED_BY_EDIT":
            return "Resuelto por edición";
        case "RESOLVED_BY_CLARIFICATION":
            return "Resuelto por aclaración";
        case "ACKNOWLEDGED_AS_UNCERTAINTY":
            return "Reconocido como incertidumbre";
        case "DISMISSED_BY_USER":
            return "Descartado por la persona usuaria";
        case "SUPERSEDED":
            return "Obsoleto";
        default:
            return status;
    }
}
function coverageLockMessage(hasMinimumCoverage) {
    return hasMinimumCoverage ? null : "La cobertura mínima dejó de cumplirse después de los cambios.";
}
export function CriticalReviewPanel({ caseId, initialNarrative, caseStatus, items, provider, onItemsUpdated }) {
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [clarificationInput, setClarificationInput] = useState({});
    const [dismissInput, setDismissInput] = useState({});
    const [acknowledgeInput, setAcknowledgeInput] = useState({});
    const [pendingEditedResolution, setPendingEditedResolution] = useState(null);
    if (caseStatus !== "CRITICAL_REVIEW") {
        return null;
    }
    const coverage = evaluateMinimumCoverage(items);
    const existingReview = getCriticalReview(caseId);
    const summary = existingReview ? calculateReviewSummary(existingReview.findings) : null;
    const canComplete = existingReview
        ? canCompleteCriticalReview({ ...existingReview, summary: summary ?? existingReview.summary }, items, coverage.hasMinimumCoverage)
        : false;
    const executeReview = async () => {
        setError(null);
        setMessage(null);
        if (caseStatus !== "CRITICAL_REVIEW") {
            setError("La revisión crítica sólo está disponible en estado Revisión crítica.");
            return;
        }
        if (!coverage.hasMinimumCoverage) {
            setError("No se puede ejecutar la revisión crítica sin cobertura mínima 6/6.");
            return;
        }
        try {
            const session = getAiQuestionSession(caseId);
            const result = await provider.reviewCase({
                caseId,
                initialNarrative,
                currentItems: items.filter((item) => item.validationStatus !== "REJECTED"),
                rejectedAiItems: items.filter((item) => item.origin === "AI" && item.validationStatus === "REJECTED"),
                coverageResult: coverage,
                contextualQuestionHistory: session.questions,
                currentCaseStatus: caseStatus
            });
            const parsed = parseReviewCaseResult(result);
            persistReviewResult(caseId, {
                ...parsed,
                summary: calculateReviewSummary(parsed.findings),
                canCompleteReview: parsed.findings.every((item) => !(item.level === "BLOCKER" && item.status === "OPEN"))
            });
            setCriticalReviewCompleteFlag(caseId, false);
            setMessage(parsed.findings.length === 0 ? "No se identificaron hallazgos en esta revisión." : "Revisión crítica generada.");
            onItemsUpdated();
        }
        catch {
            setError("No se pudo ejecutar la revisión crítica.");
        }
    };
    const review = getCriticalReview(caseId);
    return (_jsxs("section", { "aria-label": "Revisi\u00F3n cr\u00EDtica", className: "dw-review-panel", children: [_jsx("h4", { children: "REVISI\u00D3N CR\u00CDTICA" }), _jsx(Button, { type: "button", onClick: executeReview, children: review ? "Volver a revisar" : "Ejecutar revisión crítica" }), error ? (_jsx("p", { className: "dw-review-panel__alert", role: "alert", children: error })) : null, message ? _jsx("p", { children: message }) : null, review ? (_jsxs(_Fragment, { children: [_jsx("p", { children: "Resumen:" }), _jsxs("ul", { className: "dw-review-panel__summary", children: [_jsxs("li", { children: [summary?.openBlockers ?? 0, " bloqueos abiertos"] }), _jsxs("li", { children: [summary?.openWarnings ?? 0, " advertencias abiertas"] }), _jsxs("li", { children: [summary?.resolvedFindings ?? 0, " hallazgos resueltos"] })] }), review.findings.map((finding) => {
                        const related = items.filter((item) => finding.relatedItemIds.includes(item.id));
                        const allowAcknowledge = canAcknowledgeAsUncertainty(finding, items);
                        const clarification = clarificationInput[finding.id] ?? "";
                        const dismissReason = dismissInput[finding.id] ?? "";
                        const acknowledgeText = acknowledgeInput[finding.id] ?? "";
                        return (_jsxs("article", { className: "dw-review-finding", children: [_jsx("h5", { children: findingLevelLabel(finding.level) }), _jsx("p", { children: _jsx("strong", { children: finding.title }) }), _jsx("p", { children: finding.message }), _jsxs("p", { children: [_jsx("strong", { children: "Acci\u00F3n sugerida:" }), " ", finding.suggestedHumanAction] }), _jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", statusText(finding.status)] }), _jsx("p", { children: "Relacionado con:" }), related.length > 0 ? (_jsx("ul", { children: related.map((item) => (_jsx("li", { children: item.content }, item.id))) })) : (_jsx("p", { children: "Elemento relacionado modificado o eliminado." })), finding.status === "OPEN" ? (_jsxs("div", { className: "dw-review-finding__actions", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => setPendingEditedResolution(finding.id), children: "Editar item" }), pendingEditedResolution === finding.id ? (_jsx(Button, { type: "button", onClick: () => {
                                                markFindingResolvedByEdit(caseId, finding.id);
                                                setPendingEditedResolution(null);
                                                setMessage("Hallazgo marcado como resuelto por edición.");
                                                onItemsUpdated();
                                            }, children: "Marcar como resuelto por edici\u00F3n" })) : null, _jsxs("label", { children: ["Aclaraci\u00F3n", _jsx("textarea", { value: clarification, onChange: (event) => {
                                                        setClarificationInput((prev) => ({
                                                            ...prev,
                                                            [finding.id]: event.target.value
                                                        }));
                                                    } })] }), _jsx(Button, { type: "button", onClick: () => {
                                                try {
                                                    resolveFindingByClarification(caseId, finding.id, clarification);
                                                    setClarificationInput((prev) => ({ ...prev, [finding.id]: "" }));
                                                    setMessage("Hallazgo resuelto por aclaración.");
                                                    onItemsUpdated();
                                                }
                                                catch (err) {
                                                    setError(err instanceof Error ? err.message : "No se pudo guardar la aclaración.");
                                                }
                                            }, children: "Aclarar" }), _jsxs("label", { children: ["Registrar incertidumbre", _jsx("textarea", { value: acknowledgeText, onChange: (event) => {
                                                        setAcknowledgeInput((prev) => ({
                                                            ...prev,
                                                            [finding.id]: event.target.value
                                                        }));
                                                    } })] }), _jsx(Button, { type: "button", variant: "ghost", disabled: !allowAcknowledge, onClick: () => {
                                                try {
                                                    acknowledgeFindingAsUncertainty(caseId, finding.id, acknowledgeText, "MISSING_INFORMATION");
                                                    setAcknowledgeInput((prev) => ({ ...prev, [finding.id]: "" }));
                                                    setMessage("Hallazgo reconocido como incertidumbre.");
                                                    onItemsUpdated();
                                                }
                                                catch (err) {
                                                    setError(err instanceof Error ? err.message : "No se pudo registrar la incertidumbre.");
                                                }
                                            }, children: "Reconocer como incertidumbre" }), _jsxs("label", { children: ["Raz\u00F3n de descarte", _jsx("textarea", { value: dismissReason, onChange: (event) => {
                                                        setDismissInput((prev) => ({
                                                            ...prev,
                                                            [finding.id]: event.target.value
                                                        }));
                                                    } })] }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                                try {
                                                    dismissFinding(caseId, finding.id, dismissReason);
                                                    setDismissInput((prev) => ({ ...prev, [finding.id]: "" }));
                                                    setMessage("Hallazgo descartado con justificación.");
                                                    onItemsUpdated();
                                                }
                                                catch (err) {
                                                    setError(err instanceof Error ? err.message : "No se pudo descartar el hallazgo.");
                                                }
                                            }, children: "Descartar hallazgo" })] })) : null] }, finding.id));
                    }), coverageLockMessage(coverage.hasMinimumCoverage) ? _jsx("p", { children: coverageLockMessage(coverage.hasMinimumCoverage) }) : null, !canComplete ? (_jsx("p", { children: "No pod\u00E9s completar la revisi\u00F3n mientras existan bloqueos cr\u00EDticos abiertos." })) : (_jsx("p", { children: "Los bloqueos cr\u00EDticos est\u00E1n resueltos. Pod\u00E9s completar la revisi\u00F3n." })), _jsx(Button, { type: "button", disabled: !canComplete || !coverage.hasMinimumCoverage || review.status === "COMPLETED", onClick: () => {
                            try {
                                completeCriticalReview(caseId);
                                setMessage("Revisión completada. El caso puede avanzar a evaluación humana.");
                                onItemsUpdated();
                            }
                            catch (err) {
                                setError(err instanceof Error ? err.message : "No se pudo completar la revisión.");
                            }
                        }, children: "Completar revisi\u00F3n" }), review.status === "COMPLETED" || isCriticalReviewComplete(caseId) ? (_jsx("p", { children: "Revisi\u00F3n completada. El caso puede avanzar a evaluaci\u00F3n humana." })) : null] })) : null] }));
}
