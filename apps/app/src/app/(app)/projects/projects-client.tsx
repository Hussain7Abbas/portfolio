"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Skeleton,
  Textarea,
  useConfirm,
  useToast,
} from "@devport/ui";
import { apiFetch, apiJson, ApiError } from "@/lib/client-fetch";
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

type FormState = {
  name: string;
  description: string;
  tags: string;
  demoUrl: string;
  sourceUrl: string;
  imageUrl: string | null;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  tags: "",
  demoUrl: "",
  sourceUrl: "",
  imageUrl: null,
};

function toForm(p: Project): FormState {
  return {
    name: p.name,
    description: p.description ?? "",
    tags: p.tags.join(", "),
    demoUrl: p.demoUrl ?? "",
    sourceUrl: p.sourceUrl ?? "",
    imageUrl: p.image,
  };
}

function toPayload(f: FormState) {
  return {
    name: f.name.trim(),
    description: f.description.trim() || null,
    tags: f.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    demoUrl: f.demoUrl.trim() || null,
    sourceUrl: f.sourceUrl.trim() || null,
    image: f.imageUrl,
  };
}

function ProjectFields({
  form,
  onChange,
  idPrefix,
}: {
  form: FormState;
  onChange: (next: FormState) => void;
  idPrefix: string;
}) {
  return (
    <>
      <div>
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-desc`}>Description</Label>
        <Textarea
          id={`${idPrefix}-desc`}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-tags`}>Tags (comma-separated)</Label>
        <Input
          id={`${idPrefix}-tags`}
          value={form.tags}
          onChange={(e) => onChange({ ...form, tags: e.target.value })}
        />
      </div>
      <FileUploadField
        label="Cover image"
        accept="image/*"
        currentUrl={form.imageUrl}
        onUploaded={(u) => onChange({ ...form, imageUrl: u })}
        onCleared={() => onChange({ ...form, imageUrl: null })}
      />
      <div>
        <Label htmlFor={`${idPrefix}-img`} style={{ fontSize: "0.78rem" }}>
          Or paste an image URL
        </Label>
        <Input
          id={`${idPrefix}-img`}
          value={form.imageUrl ?? ""}
          onChange={(e) => onChange({ ...form, imageUrl: e.target.value || null })}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-demo`}>Demo URL</Label>
        <Input
          id={`${idPrefix}-demo`}
          value={form.demoUrl}
          onChange={(e) => onChange({ ...form, demoUrl: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-src`}>Source URL</Label>
        <Input
          id={`${idPrefix}-src`}
          value={form.sourceUrl}
          onChange={(e) => onChange({ ...form, sourceUrl: e.target.value })}
        />
      </div>
    </>
  );
}

export function ProjectsClient() {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);

  const [pendingId, setPendingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiJson<{ projects: Project[] }>("/api/projects");
      setItems(data.projects);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (adding) return;
    setAdding(true);
    try {
      await apiJson("/api/projects", {
        method: "POST",
        body: JSON.stringify(toPayload(addForm)),
      });
      setAddForm(emptyForm);
      toast.success("Project added.");
      await load();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add project");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(p: Project) {
    setEditingId(p.id);
    setEditForm(toForm(p));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || savingEdit) return;
    setSavingEdit(true);
    try {
      await apiJson(`/api/projects/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(toPayload(editForm)),
      });
      toast.success("Project updated.");
      cancelEdit();
      await load();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update project");
    } finally {
      setSavingEdit(false);
    }
  }

  async function remove(project: Project) {
    const ok = await confirm({
      title: "Delete project?",
      description: `"${project.name}" will be permanently removed from your portfolio.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setPendingId(project.id);
    try {
      const res = await apiFetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete project");
      }
      toast.success("Project deleted.");
      await load();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setPendingId(null);
    }
  }

  async function reorder(ids: string[]) {
    const previous = items;
    setItems((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      return ids.map((id) => byId.get(id)).filter((p): p is Project => Boolean(p));
    });
    try {
      await apiJson("/api/projects/reorder", {
        method: "PUT",
        body: JSON.stringify({ ids }),
      });
      router.refresh();
    } catch (err) {
      setItems(previous);
      toast.error(err instanceof ApiError ? err.message : "Failed to reorder projects");
    }
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

      <form
        onSubmit={(e) => void add(e)}
        style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.65rem", maxWidth: "28rem" }}
      >
        <h2 style={{ fontSize: "1.1rem" }}>Add project</h2>
        <ProjectFields form={addForm} onChange={setAddForm} idPrefix="add" />
        <Button type="submit" loading={adding}>
          Add
        </Button>
      </form>

      <h2 style={{ fontSize: "1.1rem" }}>Your projects</h2>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "28rem" }}>
          <Skeleton height="5rem" />
          <Skeleton height="5rem" />
        </div>
      ) : loadError ? (
        <p role="alert" style={{ color: "var(--error)" }}>
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add your first project above to showcase it on your portfolio."
        />
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((proj, idx) =>
            editingId === proj.id ? (
              <li key={proj.id}>
                <Card>
                  <form
                    onSubmit={(e) => void saveEdit(e)}
                    style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxWidth: "26rem" }}
                  >
                    <ProjectFields form={editForm} onChange={setEditForm} idPrefix={`edit-${proj.id}`} />
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <Button type="submit" loading={savingEdit}>
                        Save
                      </Button>
                      <Button type="button" variant="secondary" onClick={cancelEdit} disabled={savingEdit}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              </li>
            ) : (
              <li key={proj.id}>
                <Card>
                  <strong>{proj.name}</strong>
                  {proj.description ? (
                    <p style={{ margin: "0.35rem 0", color: "var(--muted)", fontSize: "0.9rem" }}>
                      {proj.description}
                    </p>
                  ) : null}
                  {proj.tags.length > 0 ? (
                    <p style={{ margin: 0, fontSize: "0.85rem" }}>{proj.tags.join(", ")}</p>
                  ) : null}
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0 || pendingId !== null}
                    >
                      Up
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => move(idx, 1)}
                      disabled={idx === items.length - 1 || pendingId !== null}
                    >
                      Down
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => startEdit(proj)}
                      disabled={pendingId !== null}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      type="button"
                      onClick={() => void remove(proj)}
                      loading={pendingId === proj.id}
                      disabled={pendingId !== null && pendingId !== proj.id}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </li>
            ),
          )}
        </ul>
      )}
      {dialog}
    </div>
  );
}
