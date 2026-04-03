import type { ButtonHTMLAttributes, CSSProperties } from "react";

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
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      type={type}
      style={{ ...variants[variant], ...style }}
      {...props}
    />
  );
}
