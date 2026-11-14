import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { createStatement, listStatements } from "../../services/api-client";
import { StatementCard } from "./statement-card";
import { QuestionPanel } from "./question-panel";
const dimensions = [
    "contexto_senal",
    "exposicion",
    "evidencia",
    "impactos",
    "incertidumbres",
    "escenarios",
    "alternativas",
    "intervencion_requerida"
];
export function CanvasPage({ caseId }) {
    const [statements, setStatements] = useState([]);
    const refresh = async () => {
        const data = await listStatements(caseId);
        setStatements(data);
    };
    useEffect(() => {
        refresh();
    }, [caseId]);
    const addDraftStatement = async (dimensionType) => {
        await createStatement(caseId, {
            dimensionType,
            content: `Pendiente en ${dimensionType}`,
            epistemicType: "dato_faltante"
        });
        await refresh();
    };
    return (_jsxs("main", { children: [_jsx("h1", { children: "Decision Canvas" }), _jsx(QuestionPanel, { caseId: caseId }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }, children: dimensions.map((dimension) => {
                    const first = statements.find((s) => s.dimensionType === dimension);
                    return (_jsxs("section", { children: [_jsx("h2", { children: dimension }), _jsx(StatementCard, { statement: first }), _jsx("button", { onClick: () => addDraftStatement(dimension), children: "Agregar elemento" })] }, dimension));
                }) })] }));
}
