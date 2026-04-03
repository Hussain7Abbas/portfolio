"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label, Textarea } from "@devport/ui";
import { apiFetch, apiJson } from "@/lib/client-fetch";
import { FileUploadField } from "@/components/file-upload";

type Project = {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  tags: string[];
  demoUrl: string | null;
  sourceUrl: string | null;
  order: number;
};

export function ProjectsClient() {
  const router = useRouter();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await apiJson<{ projects: Project[] }>("/api/projects");
      setItems(data.projects);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiJson("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          demoUrl: demoUrl || null,
          sourceUrl: sourceUrl || null,
          image: imageUrl,
        }),
      });
      setName("");
      setDescription("");
      setTags("");
      setDemoUrl("");
      setSourceUrl("");
      setImageUrl(null);
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await load();
    router.refresh();
  }

  async function reorder(ids: string[]) {
    await apiJson("/api/projects/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    });
    await load();
    router.refresh();
  }

  function move(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const ids = items.map((i) => i.id);
    const a = ids[idx];
    const b = ids[next];
    if (a === undefined || b === undefined) return;
    ids[idx] = b;
    ids[next] = a;
    void reorder(ids);
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Projects</h1>
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
        <h2 style={{ fontSize: "1.1rem" }}>Add project</h2>
        <div>
          <Label htmlFor="pname">Name</Label>
          <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="pdesc">Description</Label>
          <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ptags">Tags (comma-separated)</Label>
          <Input id="ptags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <FileUploadField label="Cover image" accept="image/*" onUploaded={(u) => setImageUrl(u)} />
        <div>
          <Label htmlFor="pimg">Image URL</Label>
          <Input id="pimg" value={imageUrl ?? ""} onChange={(e) => setImageUrl(e.target.value || null)} />
        </div>
        <div>
          <Label htmlFor="pdemo">Demo URL</Label>
          <Input id="pdemo" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="psrc">Source URL</Label>
          <Input id="psrc" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
        </div>
        <Button type="submit">Add</Button>
      </form>

      <h2 style={{ fontSize: "1.1rem" }}>Your projects</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((proj, idx) => (
          <li key={proj.id}>
            <Card>
              <strong>{proj.name}</strong>
              {proj.description ? (
                <p style={{ margin: "0.35rem 0", color: "var(--muted)", fontSize: "0.9rem" }}>{proj.description}</p>
              ) : null}
              <p style={{ margin: 0, fontSize: "0.85rem" }}>
                {proj.tags.join(", ")}
              </p>
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                <Button variant="secondary" type="button" onClick={() => move(idx, -1)} disabled={idx === 0}>
                  Up
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                >
                  Down
                </Button>
                <Button variant="danger" type="button" onClick={() => void remove(proj.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
