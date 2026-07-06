"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label, Skeleton, useToast } from "@devport/ui";
import { DEFAULT_TEMPLATE_SLUG, TEMPLATES } from "@devport/templates";
import { apiJson, ApiError } from "@/lib/client-fetch";

export function SettingsForm() {
  const router = useRouter();
  const toast = useToast();
  const [activeTemplate, setActiveTemplate] = useState(DEFAULT_TEMPLATE_SLUG);
  const [username, setUsername] = useState<string | null>(null);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiJson<{
          profile: { activeTemplate: string; username: string; published: boolean } | null;
        }>("/api/profile");
        if (data.profile) {
          setActiveTemplate(data.profile.activeTemplate);
          setUsername(data.profile.username);
          setPublished(data.profile.published);
        }
      } catch {
        /* keep default */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function togglePublished() {
    if (togglingPublish) return;
    const next = !published;
    setTogglingPublish(true);
    try {
      await apiJson("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ published: next }),
      });
      setPublished(next);
      toast.success(next ? "Portfolio published." : "Portfolio unpublished.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update visibility");
    } finally {
      setTogglingPublish(false);
    }
  }

  async function saveTemplate() {
    if (saving) return;
    setSaving(true);
    try {
      await apiJson("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ activeTemplate }),
      });
      toast.success("Template updated.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update template");
    } finally {
      setSaving(false);
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
        {loading ? (
          <Skeleton height="2.25rem" width="16rem" style={{ marginTop: "0.75rem" }} />
        ) : (
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
              {TEMPLATES.map((tpl) => (
                <option key={tpl.slug} value={tpl.slug}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button
          type="button"
          style={{ marginTop: "0.75rem" }}
          onClick={() => void saveTemplate()}
          loading={saving}
          disabled={loading}
        >
          Save template
        </Button>
      </section>
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Visibility</h2>
        {loading ? (
          <Skeleton height="2.25rem" width="16rem" style={{ marginTop: "0.75rem" }} />
        ) : (
          <>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              {published
                ? "Your portfolio is live and visible to anyone with the link."
                : "Your portfolio is unpublished; visitors will see a 404."}
            </p>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <input
                type="checkbox"
                checked={published}
                onChange={() => void togglePublished()}
                disabled={togglingPublish}
              />
              Published{username ? ` (iscoded.com/${username}/${activeTemplate})` : ""}
            </label>
          </>
        )}
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
