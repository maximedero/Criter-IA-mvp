import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export function CaseForm({ onCancel, onCreate }) {
    const [title, setTitle] = useState("");
    const [initialNarrative, setInitialNarrative] = useState("");
    const [titleError, setTitleError] = useState(null);
    const [narrativeError, setNarrativeError] = useState(null);
    const onSubmit = (event) => {
        event.preventDefault();
        const safeTitle = title.trim();
        const safeNarrative = initialNarrative.trim();
        const hasTitleError = !safeTitle;
        const hasNarrativeError = !safeNarrative;
        setTitleError(hasTitleError ? "Título es obligatorio" : null);
        setNarrativeError(hasNarrativeError ? "¿Qué está pasando? es obligatorio" : null);
        if (hasTitleError || hasNarrativeError) {
            return;
        }
        onCreate({ title: safeTitle, initialNarrative: safeNarrative });
        setTitle("");
        setInitialNarrative("");
    };
    return (_jsxs("form", { onSubmit: onSubmit, "aria-label": "create-case-form", children: [_jsx("h2", { children: "Nuevo caso" }), _jsxs("label", { children: ["T\u00EDtulo", _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value) })] }), titleError ? _jsx("p", { children: titleError }) : null, _jsxs("label", { children: ["\u00BFQu\u00E9 est\u00E1 pasando?", _jsx("textarea", { value: initialNarrative, onChange: (e) => setInitialNarrative(e.target.value) })] }), narrativeError ? _jsx("p", { children: narrativeError }) : null, _jsxs("div", { children: [_jsx("button", { type: "button", onClick: onCancel, children: "Cancelar" }), _jsx("button", { type: "submit", children: "Crear caso" })] })] }));
}
