import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "2.5rem 1.25rem",
        border: "1px dashed var(--border)",
        borderRadius: "8px",
        color: "var(--muted)",
      }}
    >
      {icon ? (
        <div style={{ marginBottom: "0.75rem", fontSize: "1.75rem" }}>{icon}</div>
      ) : null}
      <p style={{ margin: 0, fontWeight: 600, color: "var(--fg)" }}>{title}</p>
      {description ? (
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>{description}</p>
      ) : null}
      {action ? <div style={{ marginTop: "1rem" }}>{action}</div> : null}
    </div>
  );
}
