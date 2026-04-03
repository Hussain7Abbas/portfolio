"use client";

import { useState } from "react";
import { Input, Label } from "@devport/ui";
import { apiJson } from "@/lib/client-fetch";

type PresignedResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

export function FileUploadField({
  label,
  accept,
  onUploaded,
  disabled,
}: {
  label: string;
  accept: string;
  onUploaded: (publicUrl: string) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const presigned = await apiJson<PresignedResponse>("/api/upload/presigned-url", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
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
      onUploaded(presigned.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="file"
        accept={accept}
        disabled={disabled || loading}
        onChange={(e) => void onChange(e)}
        style={{ padding: "0.35rem", maxWidth: "none" }}
      />
      {error ? (
        <p style={{ color: "var(--error)", fontSize: "0.85rem", margin: "0.35rem 0 0" }}>
          {error}
        </p>
      ) : null}
      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.35rem 0 0" }}>
          Uploading…
        </p>
      ) : null}
    </div>
  );
}
