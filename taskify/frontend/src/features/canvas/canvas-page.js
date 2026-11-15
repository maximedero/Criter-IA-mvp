import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { CANVAS_DIMENSIONS, CANVAS_DIMENSION_LABELS } from "../../domain/models/CanvasItem";
import { MockAIProvider, parseAnalyzeNarrativeResult } from "../../providers/ai";
import { applyAnalyzeNarrativeSuggestions, editAISuggestion, acceptAISuggestion, rejectAISuggestion } from "./aiSuggestionActions";
import { createCanvasItem, deleteCanvasItem, listCanvasItemsByCase, updateCanvasItem } from "../../providers/storage/canvasStorage";
import { CoveragePanel } from "./CoveragePanel";
import { QuestionPanel } from "./QuestionPanel";
import { StatementCard } from "./statement-card";
import { StatementEditor } from "./StatementEditor";
import { Button } from "../../app/ui/Button";
import "./canvas-page.css";
export function CanvasPage({ caseId, initialNarrative, caseStatus, aiProvider, onItemsChange }) {
    const [items, setItems] = useState([]);
    const [addingDimension, setAddingDimension] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [analyzingNarrative, setAnalyzingNarrative] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const [analysisEmptyMessage, setAnalysisEmptyMessage] = useState(null);
    const provider = useMemo(() => aiProvider ?? new MockAIProvider(), [aiProvider]);
    const refresh = () => {
        const listed = listCanvasItemsByCase(caseId);
        setItems(listed);
        onItemsChange?.(listed);
    };
    useEffect(() => {
        refresh();
        setAnalysisError(null);
        setAnalysisEmptyMessage(null);
    }, [caseId]);
    const editingItem = editingId ? items.find((item) => item.id === editingId) ?? null : null;
    return (_jsxs("section", { className: "dw-canvas-page", children: [_jsx("h3", { children: "Decision Canvas" }), _jsxs("div", { className: "dw-canvas-page__actions", children: [_jsx(Button, { type: "button", onClick: async () => {
                            setAnalyzingNarrative(true);
                            setAnalysisError(null);
                            setAnalysisEmptyMessage(null);
                            try {
                                const rawResult = await provider.analyzeNarrative({
                                    caseId,
                                    initialNarrative,
                                    existingItems: listCanvasItemsByCase(caseId)
                                });
                                const result = parseAnalyzeNarrativeResult(rawResult);
                                if (result.suggestions.length === 0) {
                                    setAnalysisEmptyMessage("No se identificaron sugerencias para este relato.");
                                }
                                else {
                                    applyAnalyzeNarrativeSuggestions(caseId, result.suggestions);
                                }
                                refresh();
                            }
                            catch {
                                setAnalysisError("No se pudieron procesar las sugerencias del relato.");
                            }
                            finally {
                                setAnalyzingNarrative(false);
                            }
                        }, children: "Analizar relato" }), analyzingNarrative ? _jsx("p", { children: "Analizando relato..." }) : null, analysisError ? (_jsx("p", { className: "dw-canvas-page__alert", role: "alert", children: analysisError })) : null, analysisEmptyMessage ? _jsx("p", { children: analysisEmptyMessage }) : null] }), _jsx(CoveragePanel, { items: items }), _jsx(QuestionPanel, { caseId: caseId, initialNarrative: initialNarrative, caseStatus: caseStatus, items: items, provider: provider, onItemsUpdated: refresh }), _jsx("div", { className: "dw-canvas-page__grid", children: CANVAS_DIMENSIONS.map((dimension) => {
                    const dimensionItems = items.filter((item) => item.dimension === dimension);
                    const isAdding = addingDimension === dimension;
                    return (_jsxs("section", { className: "dw-canvas-dimension", children: [_jsx("h4", { children: CANVAS_DIMENSION_LABELS[dimension] }), dimensionItems.length === 0 ? _jsx("p", { className: "dw-canvas-dimension__empty", children: "Sin contenido" }) : null, dimensionItems.map((item) => editingItem && editingItem.id === item.id ? (_jsx(StatementEditor, { submitLabel: "Guardar", initialContent: item.content, initialEpistemicType: item.epistemicType, onCancel: () => setEditingId(null), onSubmit: ({ content, epistemicType }) => {
                                    updateCanvasItem(caseId, item.id, { content, epistemicType });
                                    setEditingId(null);
                                    refresh();
                                } }, item.id)) : (_jsx(StatementCard, { statement: item, onEdit: () => setEditingId(item.id), onDelete: () => {
                                    deleteCanvasItem(caseId, item.id);
                                    refresh();
                                }, onAcceptAI: () => {
                                    acceptAISuggestion(caseId, item.id);
                                    refresh();
                                }, onEditAI: (content) => {
                                    editAISuggestion(caseId, item.id, content);
                                    refresh();
                                }, onRejectAI: () => {
                                    rejectAISuggestion(caseId, item.id);
                                    refresh();
                                } }, item.id))), isAdding ? (_jsx(StatementEditor, { submitLabel: "Agregar", onCancel: () => setAddingDimension(null), onSubmit: ({ content, epistemicType }) => {
                                    createCanvasItem({
                                        caseId,
                                        dimension,
                                        content,
                                        epistemicType
                                    });
                                    setAddingDimension(null);
                                    refresh();
                                } })) : (_jsx(Button, { type: "button", variant: "ghost", onClick: () => setAddingDimension(dimension), children: "+ Agregar" }))] }, dimension));
                }) })] }));
}
