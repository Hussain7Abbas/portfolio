import type { ReactNode } from "react";

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "2.5rem 1.25rem",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        background: "var(--input-bg)",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "var(--error)" }}>{title}</p>
      {description ? (
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
          {description}
        </p>
      ) : null}
      {action ? <div style={{ marginTop: "1rem" }}>{action}</div> : null}
    </div>
  );
}
