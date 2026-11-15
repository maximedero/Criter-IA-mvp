import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EPISTEMIC_TYPE_LABELS } from "../../domain/models/CanvasItem";
export function StatementCard({ statement, onEdit, onDelete }) {
    return (_jsxs("article", { children: [_jsx("p", { children: statement.content }), _jsx("small", { children: EPISTEMIC_TYPE_LABELS[statement.epistemicType] }), _jsxs("div", { children: [_jsx("button", { type: "button", onClick: onEdit, children: "Editar" }), _jsx("button", { type: "button", onClick: onDelete, children: "Eliminar" })] })] }));
}
