import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { InboxPage } from "../features/inbox/inbox-page";
function AppRoutes() {
    return (_jsxs(_Fragment, { children: [_jsx("nav", { children: _jsx(Link, { to: "/", children: "Inbox" }) }), _jsx(Routes, { children: _jsx(Route, { path: "/", element: _jsx(InboxPage, {}) }) })] }));
}
export function AppRouter() {
    return (_jsx(BrowserRouter, { children: _jsx(AppRoutes, {}) }));
}
