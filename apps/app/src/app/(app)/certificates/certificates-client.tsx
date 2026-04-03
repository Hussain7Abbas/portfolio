"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label, Textarea } from "@devport/ui";
import { apiFetch, apiJson } from "@/lib/client-fetch";
import { FileUploadField } from "@/components/file-upload";

type Row = {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  url: string | null;
};

export function CertificatesClient() {
  const router = useRouter();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await apiJson<{ certificates: Row[] }>("/api/certificates");
      setItems(data.certificates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiJson("/api/certificates", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || null,
          url: url || null,
          image: imageUrl,
        }),
      });
      setName("");
      setDescription("");
      setUrl("");
      setImageUrl(null);
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    const res = await apiFetch(`/api/certificates/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await load();
    router.refresh();
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Certificates</h1>
      {loading ? <p style={{ color: "var(--muted)" }}>Loading…</p> : null}
      {error ? (
        <p role="alert" style={{ color: "var(--error)" }}>
          {error}
        </p>
      ) : null}
      <form
        onSubmit={(e) => void add(e)}
        style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.65rem", maxWidth: "28rem" }}
      >
        <h2 style={{ fontSize: "1.1rem" }}>Add certificate</h2>
        <div>
          <Label htmlFor="n">Name</Label>
          <Input id="n" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="d">Description</Label>
          <Textarea id="d" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <FileUploadField label="Image" accept="image/*" onUploaded={(u) => setImageUrl(u)} />
        <div>
          <Label htmlFor="img">Image URL</Label>
          <Input id="img" value={imageUrl ?? ""} onChange={(e) => setImageUrl(e.target.value || null)} />
        </div>
        <div>
          <Label htmlFor="u">Credential URL</Label>
          <Input id="u" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <Button type="submit">Add</Button>
      </form>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((c) => (
          <li key={c.id}>
            <Card>
              <strong>{c.name}</strong>
              {c.description ? <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{c.description}</p> : null}
              <Button variant="danger" type="button" onClick={() => void remove(c.id)}>
                Delete
              </Button>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
