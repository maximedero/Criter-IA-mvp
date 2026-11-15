import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { EPISTEMIC_TYPE_LABELS } from "../../domain/models/CanvasItem";
import { Button } from "../../app/ui/Button";
export function StatementCard({ statement, onEdit, onDelete, onAcceptAI, onEditAI, onRejectAI }) {
    const [editingAi, setEditingAi] = useState(false);
    const [editedContent, setEditedContent] = useState(statement.content);
    const [editError, setEditError] = useState(null);
    const isAi = statement.origin === "AI";
    const isPendingAi = isAi && statement.validationStatus === "PENDING";
    if (statement.validationStatus === "REJECTED") {
        return null;
    }
    return (_jsxs("article", { className: "dw-statement-card", children: [isAi ? _jsx("p", { children: "Sugerido por IA" }) : null, _jsx("p", { children: statement.content }), _jsx("small", { children: EPISTEMIC_TYPE_LABELS[statement.epistemicType] }), isAi && statement.aiSuggestion ? (_jsxs(_Fragment, { children: [_jsxs("p", { children: [_jsx("strong", { children: "Por qu\u00E9 se sugiere:" }), " ", statement.aiSuggestion.rationale] }), _jsx("p", { children: "Origen de la sugerencia: relato inicial." })] })) : null, isAi && statement.validationStatus === "VALIDATED" ? _jsx("p", { children: "Validado por el usuario." }) : null, isAi && statement.validationStatus === "EDITED" ? _jsx("p", { children: "Editado por el usuario." }) : null, isPendingAi ? (_jsx("div", { children: editingAi ? (_jsxs("form", { onSubmit: (event) => {
                        event.preventDefault();
                        const trimmed = editedContent.trim();
                        if (!trimmed) {
                            setEditError("Contenido es obligatorio");
                            return;
                        }
                        setEditError(null);
                        onEditAI?.(trimmed);
                        setEditingAi(false);
                    }, children: [_jsxs("label", { children: ["Editar sugerencia", _jsx("textarea", { value: editedContent, onChange: (event) => setEditedContent(event.target.value), "aria-invalid": editError ? "true" : "false", "aria-describedby": editError ? `statement-card-edit-error-${statement.id}` : undefined })] }), editError ? (_jsx("p", { id: `statement-card-edit-error-${statement.id}`, className: "dw-canvas-alert", role: "alert", children: editError })) : null, _jsxs("div", { className: "dw-statement-card__actions", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => setEditingAi(false), children: "Cancelar edici\u00F3n" }), _jsx(Button, { type: "submit", children: "Guardar edici\u00F3n" })] })] })) : (_jsxs("div", { className: "dw-statement-card__actions", children: [_jsx(Button, { type: "button", onClick: onAcceptAI, children: "Aceptar" }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => setEditingAi(true), children: "Editar" }), _jsx(Button, { type: "button", variant: "ghost", onClick: onRejectAI, children: "Rechazar" })] })) })) : (_jsxs("div", { className: "dw-statement-card__actions", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onEdit, children: "Editar" }), _jsx(Button, { type: "button", variant: "ghost", onClick: onDelete, children: "Eliminar" })] }))] }));
}
