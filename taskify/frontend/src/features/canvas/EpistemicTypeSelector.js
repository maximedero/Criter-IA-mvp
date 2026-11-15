import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EPISTEMIC_TYPE_LABELS, EPISTEMIC_TYPES } from "../../domain/models/CanvasItem";
export function EpistemicTypeSelector({ value, onChange }) {
    return (_jsxs("label", { children: ["Tipo epistemol\u00F3gico", _jsx("select", { value: value, onChange: (event) => onChange(event.target.value), children: EPISTEMIC_TYPES.map((item) => (_jsx("option", { value: item, children: EPISTEMIC_TYPE_LABELS[item] }, item))) })] }));
}
