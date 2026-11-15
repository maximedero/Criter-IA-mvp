import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { CANVAS_DIMENSIONS, CANVAS_DIMENSION_LABELS } from "../../domain/models/CanvasItem";
import { createCanvasItem, deleteCanvasItem, listCanvasItemsByCase, updateCanvasItem } from "../../providers/storage/canvasStorage";
import { CoveragePanel } from "./CoveragePanel";
import { StatementCard } from "./statement-card";
import { StatementEditor } from "./StatementEditor";
export function CanvasPage({ caseId, onItemsChange }) {
    const [items, setItems] = useState([]);
    const [addingDimension, setAddingDimension] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const refresh = () => {
        const listed = listCanvasItemsByCase(caseId);
        setItems(listed);
        onItemsChange?.(listed);
    };
    useEffect(() => {
        refresh();
    }, [caseId]);
    const editingItem = editingId ? items.find((item) => item.id === editingId) ?? null : null;
    return (_jsxs("section", { children: [_jsx("h3", { children: "Decision Canvas" }), _jsx(CoveragePanel, { items: items }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }, children: CANVAS_DIMENSIONS.map((dimension) => {
                    const dimensionItems = items.filter((item) => item.dimension === dimension);
                    const isAdding = addingDimension === dimension;
                    return (_jsxs("section", { children: [_jsx("h4", { children: CANVAS_DIMENSION_LABELS[dimension] }), dimensionItems.length === 0 ? _jsx("p", { children: "Sin contenido" }) : null, dimensionItems.map((item) => editingItem && editingItem.id === item.id ? (_jsx(StatementEditor, { submitLabel: "Guardar", initialContent: item.content, initialEpistemicType: item.epistemicType, onCancel: () => setEditingId(null), onSubmit: ({ content, epistemicType }) => {
                                    updateCanvasItem(caseId, item.id, { content, epistemicType });
                                    setEditingId(null);
                                    refresh();
                                } }, item.id)) : (_jsx(StatementCard, { statement: item, onEdit: () => setEditingId(item.id), onDelete: () => {
                                    deleteCanvasItem(caseId, item.id);
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
                                } })) : (_jsx("button", { type: "button", onClick: () => setAddingDimension(dimension), children: "+ Agregar" }))] }, dimension));
                }) })] }));
}
