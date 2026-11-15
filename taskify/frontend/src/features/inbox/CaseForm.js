import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "../../app/ui/Button";
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
    return (_jsxs("form", { onSubmit: onSubmit, "aria-label": "create-case-form", children: [_jsx("h2", { children: "Nuevo caso" }), _jsxs("label", { children: ["T\u00EDtulo", _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), "aria-invalid": titleError ? "true" : "false", "aria-describedby": titleError ? "case-form-title-error" : undefined })] }), titleError ? (_jsx("p", { id: "case-form-title-error", role: "alert", children: titleError })) : null, _jsxs("label", { children: ["\u00BFQu\u00E9 est\u00E1 pasando?", _jsx("textarea", { value: initialNarrative, onChange: (e) => setInitialNarrative(e.target.value), "aria-invalid": narrativeError ? "true" : "false", "aria-describedby": narrativeError ? "case-form-narrative-error" : undefined })] }), narrativeError ? (_jsx("p", { id: "case-form-narrative-error", role: "alert", children: narrativeError })) : null, _jsxs("div", { children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, children: "Cancelar" }), _jsx(Button, { type: "submit", children: "Crear caso" })] })] }));
}
