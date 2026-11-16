import React, { forwardRef } from "react";
import "./button.css";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading = false, disabled, className = "", children, ...rest },
  ref
) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      {...rest}
      ref={ref}
      className={`dw-btn dw-btn--${variant} ${loading ? "dw-btn--loading" : ""} ${className}`.trim()}
      disabled={isDisabled}
      aria-busy={loading ? "true" : "false"}
      data-variant={variant}
    >
      <span className="dw-btn__content">{children}</span>
      {loading ? <span className="dw-btn__spinner" aria-hidden="true" /> : null}
    </button>
  );
});
