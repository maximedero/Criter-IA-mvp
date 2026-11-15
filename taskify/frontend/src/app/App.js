import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { InboxPage } from "../features/inbox/inbox-page";
export function App({ aiProvider }) {
    return (_jsxs("main", { children: [_jsx("h1", { children: "Decision Workspace" }), _jsx(InboxPage, { aiProvider: aiProvider })] }));
}
