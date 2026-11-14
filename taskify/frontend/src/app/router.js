import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { InboxPage } from "../features/inbox/inbox-page";
import { CanvasPage } from "../features/canvas/canvas-page";
function AppRoutes() {
    const [selectedCaseId, setSelectedCaseId] = useState("");
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { children: [_jsx(Link, { to: "/", children: "Inbox" }), selectedCaseId ? _jsx(Link, { to: "/canvas", children: "Canvas" }) : null] }), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(InboxPage, { onOpenCase: (id) => setSelectedCaseId(id) }) }), _jsx(Route, { path: "/canvas", element: selectedCaseId ? _jsx(CanvasPage, { caseId: selectedCaseId }) : _jsx("p", { children: "Seleccione un caso" }) })] })] }));
}
export function AppRouter() {
    return (_jsx(BrowserRouter, { children: _jsx(AppRoutes, {}) }));
}
