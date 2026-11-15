import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { EPISTEMIC_TYPE_LABELS } from "../../domain/models/CanvasItem";
import { HUMAN_SEVERITY_LABELS } from "../../domain/models/HumanSeverityAssessment";
import { parseGenerateBriefResult } from "../../providers/ai/aiParsing";
import { getAiQuestionSession } from "../../providers/storage/aiSessionStorage";
import { getBriefRecord, saveCurrentBrief, saveRegeneratedBrief, setBriefStale } from "../../providers/storage/briefStorage";
import { BRIEF_GATE_ERRORS, calculateBriefStale, canMarkBriefAsReviewed, createBriefGenerationInput, ensureHumanSeverityCopied, evaluateBriefGenerationGate, getLatestCanvasUpdatedAt, markBriefAsReviewed, normalizeGeneratedBriefForPersist, updateSectionAsEdited } from "../../domain/workflow/briefWorkflow";
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
export function BriefWorkspace({ decisionCase, items, hasMinimumCoverage, criticalReviewComplete, review, openBlockers, openWarnings, severityAssessment, provider, onBriefSaved, onError }) {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("executive");
    const [editingSection, setEditingSection] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [hasViewedExecutive, setHasViewedExecutive] = useState(false);
    const [record, setRecord] = useState(() => getBriefRecord(decisionCase.id));
    const activeItems = useMemo(() => items.filter((item) => item.validationStatus !== "REJECTED"), [items]);
    useEffect(() => {
        const persisted = getBriefRecord(decisionCase.id);
        const staleComputed = calculateBriefStale(persisted.current, activeItems);
        if (persisted.stale !== staleComputed) {
            const next = setBriefStale(decisionCase.id, staleComputed);
            setRecord(next);
        }
        else {
            setRecord(persisted);
        }
    }, [decisionCase.id, activeItems]);
    useEffect(() => {
        if (view === "executive") {
            setHasViewedExecutive(true);
        }
    }, [view]);
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
    return (_jsxs("section", { "aria-label": "Preparaci\u00F3n del brief", children: [_jsx("h4", { children: "PREPARACI\u00D3N DEL BRIEF" }), _jsx("p", { children: "La IA puede preparar un borrador utilizando \u00FAnicamente informaci\u00F3n validada o editada por el usuario. El resultado debe ser revisado antes de elevarlo." }), !gate.allowed ? _jsx("p", { role: "alert", children: gate.reasons[0] }) : null, _jsx("button", { type: "button", disabled: loading || !gate.allowed, onClick: () => generate(false), children: "Generar borrador de brief" }), loading ? _jsx("p", { children: "Generando borrador..." }) : null, brief ? (_jsxs(_Fragment, { children: [record.stale ? (_jsxs(_Fragment, { children: [_jsx("p", { role: "alert", children: "El an\u00E1lisis cambi\u00F3 despu\u00E9s de generar este brief." }), _jsx("button", { type: "button", disabled: loading || !gate.allowed, onClick: () => generate(true), children: "Regenerar borrador" })] })) : null, _jsxs("div", { role: "tablist", "aria-label": "Vistas del brief", children: [_jsx("button", { type: "button", role: "tab", "aria-selected": view === "executive", onClick: () => setView("executive"), children: "Brief ejecutivo" }), _jsx("button", { type: "button", role: "tab", "aria-selected": view === "expanded", onClick: () => setView("expanded"), children: "Vista expandida" })] }), view === "executive" ? (_jsxs("section", { children: [EDITABLE_SECTIONS.map(({ key, label }) => {
                                const section = brief.executive[key];
                                const isEditing = editingSection === key;
                                return (_jsxs("article", { children: [_jsx("h5", { children: label }), isEditing ? (_jsxs(_Fragment, { children: [_jsxs("label", { children: [label, _jsx("textarea", { value: editingValue, onChange: (event) => setEditingValue(event.target.value) })] }), _jsx("button", { type: "button", onClick: saveEdit, children: "Guardar edici\u00F3n" }), _jsx("button", { type: "button", onClick: () => {
                                                        setEditingSection(null);
                                                        setEditingValue("");
                                                    }, children: "Cancelar" })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: section.content }), !section.hasSufficientInformation && section.limitations.length > 0 ? (_jsx("ul", { children: section.limitations.map((limitation) => (_jsx("li", { children: limitation }, limitation))) })) : null, _jsx("button", { type: "button", "aria-label": `Editar ${label}`, onClick: () => {
                                                        setEditingSection(key);
                                                        setEditingValue(section.content);
                                                    }, children: "Editar" })] })), _jsxs("details", { children: [_jsx("summary", { children: "Ver trazabilidad" }), _jsx("ul", { children: section.sourceItemIds.map((id) => {
                                                        const item = items.find((entry) => entry.id === id);
                                                        return _jsx("li", { children: item ? item.content : id }, id);
                                                    }) })] })] }, key));
                            }), _jsxs("article", { children: [_jsx("h5", { children: "Gravedad" }), _jsxs("p", { children: ["Gravedad: ", brief.executive.severity.label] }), _jsx("p", { children: brief.executive.severity.notice }), _jsx("p", { children: "Para modificar la gravedad, actualiz\u00E1 la evaluaci\u00F3n humana." })] }), _jsxs("p", { children: ["Estado del brief: ", brief.status] }), _jsx("button", { type: "button", onClick: markReviewed, disabled: !reviewGate.allowed || record.stale, children: "Marcar brief como revisado" }), brief.reviewedByUser ? _jsx("p", { children: "Brief revisado por el usuario." }) : null] })) : (_jsxs("section", { children: [_jsx("h5", { children: "Hechos" }), _jsx("ul", { children: brief.expanded.facts.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Inferencias" }), _jsx("ul", { children: brief.expanded.inferences.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Supuestos" }), _jsx("ul", { children: brief.expanded.assumptions.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Datos faltantes" }), _jsx("ul", { children: brief.expanded.missingInformation.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Evaluaciones humanas" }), _jsx("ul", { children: brief.expanded.humanEvaluations.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Evidencia" }), _jsx("ul", { children: brief.expanded.evidenceItems.map((item) => (_jsx("li", { children: item.content }, item.itemId))) }), _jsx("h5", { children: "Warnings abiertos" }), _jsx("ul", { children: brief.expanded.openWarnings.map((warning) => (_jsx("li", { children: warning.message }, warning.id))) }), _jsx("h5", { children: "Findings resueltos" }), _jsx("ul", { children: brief.expanded.resolvedFindings.map((finding) => (_jsx("li", { children: finding.title }, finding.id))) }), _jsx("h5", { children: "Limitaciones de generaci\u00F3n" }), _jsx("ul", { children: brief.expanded.generationLimitations.map((limitation) => (_jsx("li", { children: limitation }, limitation))) }), _jsx("h5", { children: "Trazabilidad por secci\u00F3n" }), _jsx("ul", { children: Object.entries(brief.traceability.sectionSources).map(([section, sources]) => (_jsxs("li", { children: [formatSectionLabel(section), ": ", sources.join(", ") || "Sin referencias"] }, section))) }), _jsxs("p", { children: ["Gravedad humana: ", HUMAN_SEVERITY_LABELS[brief.executive.severity.value], " (", brief.executive.severity.notice, ")"] }), _jsxs("p", { children: ["Warnings abiertos: ", openWarnings] }), _jsxs("p", { children: ["Tipos epistemol\u00F3gicos visibles: ", Object.keys(EPISTEMIC_TYPE_LABELS).join(", ")] })] }))] })) : null] }));
}
