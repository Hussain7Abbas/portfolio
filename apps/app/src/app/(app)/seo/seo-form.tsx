"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Skeleton, Textarea, useToast } from "@devport/ui";
import { apiJson, ApiError } from "@/lib/client-fetch";
import { FileUploadField } from "@/components/file-upload";

type Seo = {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  keywords: string | null;
};

export function SeoForm() {
  const router = useRouter();
  const toast = useToast();
  const [seo, setSeo] = useState<Seo>({
    title: null,
    description: null,
    ogImage: null,
    keywords: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiJson<{ seoMeta: Seo | null }>("/api/seo");
        if (data.seoMeta) setSeo(data.seoMeta);
      } catch {
        /* no overrides saved yet */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    if (saving) return;
    setSaving(true);
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
      toast.success("SEO settings saved.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: "32rem" }}>
        <h1 style={{ marginTop: 0 }}>SEO</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          <Skeleton height="2.25rem" />
          <Skeleton height="5rem" />
          <Skeleton height="2.25rem" />
        </div>
      </div>
    );
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
        <FileUploadField
          label="Open Graph image"
          accept="image/*"
          currentUrl={seo.ogImage}
          onUploaded={(u) => setSeo({ ...seo, ogImage: u })}
          onCleared={() => setSeo({ ...seo, ogImage: null })}
        />
        <div>
          <Label htmlFor="og" style={{ fontSize: "0.78rem" }}>
            Or paste an OG image URL
          </Label>
          <Input id="og" value={seo.ogImage ?? ""} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value || null })} />
        </div>
        <Button type="button" onClick={() => void save()} loading={saving}>
          Save
        </Button>
      </div>
    </div>
  );
}
