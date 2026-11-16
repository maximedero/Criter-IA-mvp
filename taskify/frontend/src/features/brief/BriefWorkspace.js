import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { EPISTEMIC_TYPE_LABELS } from "../../domain/models/CanvasItem";
import { HUMAN_SEVERITY_LABELS } from "../../domain/models/HumanSeverityAssessment";
import { parseGenerateBriefResult } from "../../providers/ai/aiParsing";
import { getAiQuestionSession } from "../../providers/storage/aiSessionStorage";
import { getBriefRecord, saveCurrentBrief, saveRegeneratedBrief, setBriefStale } from "../../providers/storage/briefStorage";
import { getHumanBriefApproval, removeHumanBriefApproval, saveHumanBriefApproval } from "../../providers/storage/humanApprovalStorage";
import { BRIEF_GATE_ERRORS, calculateBriefStale, canMarkBriefAsReviewed, createBriefGenerationInput, ensureHumanSeverityCopied, evaluateBriefGenerationGate, getLatestCanvasUpdatedAt, markBriefAsReviewed, normalizeGeneratedBriefForPersist, updateCommunicationAsEdited, updateSectionAsEdited } from "../../domain/workflow/briefWorkflow";
import { evaluateApprovalReadiness } from "../../domain/rules/readyToElevateRules";
import { HUMAN_APPROVAL_ERRORS, approvalAppliesToBrief, canTransitionToReadyWithHumanApproval, createNotApprovedHumanBriefApproval, reevaluateAndCreateApproval } from "../../domain/workflow/humanApprovalWorkflow";
import { Button } from "../../app/ui/Button";
import "./brief-workspace.css";
const EDITABLE_SECTIONS = [
    { key: "situation", label: "Situación" },
    { key: "whyItMatters", label: "Por qué importa" },
    { key: "possibleImpacts", label: "Impactos posibles" },
    { key: "evidence", label: "Evidencia" },
    { key: "uncertainties", label: "Incertidumbres" },
    { key: "scenariosAndAlternatives", label: "Escenarios / alternativas" },
    { key: "requiredIntervention", label: "Intervención requerida" }
];
function formatSectionLabel(key) {
    const found = EDITABLE_SECTIONS.find((item) => item.key === key);
    return found?.label ?? key;
}
function getNextStepMessage(params) {
    if (!params.hasMinimumCoverage) {
        return "Completá la dimensión Intervención para continuar.";
    }
    if (params.openBlockers > 0) {
        return "Revisá los hallazgos críticos.";
    }
    if (params.severity === "UNASSESSED") {
        return "Evaluá la gravedad del caso.";
    }
    if (!params.briefExists) {
        return "Generá la comunicación ejecutiva para continuar.";
    }
    if (params.stale) {
        return "Regenerá la comunicación ejecutiva para sincronizar cambios del análisis.";
    }
    if (params.caseStatus === "READY_TO_ESCALATE") {
        return "El caso está listo para elevar.";
    }
    if (!params.reviewedByUser) {
        return "Revisá la comunicación ejecutiva antes de aprobar.";
    }
    return "Podés avanzar con la aprobación humana cuando corresponda.";
}
export function BriefWorkspace({ decisionCase, items, hasMinimumCoverage, criticalReviewComplete, review, openBlockers, openWarnings, severityAssessment, provider, onBriefSaved, onError, onReadyToEscalate }) {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("communication");
    const [editingSection, setEditingSection] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [editingCommunication, setEditingCommunication] = useState(null);
    const [editingCommunicationValue, setEditingCommunicationValue] = useState("");
    const [copyFeedback, setCopyFeedback] = useState(null);
    const [hasViewedExecutive, setHasViewedExecutive] = useState(false);
    const [record, setRecord] = useState(() => getBriefRecord(decisionCase.id));
    const [approval, setApproval] = useState(() => getHumanBriefApproval(decisionCase.id));
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const approveTriggerRef = useRef(null);
    const dialogCancelRef = useRef(null);
    const activeItems = useMemo(() => items.filter((item) => item.validationStatus !== "REJECTED"), [items]);
    useEffect(() => {
        const persisted = getBriefRecord(decisionCase.id);
        const staleComputed = calculateBriefStale(persisted.current, activeItems);
        let nextRecord = persisted;
        if (persisted.stale !== staleComputed) {
            nextRecord = setBriefStale(decisionCase.id, staleComputed);
            setRecord(nextRecord);
        }
        else {
            setRecord(persisted);
        }
        const persistedApproval = getHumanBriefApproval(decisionCase.id);
        if (decisionCase.status === "BRIEF_DRAFT" && nextRecord.current) {
            if (!persistedApproval || persistedApproval.briefVersion !== nextRecord.current.version) {
                const resetApproval = createNotApprovedHumanBriefApproval(decisionCase.id, nextRecord.current);
                saveHumanBriefApproval(resetApproval);
                setApproval(resetApproval);
                return;
            }
        }
        setApproval(persistedApproval);
    }, [decisionCase.id, decisionCase.status, activeItems]);
    useEffect(() => {
        if (view === "executive") {
            setHasViewedExecutive(true);
        }
    }, [view]);
    useEffect(() => {
        if (!showApproveDialog) {
            return;
        }
        const previousActive = document.activeElement;
        dialogCancelRef.current?.focus();
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                cancelApproval();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            if (approveTriggerRef.current) {
                approveTriggerRef.current.focus();
            }
            else {
                previousActive?.focus();
            }
        };
    }, [showApproveDialog]);
    const gate = evaluateBriefGenerationGate({
        caseStatus: decisionCase.status,
        hasMinimumCoverage,
        criticalReviewComplete,
        openBlockers,
        humanSeverity: severityAssessment.severity,
        criticalReview: review
    });
    const brief = record.current;
    const reviewGate = canMarkBriefAsReviewed({
        brief,
        hasViewedExecutive,
        stale: record.stale,
        hasMinimumCoverage,
        openBlockers,
        humanSeverity: severityAssessment.severity,
        generationError: false
    });
    const readiness = evaluateApprovalReadiness({
        caseStatus: decisionCase.status,
        activeItems,
        criticalReviewComplete,
        openBlockers,
        severityAssessment,
        brief,
        stale: record.stale
    });
    const approvalMatchesCurrentBrief = approvalAppliesToBrief(approval, brief);
    const isReadyToEscalate = decisionCase.status === "READY_TO_ESCALATE";
    const isApprovedForCurrentBrief = isReadyToEscalate && approvalMatchesCurrentBrief;
    const canApproveBrief = decisionCase.status === "BRIEF_DRAFT" && readiness.ready && Boolean(brief) && approval?.status !== "APPROVED";
    const nextStepMessage = getNextStepMessage({
        caseStatus: decisionCase.status,
        hasMinimumCoverage,
        openBlockers,
        severity: severityAssessment.severity,
        briefExists: Boolean(brief),
        reviewedByUser: Boolean(brief?.reviewedByUser),
        stale: record.stale
    });
    const statusSummary = {
        cobertura: hasMinimumCoverage ? "Completa" : "Pendiente",
        revision: brief?.reviewedByUser ? "Revisado" : "Pendiente",
        gravedad: severityAssessment.severity === "UNASSESSED" ? "Sin evaluar" : HUMAN_SEVERITY_LABELS[severityAssessment.severity],
        brief: brief ? `v${brief.version} (${record.stale ? "stale" : brief.status})` : "No generado",
        aprobacion: isApprovedForCurrentBrief ? "Aprobado" : approval?.status === "APPROVED" ? "Desincronizada" : "Pendiente"
    };
    const contextualQuestionHistory = getAiQuestionSession(decisionCase.id).questions;
    const generate = async (regenerate) => {
        onError(null);
        if (!gate.allowed || !review) {
            onError(gate.reasons[0] ?? BRIEF_GATE_ERRORS.CRITICAL_REVIEW_NOT_FOUND);
            return;
        }
        if (regenerate) {
            const confirmed = window.confirm("Se reemplazará el borrador actual por una nueva versión. ¿Deseás continuar?");
            if (!confirmed) {
                return;
            }
        }
        setLoading(true);
        try {
            const input = createBriefGenerationInput({
                caseId: decisionCase.id,
                caseTitle: decisionCase.title,
                initialNarrative: decisionCase.initialNarrative,
                activeItems,
                humanSeverityAssessment: severityAssessment,
                completedCriticalReview: review,
                contextualQuestionHistory,
                currentCaseStatus: decisionCase.status
            });
            const result = await provider.generateBrief(input);
            const parsed = parseGenerateBriefResult(result);
            const latestCanvasUpdatedAt = getLatestCanvasUpdatedAt(input.activeCanvasItems);
            const normalized = normalizeGeneratedBriefForPersist(ensureHumanSeverityCopied(parsed, severityAssessment), (record.current?.version ?? 0) + 1, {
                criticalReviewId: review.reviewId,
                severityAssessmentRef: `${decisionCase.id}:${severityAssessment.assessedAt ?? "unknown"}`,
                generatedFromCanvasUpdatedAt: latestCanvasUpdatedAt,
                generationProvider: "MockAIProvider"
            });
            const refreshedGate = evaluateBriefGenerationGate({
                caseStatus: decisionCase.status,
                hasMinimumCoverage,
                criticalReviewComplete,
                openBlockers,
                humanSeverity: severityAssessment.severity,
                criticalReview: review
            });
            if (!refreshedGate.allowed) {
                onError(refreshedGate.reasons[0] ?? BRIEF_GATE_ERRORS.INVALID_BRIEF_OUTPUT);
                return;
            }
            const nextRecord = regenerate ? saveRegeneratedBrief(decisionCase.id, normalized) : saveCurrentBrief(decisionCase.id, normalized);
            setRecord(nextRecord);
            const currentApproval = getHumanBriefApproval(decisionCase.id);
            if (currentApproval &&
                currentApproval.status === "APPROVED" &&
                currentApproval.confirmedBriefVersion !== normalized.version) {
                removeHumanBriefApproval(decisionCase.id);
                setApproval(null);
            }
            onBriefSaved();
        }
        catch (error) {
            if (error instanceof Error && /storage|guardar|quota/i.test(error.message)) {
                onError("No se pudo guardar el brief.");
            }
            else {
                onError("No se pudo generar el borrador del brief.");
            }
        }
        finally {
            setLoading(false);
        }
    };
    const saveEdit = () => {
        if (!brief || !editingSection) {
            return;
        }
        const updated = updateSectionAsEdited(brief, editingSection, editingValue);
        const next = saveCurrentBrief(decisionCase.id, updated);
        setRecord(next);
        setEditingSection(null);
        setEditingValue("");
        onBriefSaved();
    };
    const saveCommunicationEdit = () => {
        if (!brief || !editingCommunication) {
            return;
        }
        const updated = updateCommunicationAsEdited(brief, editingCommunication, editingCommunicationValue);
        const next = saveCurrentBrief(decisionCase.id, updated);
        setRecord(next);
        setEditingCommunication(null);
        setEditingCommunicationValue("");
        setCopyFeedback(null);
        onBriefSaved();
    };
    const copyText = async (type, content) => {
        if (!content.trim()) {
            onError("No hay contenido para copiar.");
            return;
        }
        if (record.stale) {
            onError("El análisis cambió después de generar este brief.");
            return;
        }
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(content);
            }
            else {
                const textArea = document.createElement("textarea");
                textArea.value = content;
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }
            setCopyFeedback(type);
            onError(null);
        }
        catch {
            onError("No se pudo copiar el contenido. Seleccionalo manualmente.");
        }
    };
    const markReviewed = () => {
        if (!brief) {
            return;
        }
        if (!reviewGate.allowed) {
            onError(reviewGate.reasons[0] ?? BRIEF_GATE_ERRORS.MISSING_REQUIRED_SECTIONS);
            return;
        }
        if (!window.confirm("Confirmás que revisaste el contenido del brief.")) {
            return;
        }
        const reviewed = markBriefAsReviewed(brief);
        const next = saveCurrentBrief(decisionCase.id, reviewed);
        setRecord(next);
        onBriefSaved();
    };
    const openApproveDialog = () => {
        onError(null);
        if (!readiness.ready || !brief) {
            onError(readiness.blockers[0]?.reason ?? "No se cumplen las condiciones para aprobar.");
            return;
        }
        setShowApproveDialog(true);
    };
    const cancelApproval = () => {
        setShowApproveDialog(false);
    };
    const confirmApproval = () => {
        if (!brief) {
            setShowApproveDialog(false);
            onError(HUMAN_APPROVAL_ERRORS.CONDITIONS_CHANGED);
            return;
        }
        const reevaluated = reevaluateAndCreateApproval({
            caseStatus: decisionCase.status,
            activeItems,
            criticalReviewComplete,
            openBlockers,
            severityAssessment,
            brief,
            stale: getBriefRecord(decisionCase.id).stale
        });
        if (reevaluated.allowed === false) {
            setShowApproveDialog(false);
            onError(reevaluated.message);
            return;
        }
        try {
            saveHumanBriefApproval(reevaluated.approval);
            const transition = canTransitionToReadyWithHumanApproval({
                caseStatus: decisionCase.status,
                hasMinimumCoverage,
                criticalReviewComplete,
                openBlockers,
                severity: severityAssessment.severity,
                briefExists: true,
                briefReviewed: brief.reviewedByUser,
                humanApproved: true
            });
            if (!transition.allowed) {
                try {
                    removeHumanBriefApproval(decisionCase.id);
                }
                catch {
                    // ignore rollback failure
                }
                setApproval(null);
                setShowApproveDialog(false);
                onError(HUMAN_APPROVAL_ERRORS.TRANSITION_ERROR);
                return;
            }
            setApproval(reevaluated.approval);
            setShowApproveDialog(false);
            onReadyToEscalate();
            onBriefSaved();
        }
        catch {
            try {
                removeHumanBriefApproval(decisionCase.id);
            }
            catch {
                // ignore rollback failure
            }
            setApproval(null);
            setShowApproveDialog(false);
            onError(HUMAN_APPROVAL_ERRORS.STORAGE_ERROR);
        }
    };
    return (_jsxs("section", { "aria-label": "Preparaci\u00F3n del brief", className: "dw-brief-workspace", children: [_jsx("h4", { children: "PREPARACI\u00D3N DEL BRIEF" }), _jsx("p", { children: "La IA puede preparar un borrador utilizando \u00FAnicamente informaci\u00F3n validada o editada por el usuario. El resultado debe ser revisado antes de elevarlo." }), _jsxs("section", { "aria-label": "Pr\u00F3ximo paso", className: "dw-brief-next-step", children: [_jsx("h5", { children: "PR\u00D3XIMO PASO" }), _jsx("p", { children: nextStepMessage })] }), _jsxs("section", { "aria-label": "Estado compacto", className: "dw-brief-status-summary", children: [_jsx("h5", { children: "Estado compacto" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("strong", { children: "Cobertura:" }), " ", statusSummary.cobertura] }), _jsxs("li", { children: [_jsx("strong", { children: "Revisi\u00F3n:" }), " ", statusSummary.revision] }), _jsxs("li", { children: [_jsx("strong", { children: "Gravedad:" }), " ", statusSummary.gravedad] }), _jsxs("li", { children: [_jsx("strong", { children: "Brief:" }), " ", statusSummary.brief] }), _jsxs("li", { children: [_jsx("strong", { children: "Aprobaci\u00F3n:" }), " ", statusSummary.aprobacion] })] })] }), !gate.allowed && decisionCase.status === "BRIEF_DRAFT" ? (_jsx("p", { className: "dw-brief-alert", role: "alert", children: gate.reasons[0] })) : null, decisionCase.status === "BRIEF_DRAFT" ? (_jsx(Button, { type: "button", disabled: loading || !gate.allowed, onClick: () => generate(false), children: "Generar borrador de brief" })) : null, loading ? _jsx("p", { children: "Generando borrador..." }) : null, brief && (decisionCase.status === "BRIEF_DRAFT" || decisionCase.status === "READY_TO_ESCALATE") ? (_jsxs(_Fragment, { children: [decisionCase.status === "BRIEF_DRAFT" && record.stale ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "dw-brief-alert", role: "alert", children: "El an\u00E1lisis cambi\u00F3 despu\u00E9s de generar este brief." }), _jsx(Button, { type: "button", disabled: loading || !gate.allowed || isReadyToEscalate, onClick: () => generate(true), children: "Regenerar borrador" })] })) : null, isReadyToEscalate && approvalMatchesCurrentBrief && approval ? (_jsxs("section", { "aria-label": "Aprobaci\u00F3n confirmada", className: "dw-approval-ready-panel", children: [_jsx("h5", { children: "LISTO PARA ELEVAR" }), _jsx("p", { children: "El brief fue revisado y aprobado por el usuario." }), _jsxs("p", { children: ["Versi\u00F3n aprobada: v", approval.confirmedBriefVersion] }), _jsx("p", { children: "Aprobaci\u00F3n realizada por el usuario." }), _jsxs("p", { children: ["Fecha de aprobaci\u00F3n: ", new Date(approval.approvedAt ?? approval.updatedAt).toLocaleString("es-AR")] }), _jsxs("p", { children: ["Gravedad: ", brief.executive.severity.label] }), _jsx("p", { children: brief.executive.severity.notice }), _jsx("p", { children: "Listo para elevar indica preparaci\u00F3n del brief, no aprobaci\u00F3n de la decisi\u00F3n por parte del destinatario." }), _jsxs("details", { children: [_jsx("summary", { children: "Checklist al momento de aprobar" }), _jsx("ul", { className: "dw-approval-checklist", children: approval.checklistSnapshot.checks.map((check) => (_jsxs("li", { className: "dw-approval-checklist__item", children: [_jsx("span", { children: check.label }), _jsx("span", { className: check.passed ? "dw-approval-badge dw-approval-badge--passed" : "dw-approval-badge dw-approval-badge--pending", children: check.passed ? "Cumplido" : "Pendiente" })] }, check.id))) })] })] })) : null, _jsxs("div", { role: "tablist", "aria-label": "Vistas del brief", className: "dw-brief-tabs", children: [_jsx(Button, { type: "button", role: "tab", "aria-selected": view === "communication", variant: view === "communication" ? "primary" : "ghost", onClick: () => setView("communication"), children: "Comunicaci\u00F3n ejecutiva" }), _jsx(Button, { type: "button", role: "tab", "aria-selected": view === "executive", variant: view === "executive" ? "primary" : "ghost", onClick: () => setView("executive"), children: "Brief ejecutivo" }), _jsx(Button, { type: "button", role: "tab", "aria-selected": view === "expanded", variant: view === "expanded" ? "primary" : "ghost", onClick: () => setView("expanded"), children: "An\u00E1lisis completo y trazabilidad" })] }), view === "communication" ? (_jsxs("section", { children: [_jsxs("article", { children: [_jsx("h5", { children: "Correo" }), editingCommunication === "emailSubject" ? (_jsxs(_Fragment, { children: [_jsxs("label", { children: ["Asunto", _jsx("input", { value: editingCommunicationValue, onChange: (event) => setEditingCommunicationValue(event.target.value) })] }), _jsxs("div", { className: "dw-brief-inline-actions", children: [_jsx(Button, { type: "button", onClick: saveCommunicationEdit, disabled: isReadyToEscalate, children: "Guardar edici\u00F3n" }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                                            setEditingCommunication(null);
                                                            setEditingCommunicationValue("");
                                                        }, children: "Cancelar" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("p", { children: [_jsx("strong", { children: "Asunto:" }), " ", brief.communication.email.subject || "Sin asunto"] }), _jsx(Button, { type: "button", variant: "ghost", disabled: isReadyToEscalate, onClick: () => {
                                                    setEditingCommunication("emailSubject");
                                                    setEditingCommunicationValue(brief.communication.email.subject);
                                                }, children: "Editar asunto" })] })), editingCommunication === "emailBody" ? (_jsxs(_Fragment, { children: [_jsxs("label", { children: ["Cuerpo del correo", _jsx("textarea", { value: editingCommunicationValue, onChange: (event) => setEditingCommunicationValue(event.target.value) })] }), _jsxs("div", { className: "dw-brief-inline-actions", children: [_jsx(Button, { type: "button", onClick: saveCommunicationEdit, disabled: isReadyToEscalate, children: "Guardar edici\u00F3n" }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                                            setEditingCommunication(null);
                                                            setEditingCommunicationValue("");
                                                        }, children: "Cancelar" })] })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: brief.communication.email.body || "Sin contenido" }), _jsxs("div", { className: "dw-brief-inline-actions", children: [_jsx(Button, { type: "button", variant: "ghost", disabled: isReadyToEscalate, onClick: () => {
                                                            setEditingCommunication("emailBody");
                                                            setEditingCommunicationValue(brief.communication.email.body);
                                                        }, children: "Editar correo" }), _jsx(Button, { type: "button", variant: "ghost", disabled: record.stale, onClick: () => copyText("email", `Asunto: ${brief.communication.email.subject || "Sin asunto"}\n\n${brief.communication.email.body}`), children: "Copiar como correo" })] }), copyFeedback === "email" ? _jsx("p", { children: "Correo copiado." }) : null] }))] }), _jsxs("article", { children: [_jsx("h5", { children: "Mensaje breve" }), editingCommunication === "messageBody" ? (_jsxs(_Fragment, { children: [_jsxs("label", { children: ["Mensaje", _jsx("textarea", { value: editingCommunicationValue, onChange: (event) => setEditingCommunicationValue(event.target.value) })] }), _jsxs("div", { className: "dw-brief-inline-actions", children: [_jsx(Button, { type: "button", onClick: saveCommunicationEdit, disabled: isReadyToEscalate, children: "Guardar edici\u00F3n" }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                                            setEditingCommunication(null);
                                                            setEditingCommunicationValue("");
                                                        }, children: "Cancelar" })] })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: brief.communication.message.body || "Sin contenido" }), _jsxs("div", { className: "dw-brief-inline-actions", children: [_jsx(Button, { type: "button", variant: "ghost", disabled: isReadyToEscalate, onClick: () => {
                                                            setEditingCommunication("messageBody");
                                                            setEditingCommunicationValue(brief.communication.message.body);
                                                        }, children: "Editar mensaje" }), _jsx(Button, { type: "button", variant: "ghost", disabled: record.stale, onClick: () => copyText("message", brief.communication.message.body), children: "Copiar como mensaje" })] }), copyFeedback === "message" ? _jsx("p", { children: "Mensaje copiado." }) : null] }))] }), _jsxs("p", { children: ["Estado del brief: ", brief.status] })] })) : null, view === "executive" ? (_jsxs("section", { children: [EDITABLE_SECTIONS.map(({ key, label }) => {
                                const section = brief.executive[key];
                                const isEditing = editingSection === key;
                                return (_jsxs("article", { children: [_jsx("h5", { children: label }), isEditing ? (_jsxs(_Fragment, { children: [_jsxs("label", { children: [label, _jsx("textarea", { value: editingValue, onChange: (event) => setEditingValue(event.target.value) })] }), _jsxs("div", { className: "dw-brief-inline-actions", children: [_jsx(Button, { type: "button", onClick: saveEdit, disabled: isReadyToEscalate, children: "Guardar edici\u00F3n" }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                                                setEditingSection(null);
                                                                setEditingValue("");
                                                            }, children: "Cancelar" })] })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: section.content }), !section.hasSufficientInformation && section.limitations.length > 0 ? (_jsx("ul", { children: section.limitations.map((limitation) => (_jsx("li", { children: limitation }, limitation))) })) : null, _jsx(Button, { type: "button", variant: "ghost", "aria-label": `Editar ${label}`, disabled: isReadyToEscalate, onClick: () => {
                                                        setEditingSection(key);
                                                        setEditingValue(section.content);
                                                    }, children: "Editar" })] })), _jsxs("details", { children: [_jsx("summary", { children: "Ver trazabilidad" }), _jsx("ul", { children: section.sourceItemIds.map((id) => {
                                                        const item = items.find((entry) => entry.id === id);
                                                        return _jsx("li", { children: item ? item.content : id }, id);
                                                    }) })] })] }, key));
                            }), _jsxs("article", { children: [_jsx("h5", { children: "Gravedad" }), _jsxs("p", { children: ["Gravedad: ", brief.executive.severity.label] }), _jsx("p", { children: brief.executive.severity.notice }), _jsx("p", { children: "Para modificar la gravedad, actualiz\u00E1 la evaluaci\u00F3n humana." })] }), _jsxs("p", { children: ["Estado del brief: ", brief.status] }), _jsx(Button, { type: "button", onClick: markReviewed, disabled: !reviewGate.allowed || record.stale || isReadyToEscalate, children: "Marcar brief como revisado" }), brief.reviewedByUser ? _jsx("p", { children: "Brief revisado por el usuario." }) : null, isReadyToEscalate ? _jsx("p", { children: "Este brief corresponde a una versi\u00F3n aprobada." }) : null] })) : (_jsxs("section", { children: [_jsx("h5", { children: "Hechos" }), _jsx("ul", { children: brief.expanded.facts.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Inferencias" }), _jsx("ul", { children: brief.expanded.inferences.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Supuestos" }), _jsx("ul", { children: brief.expanded.assumptions.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Datos faltantes" }), _jsx("ul", { children: brief.expanded.missingInformation.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Evaluaciones humanas" }), _jsx("ul", { children: brief.expanded.humanEvaluations.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Evidencia" }), _jsx("ul", { children: brief.expanded.evidenceItems.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Warnings abiertos" }), _jsx("ul", { children: brief.expanded.openWarnings.map((warning) => (_jsx("li", { children: warning.message }, warning.id))) }), _jsx("h5", { children: "Findings resueltos" }), _jsx("ul", { children: brief.expanded.resolvedFindings.map((finding) => (_jsx("li", { children: finding.title }, finding.id))) }), _jsx("h5", { children: "Limitaciones de generaci\u00F3n" }), _jsx("ul", { children: brief.expanded.generationLimitations.map((limitation) => (_jsx("li", { children: limitation }, limitation))) }), _jsx("h5", { children: "Trazabilidad por secci\u00F3n" }), _jsx("ul", { children: Object.entries(brief.traceability.sectionSources).map(([section, sources]) => (_jsxs("li", { children: [formatSectionLabel(section), ": ", sources.join(", ") || "Sin referencias"] }, section))) }), _jsxs("p", { children: ["Gravedad humana: ", HUMAN_SEVERITY_LABELS[brief.executive.severity.value], " (", brief.executive.severity.notice, ")"] }), _jsxs("p", { children: ["Warnings abiertos: ", openWarnings] }), _jsxs("p", { children: ["Tipos epistemol\u00F3gicos visibles: ", Object.keys(EPISTEMIC_TYPE_LABELS).join(", ")] })] })), decisionCase.status === "BRIEF_DRAFT" ? (_jsxs("section", { "aria-label": "Aprobaci\u00F3n humana", className: "dw-approval-panel", children: [_jsx("h5", { children: "APROBACI\u00D3N HUMANA" }), _jsx("p", { children: "El sistema verifica las condiciones necesarias, pero la aprobaci\u00F3n final debe realizarla una persona." }), _jsx("h6", { children: "CHECKLIST FINAL" }), _jsx("ul", { className: "dw-approval-checklist", children: readiness.checks.map((check) => (_jsxs("li", { className: "dw-approval-checklist__item", children: [_jsxs("span", { children: [check.passed ? "✓" : "○", " ", check.label] }), _jsx("span", { className: check.passed ? "dw-approval-badge dw-approval-badge--passed" : "dw-approval-badge dw-approval-badge--pending", children: check.passed ? "Cumplido" : "Pendiente" }), !check.passed ? _jsxs("p", { children: ["Explicaci\u00F3n: ", check.reason] }) : null] }, check.id))) }), _jsx("p", { className: readiness.ready ? "dw-approval-status dw-approval-status--ready" : "dw-approval-status dw-approval-status--blocked", children: readiness.ready
                                    ? "Se cumplen las condiciones para aprobar el brief."
                                    : "Todavía no se cumplen las condiciones para aprobar el brief." }), _jsx(Button, { type: "button", onClick: openApproveDialog, disabled: !canApproveBrief || isReadyToEscalate, ref: approveTriggerRef, children: "Aprobar brief" }), showApproveDialog ? (_jsx("div", { className: "dw-approve-dialog__overlay", children: _jsxs("div", { role: "dialog", "aria-modal": "true", "aria-label": "Confirmar aprobaci\u00F3n", className: "dw-approve-dialog", children: [_jsx("h5", { children: "Confirmar aprobaci\u00F3n" }), _jsx("p", { children: "Est\u00E1s por marcar este caso como LISTO PARA ELEVAR." }), _jsx("p", { children: "Esta acci\u00F3n confirma que revisaste el brief actual y que consider\u00E1s que est\u00E1 en condiciones de ser presentado al nivel superior correspondiente." }), _jsxs("dl", { className: "dw-approve-dialog__meta", children: [_jsxs("div", { children: [_jsx("dt", { children: "Caso" }), _jsx("dd", { children: decisionCase.title })] }), _jsxs("div", { children: [_jsx("dt", { children: "Versi\u00F3n del brief" }), _jsxs("dd", { children: ["v", brief.version] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Gravedad" }), _jsx("dd", { children: brief.executive.severity.label })] })] }), _jsxs("p", { children: ["Versi\u00F3n del brief: v", brief.version] }), _jsxs("p", { children: ["Gravedad: ", brief.executive.severity.label] }), _jsx("p", { children: "Evaluaci\u00F3n de gravedad realizada por el usuario." }), _jsxs("div", { className: "dw-approve-dialog__actions", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: cancelApproval, ref: dialogCancelRef, children: "Cancelar" }), _jsx(Button, { type: "button", onClick: confirmApproval, children: "Confirmar aprobaci\u00F3n" })] })] }) })) : null] })) : null] })) : null] }));
}
