import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "../../app/ui/Button";
import { EpistemicTypeSelector } from "./EpistemicTypeSelector";
export function StatementEditor({ submitLabel, initialContent = "", initialEpistemicType = "FACT", onCancel, onSubmit }) {
    const [content, setContent] = useState(initialContent);
    const [epistemicType, setEpistemicType] = useState(initialEpistemicType);
    const [contentError, setContentError] = useState(null);
    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) {
            setContentError("Contenido es obligatorio");
            return;
        }
        setContentError(null);
        onSubmit({ content: trimmed, epistemicType });
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "dw-statement-editor", children: [_jsxs("label", { children: ["Contenido", _jsx("textarea", { value: content, onChange: (event) => setContent(event.target.value), "aria-invalid": contentError ? "true" : "false", "aria-describedby": contentError ? "statement-editor-content-error" : undefined })] }), contentError ? (_jsx("p", { id: "statement-editor-content-error", className: "dw-canvas-alert", role: "alert", children: contentError })) : null, _jsx(EpistemicTypeSelector, { value: epistemicType, onChange: setEpistemicType }), _jsxs("div", { className: "dw-statement-editor__actions", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, children: "Cancelar" }), _jsx(Button, { type: "submit", children: submitLabel })] })] }));
}
