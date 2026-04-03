"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea } from "@devport/ui";
import { apiJson } from "@/lib/client-fetch";
import { FileUploadField } from "@/components/file-upload";

type Seo = {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  keywords: string | null;
};

export function SeoForm() {
  const router = useRouter();
  const [seo, setSeo] = useState<Seo>({
    title: null,
    description: null,
    ogImage: null,
    keywords: null,
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiJson<{ seoMeta: Seo | null }>("/api/seo");
        if (data.seoMeta) setSeo(data.seoMeta);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setErr(null);
    setMsg(null);
    try {
      await apiJson("/api/seo", {
        method: "PUT",
        body: JSON.stringify({
          title: seo.title,
          description: seo.description,
          ogImage: seo.ogImage,
          keywords: seo.keywords,
        }),
      });
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  if (loading) {
    return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  }

  return (
    <div style={{ maxWidth: "32rem" }}>
      <h1 style={{ marginTop: 0 }}>SEO</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Overrides for your public portfolio pages (Open Graph and search snippets).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        <div>
          <Label htmlFor="t">Title</Label>
          <Input id="t" value={seo.title ?? ""} onChange={(e) => setSeo({ ...seo, title: e.target.value || null })} />
        </div>
        <div>
          <Label htmlFor="d">Description</Label>
          <Textarea
            id="d"
            value={seo.description ?? ""}
            onChange={(e) => setSeo({ ...seo, description: e.target.value || null })}
          />
        </div>
        <div>
          <Label htmlFor="k">Keywords (comma-separated)</Label>
          <Input id="k" value={seo.keywords ?? ""} onChange={(e) => setSeo({ ...seo, keywords: e.target.value || null })} />
        </div>
        <FileUploadField label="Open Graph image" accept="image/*" onUploaded={(u) => setSeo({ ...seo, ogImage: u })} />
        <div>
          <Label htmlFor="og">OG image URL</Label>
          <Input id="og" value={seo.ogImage ?? ""} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value || null })} />
        </div>
        <Button type="button" onClick={() => void save()}>
          Save
        </Button>
        {msg ? <p style={{ color: "var(--muted)" }}>{msg}</p> : null}
        {err ? (
          <p role="alert" style={{ color: "var(--error)" }}>
            {err}
          </p>
        ) : null}
      </div>
    </div>
  );
}
