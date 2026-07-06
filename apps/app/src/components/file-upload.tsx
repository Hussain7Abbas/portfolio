"use client";

import { useState } from "react";
import { Button, Input, Label, Spinner } from "@devport/ui";
import { apiFetch, apiJson, ApiError } from "@/lib/client-fetch";

type PresignedResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

const DEFAULT_MAX_IMAGE_MB = 5;
const DEFAULT_MAX_PDF_MB = 10;

// Must mirror ALLOWED_CONTENT_TYPES in apps/backend/src/routes/upload.ts
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
      /* best-effort cleanup of the replaced/removed object; safe to ignore */
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
    <div>
      <Label>{label}</Label>
      {currentUrl && isImage ? (
        <div style={{ marginBottom: "0.5rem" }}>
          <img
            src={currentUrl}
            alt=""
            style={{
              width: "4.5rem",
              height: "4.5rem",
              objectFit: "cover",
              borderRadius: "6px",
              border: "1px solid var(--border)",
            }}
          />
        </div>
      ) : currentUrl ? (
        <p style={{ fontSize: "0.85rem", margin: "0 0 0.5rem" }}>
          <a href={currentUrl} target="_blank" rel="noreferrer">
            View current file
          </a>
        </p>
      ) : null}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <Input
          type="file"
          accept={accept}
          disabled={disabled || loading}
          onChange={(e) => void onChange(e)}
          style={{ padding: "0.35rem", maxWidth: "none" }}
        />
        {loading ? <Spinner size={14} /> : null}
        {currentUrl && !loading ? (
          <Button type="button" variant="secondary" onClick={clear} disabled={disabled}>
            Remove
          </Button>
        ) : null}
      </div>
      <p style={{ color: "var(--muted)", fontSize: "0.78rem", margin: "0.3rem 0 0" }}>Max {maxMb} MB.</p>
      {error ? (
        <p role="alert" style={{ color: "var(--error)", fontSize: "0.85rem", margin: "0.35rem 0 0" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
