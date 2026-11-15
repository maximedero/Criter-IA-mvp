import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { createDecisionCase, getDecisionCaseById, listDecisionCases } from "../../providers/storage/casesStorage";
import { CaseForm } from "./CaseForm";
function formatUpdatedAt(value) {
    return new Date(value).toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}
export function InboxPage() {
    const [items, setItems] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [viewMode, setViewMode] = useState("inbox");
    const refresh = () => {
        setItems(listDecisionCases());
    };
    useEffect(() => {
        refresh();
    }, []);
    const selectedCase = useMemo(() => {
        if (!selectedCaseId) {
            return null;
        }
        return getDecisionCaseById(selectedCaseId);
    }, [selectedCaseId, items]);
    if (viewMode === "detail" && selectedCase) {
        return (_jsxs("section", { children: [_jsx("h2", { children: "Detalle de caso" }), _jsxs("p", { children: [_jsx("strong", { children: "T\u00EDtulo:" }), " ", selectedCase.title] }), _jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", selectedCase.status] }), _jsxs("p", { children: [_jsx("strong", { children: "Relato inicial:" }), " ", selectedCase.initialNarrative] }), _jsx("button", { type: "button", onClick: () => {
                        setViewMode("inbox");
                        refresh();
                    }, children: "Volver al Inbox" })] }));
    }
    return (_jsxs("section", { children: [_jsx("h2", { children: "Inbox" }), showCreateForm ? (_jsx(CaseForm, { onCancel: () => setShowCreateForm(false), onCreate: (payload) => {
                    createDecisionCase(payload);
                    setShowCreateForm(false);
                    refresh();
                } })) : (_jsx("button", { type: "button", onClick: () => setShowCreateForm(true), children: "Nuevo caso" })), items.length === 0 ? _jsx("p", { children: "No hay casos cargados." }) : null, items.length > 0 ? (_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "T\u00EDtulo" }), _jsx("th", { children: "Estado" }), _jsx("th", { children: "Actualizado" }), _jsx("th", { children: "Acci\u00F3n" })] }) }), _jsx("tbody", { children: items.map((item) => (_jsxs("tr", { children: [_jsx("td", { children: item.title }), _jsx("td", { children: item.status }), _jsx("td", { children: formatUpdatedAt(item.updatedAt) }), _jsx("td", { children: _jsx("button", { type: "button", onClick: () => {
                                            setSelectedCaseId(item.id);
                                            setViewMode("detail");
                                        }, children: "Abrir" }) })] }, item.id))) })] })) : null] }));
}
