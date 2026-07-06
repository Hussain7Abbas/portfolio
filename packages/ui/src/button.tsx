import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Spinner } from "./spinner";

const variants: Record<
  "primary" | "secondary" | "danger",
  CSSProperties
> = {
  primary: {
    padding: "0.5rem 0.85rem",
    borderRadius: "6px",
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  secondary: {
    padding: "0.5rem 0.85rem",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--fg)",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  danger: {
    padding: "0.5rem 0.85rem",
    borderRadius: "6px",
    border: "none",
    background: "var(--error)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
};

export function Button({
  variant = "primary",
  type = "button",
  style,
  disabled,
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  loading?: boolean;
}) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      style={{
        ...variants[variant],
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        ...(isDisabled ? { opacity: 0.65, cursor: "not-allowed" } : {}),
        ...style,
      }}
      {...props}
    >
      {loading ? <Spinner size={13} /> : null}
      {children}
    </button>
  );
}
