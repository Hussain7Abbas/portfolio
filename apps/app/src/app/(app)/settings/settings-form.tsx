"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label } from "@devport/ui";
import { apiJson } from "@/lib/client-fetch";

export function SettingsForm() {
  const router = useRouter();
  const [activeTemplate, setActiveTemplate] = useState("vscode");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiJson<{ profile: { activeTemplate: string } | null }>("/api/profile");
        if (data.profile) setActiveTemplate(data.profile.activeTemplate);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function saveTemplate() {
    setErr(null);
    setMsg(null);
    try {
      await apiJson("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ activeTemplate }),
      });
      setMsg("Template updated.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div style={{ maxWidth: "32rem" }}>
      <h1 style={{ marginTop: 0 }}>Settings</h1>
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Portfolio template</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Your public portfolio URL uses your username and this template key.
        </p>
        <div style={{ marginTop: "0.75rem" }}>
          <Label htmlFor="tpl">Active template</Label>
          <select
            id="tpl"
            value={activeTemplate}
            onChange={(e) => setActiveTemplate(e.target.value)}
            style={{
              display: "block",
              marginTop: "0.35rem",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "var(--input-bg)",
              color: "var(--fg)",
              maxWidth: "16rem",
            }}
          >
            <option value="vscode">VS Code</option>
          </select>
        </div>
        <Button type="button" style={{ marginTop: "0.75rem" }} onClick={() => void saveTemplate()}>
          Save template
        </Button>
        {msg ? <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>{msg}</p> : null}
        {err ? (
          <p role="alert" style={{ color: "var(--error)", marginTop: "0.5rem" }}>
            {err}
          </p>
        ) : null}
      </section>
      <section>
        <h2 style={{ fontSize: "1.1rem" }}>Account</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Email and password are managed via Better Auth. Use sign-out and the auth flows on the sign-in page to change password if your deployment supports it.
        </p>
      </section>
    </div>
  );
}
