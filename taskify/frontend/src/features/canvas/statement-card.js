import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StatementCard({ statement }) {
    if (!statement) {
        return _jsx("div", { children: "Sin contenido" });
    }
    return (_jsxs("article", { children: [_jsx("p", { children: statement.content }), _jsx("small", { children: statement.epistemicType }), _jsx("small", { children: statement.validationState })] }));
}
