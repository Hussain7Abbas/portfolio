"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/components/loading-button";
import { DEFAULT_TEMPLATE_SLUG, TEMPLATES } from "@devport/templates";
import { apiJson, ApiError } from "@/lib/client-fetch";

export function SettingsForm() {
  const router = useRouter();
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
    <div className="max-w-lg">
      <h1 className="mt-0">Settings</h1>
      <section className="mb-8">
        <h2 className="text-lg">Portfolio template</h2>
        <p className="text-sm text-muted-foreground">
          Your public portfolio URL uses your username and this template key.
        </p>
        {loading ? (
          <Skeleton className="mt-3 h-9 w-64" />
        ) : (
          <div className="mt-3">
            <Label htmlFor="tpl">Active template</Label>
            <Select
              value={activeTemplate}
              onValueChange={(value) => {
                if (value) setActiveTemplate(value);
              }}
            >
              <SelectTrigger id="tpl" className="mt-1.5 max-w-64">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((tpl) => (
                  <SelectItem key={tpl.slug} value={tpl.slug}>
                    {tpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <LoadingButton
          type="button"
          className="mt-3"
          onClick={() => void saveTemplate()}
          loading={saving}
          disabled={loading}
        >
          Save template
        </LoadingButton>
      </section>
      <section className="mb-8">
        <h2 className="text-lg">Visibility</h2>
        {loading ? (
          <Skeleton className="mt-3 h-9 w-64" />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {published
                ? "Your portfolio is live and visible to anyone with the link."
                : "Your portfolio is unpublished; visitors will see a 404."}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Checkbox
                id="published"
                checked={published}
                onCheckedChange={() => void togglePublished()}
                disabled={togglingPublish}
              />
              <Label htmlFor="published" className="font-normal">
                Published{username ? ` (iscoded.com/${username}/${activeTemplate})` : ""}
              </Label>
            </div>
          </>
        )}
      </section>
      <section>
        <h2 className="text-lg">Account</h2>
        <p className="text-sm text-muted-foreground">
          Email and password are managed via Better Auth. Use sign-out and the auth flows on the sign-in page to change password if your deployment supports it.
        </p>
      </section>
    </div>
  );
}
