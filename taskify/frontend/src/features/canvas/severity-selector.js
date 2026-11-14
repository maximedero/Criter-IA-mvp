import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SeveritySelector({ value, onChange }) {
    return (_jsxs("label", { children: ["Evaluaci\u00F3n realizada por la persona usuaria", _jsxs("select", { value: value, onChange: (e) => onChange(e.target.value), children: [_jsx("option", { value: "sin_evaluar", children: "Sin evaluar" }), _jsx("option", { value: "baja", children: "Baja" }), _jsx("option", { value: "media", children: "Media" }), _jsx("option", { value: "alta", children: "Alta" }), _jsx("option", { value: "critica", children: "Cr\u00EDtica" })] })] }));
}
