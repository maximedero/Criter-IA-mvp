import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import "./button.css";
export const Button = forwardRef(function Button({ variant = "primary", loading = false, disabled, className = "", children, ...rest }, ref) {
    const isDisabled = Boolean(disabled || loading);
    return (_jsxs("button", { ...rest, ref: ref, className: `dw-btn dw-btn--${variant} ${loading ? "dw-btn--loading" : ""} ${className}`.trim(), disabled: isDisabled, "aria-busy": loading ? "true" : "false", "data-variant": variant, children: [_jsx("span", { className: "dw-btn__content", children: children }), loading ? _jsx("span", { className: "dw-btn__spinner", "aria-hidden": "true" }) : null] }));
});
