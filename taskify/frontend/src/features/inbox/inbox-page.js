import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { createCase, listCases } from "../../services/api-client";
export function InboxPage({ onOpenCase }) {
    const [cases, setCases] = useState([]);
    const [title, setTitle] = useState("");
    const [informalDescription, setInformalDescription] = useState("");
    const refresh = async () => {
        const data = await listCases();
        setCases(data);
    };
    useEffect(() => {
        refresh();
    }, []);
    const onSubmit = async (event) => {
        event.preventDefault();
        const created = await createCase({ title, informalDescription });
        setTitle("");
        setInformalDescription("");
        await refresh();
        onOpenCase(created.id);
    };
    return (_jsxs("main", { children: [_jsx("h1", { children: "Decision Inbox" }), _jsxs("form", { onSubmit: onSubmit, children: [_jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "T\u00EDtulo del caso", required: true }), _jsx("textarea", { value: informalDescription, onChange: (e) => setInformalDescription(e.target.value), placeholder: "Descripci\u00F3n informal", required: true }), _jsx("button", { type: "submit", children: "Nuevo caso" })] }), _jsx("ul", { children: cases.map((c) => (_jsxs("li", { children: [_jsx("button", { onClick: () => onOpenCase(c.id), children: c.title }), " - ", c.status] }, c.id))) })] }));
}
