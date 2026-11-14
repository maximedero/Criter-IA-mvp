import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ReviewPanel({ findings }) {
    return (_jsxs("section", { children: [_jsx("h2", { children: "Revisi\u00F3n cr\u00EDtica" }), _jsx("ul", { children: findings.map((f, idx) => (_jsxs("li", { children: [f.level, ": ", f.message] }, idx))) })] }));
}
