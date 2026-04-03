import type { CSSProperties } from "react";

export const ui = {
  fieldLabel: {
    fontSize: "0.85rem",
    color: "var(--muted)",
    marginBottom: "0.25rem",
    display: "block",
  } satisfies CSSProperties,
  input: {
    padding: "0.5rem 0.65rem",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    background: "var(--input-bg)",
    color: "var(--fg)",
    width: "100%",
    maxWidth: "24rem",
  } satisfies CSSProperties,
  textarea: {
    padding: "0.5rem 0.65rem",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    background: "var(--input-bg)",
    color: "var(--fg)",
    width: "100%",
    maxWidth: "36rem",
    minHeight: "6rem",
    resize: "vertical",
  } satisfies CSSProperties,
  card: {
    padding: "1rem 1.1rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--input-bg)",
    maxWidth: "40rem",
  } satisfies CSSProperties,
} as const;
