import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
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
    return (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Contenido", _jsx("textarea", { value: content, onChange: (event) => setContent(event.target.value) })] }), contentError ? _jsx("p", { children: contentError }) : null, _jsx(EpistemicTypeSelector, { value: epistemicType, onChange: setEpistemicType }), _jsxs("div", { children: [_jsx("button", { type: "button", onClick: onCancel, children: "Cancelar" }), _jsx("button", { type: "submit", children: submitLabel })] })] }));
}
