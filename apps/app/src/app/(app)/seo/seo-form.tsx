"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/loading-button";
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
      <div className="max-w-lg">
        <h1 className="mt-0">SEO</h1>
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-9" />
          <Skeleton className="h-20" />
          <Skeleton className="h-9" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="mt-0">SEO</h1>
      <p className="text-sm text-muted-foreground">
        Overrides for your public portfolio pages (Open Graph and search snippets).
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <Label htmlFor="t">Title</Label>
          <Input
            id="t"
            value={seo.title ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSeo({ ...seo, title: e.target.value || null })
            }
          />
        </div>
        <div>
          <Label htmlFor="d">Description</Label>
          <Textarea
            id="d"
            value={seo.description ?? ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setSeo({ ...seo, description: e.target.value || null })
            }
          />
        </div>
        <div>
          <Label htmlFor="k">Keywords (comma-separated)</Label>
          <Input
            id="k"
            value={seo.keywords ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSeo({ ...seo, keywords: e.target.value || null })
            }
          />
        </div>
        <FileUploadField
          label="Open Graph image"
          accept="image/*"
          currentUrl={seo.ogImage}
          onUploaded={(u) => setSeo({ ...seo, ogImage: u })}
          onCleared={() => setSeo({ ...seo, ogImage: null })}
        />
        <div>
          <Label htmlFor="og" className="text-xs">
            Or paste an OG image URL
          </Label>
          <Input
            id="og"
            value={seo.ogImage ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSeo({ ...seo, ogImage: e.target.value || null })
            }
          />
        </div>
        <LoadingButton type="button" onClick={() => void save()} loading={saving}>
          Save
        </LoadingButton>
      </div>
    </div>
  );
}
