"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, apiJson, ApiError } from "@/lib/client-fetch";

type PresignedResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

const DEFAULT_MAX_IMAGE_MB = 5;
const DEFAULT_MAX_PDF_MB = 10;

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
]);

function maxBytesFor(accept: string, maxSizeMB?: number): number {
  if (maxSizeMB) return maxSizeMB * 1024 * 1024;
  return (accept.includes("pdf") ? DEFAULT_MAX_PDF_MB : DEFAULT_MAX_IMAGE_MB) * 1024 * 1024;
}

export function FileUploadField({
  label,
  accept,
  onUploaded,
  onCleared,
  currentUrl,
  disabled,
  maxSizeMB,
}: {
  label: string;
  accept: string;
  onUploaded: (publicUrl: string) => void;
  onCleared?: () => void;
  currentUrl?: string | null;
  disabled?: boolean;
  maxSizeMB?: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isImage = accept.includes("image");
  const maxBytes = maxBytesFor(accept, maxSizeMB);
  const maxMb = Math.round(maxBytes / (1024 * 1024));

  async function deleteExisting(url: string) {
    try {
      await apiFetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl: url }),
      });
    } catch {
      /* best-effort cleanup */
    }
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    if (file.size > maxBytes) {
      setError(`File is too large (max ${maxMb} MB).`);
      return;
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Unsupported file type.");
      return;
    }

    setLoading(true);
    try {
      const presigned = await apiJson<PresignedResponse>("/api/upload/presigned-url", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          contentLength: file.size,
        }),
      });
      const put = await fetch(presigned.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!put.ok) {
        throw new Error("Upload failed");
      }
      if (currentUrl) {
        void deleteExisting(currentUrl);
      }
      onUploaded(presigned.publicUrl);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    if (currentUrl) {
      void deleteExisting(currentUrl);
    }
    onCleared?.();
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {currentUrl && isImage ? (
        <img
          src={currentUrl}
          alt=""
          className="h-[4.5rem] w-[4.5rem] rounded-md border object-cover"
        />
      ) : currentUrl ? (
        <p className="text-sm">
          <a href={currentUrl} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
            View current file
          </a>
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="file"
          accept={accept}
          disabled={disabled || loading}
          onChange={(e) => void onChange(e)}
          className="max-w-none cursor-pointer p-1"
        />
        {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
        {currentUrl && !loading ? (
          <Button type="button" variant="outline" onClick={clear} disabled={disabled}>
            Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">Max {maxMb} MB.</p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
