import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "../../app/ui/Button";
import "./brief-workspace.css";
const criteria = [
    "comprension_situacion",
    "comprension_relevancia",
    "claridad_consecuencias",
    "visibilidad_evidencia",
    "visibilidad_incertidumbre",
    "claridad_alternativas",
    "claridad_pedido",
    "determinar_proximo_paso"
];
export function ComparisonPage({ controlText, aiText, onSubmitScores }) {
    const scores = {};
    criteria.forEach((c) => {
        scores[c] = 3;
    });
    return (_jsxs("section", { className: "dw-comparison-page", children: [_jsx("h2", { children: "Comparaci\u00F3n ciega" }), _jsxs("div", { className: "dw-comparison-page__grid", children: [_jsx("article", { children: controlText }), _jsx("article", { children: aiText })] }), _jsx(Button, { type: "button", onClick: () => onSubmitScores(scores), children: "Guardar evaluaci\u00F3n" })] }));
}
