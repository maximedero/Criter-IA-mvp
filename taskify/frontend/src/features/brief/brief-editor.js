import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export function BriefEditor({ initialContent }) {
    const [content, setContent] = useState(initialContent);
    return (_jsxs("section", { children: [_jsx("h2", { children: "Brief ejecutivo" }), _jsx("textarea", { "aria-label": "Editor de brief ejecutivo", value: content, onChange: (e) => setContent(e.target.value), rows: 12 }), _jsx("button", { type: "button", onClick: () => navigator.clipboard.writeText(content), children: "Copiar brief" })] }));
}
