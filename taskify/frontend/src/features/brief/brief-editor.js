import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "../../app/ui/Button";
import "./brief-workspace.css";
export function BriefEditor({ initialContent }) {
    const [content, setContent] = useState(initialContent);
    return (_jsxs("section", { className: "dw-brief-editor", children: [_jsx("h2", { children: "Brief ejecutivo" }), _jsx("textarea", { "aria-label": "Editor de brief ejecutivo", value: content, onChange: (e) => setContent(e.target.value), rows: 12 }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => navigator.clipboard.writeText(content), children: "Copiar brief" })] }));
}
