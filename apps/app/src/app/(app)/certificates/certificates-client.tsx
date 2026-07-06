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

type Row = {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  url: string | null;
};

type FormState = {
  name: string;
  description: string;
  url: string;
  imageUrl: string | null;
};

const emptyForm: FormState = { name: "", description: "", url: "", imageUrl: null };

function toForm(r: Row): FormState {
  return {
    name: r.name,
    description: r.description ?? "",
    url: r.url ?? "",
    imageUrl: r.image,
  };
}

function toPayload(f: FormState) {
  return {
    name: f.name.trim(),
    description: f.description.trim() || null,
    url: f.url.trim() || null,
    image: f.imageUrl,
  };
}

function CertificateFields({
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
      <FileUploadField
        label="Image"
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
        <Label htmlFor={`${idPrefix}-url`}>Credential URL</Label>
        <Input
          id={`${idPrefix}-url`}
          value={form.url}
          onChange={(e) => onChange({ ...form, url: e.target.value })}
        />
      </div>
    </>
  );
}

export function CertificatesClient() {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [items, setItems] = useState<Row[]>([]);
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
      const data = await apiJson<{ certificates: Row[] }>("/api/certificates");
      setItems(data.certificates);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Failed to load certificates");
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
      await apiJson("/api/certificates", {
        method: "POST",
        body: JSON.stringify(toPayload(addForm)),
      });
      setAddForm(emptyForm);
      toast.success("Certificate added.");
      await load();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add certificate");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(r: Row) {
    setEditingId(r.id);
    setEditForm(toForm(r));
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
      await apiJson(`/api/certificates/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(toPayload(editForm)),
      });
      toast.success("Certificate updated.");
      cancelEdit();
      await load();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update certificate");
    } finally {
      setSavingEdit(false);
    }
  }

  async function remove(row: Row) {
    const ok = await confirm({
      title: "Delete certificate?",
      description: `"${row.name}" will be permanently removed.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setPendingId(row.id);
    try {
      const res = await apiFetch(`/api/certificates/${row.id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to delete certificate");
      }
      toast.success("Certificate deleted.");
      await load();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete certificate");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Certificates</h1>
      <form
        onSubmit={(e) => void add(e)}
        style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.65rem", maxWidth: "28rem" }}
      >
        <h2 style={{ fontSize: "1.1rem" }}>Add certificate</h2>
        <CertificateFields form={addForm} onChange={setAddForm} idPrefix="add" />
        <Button type="submit" loading={adding}>
          Add
        </Button>
      </form>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "28rem" }}>
          <Skeleton height="4.5rem" />
          <Skeleton height="4.5rem" />
        </div>
      ) : loadError ? (
        <p role="alert" style={{ color: "var(--error)" }}>
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <EmptyState title="No certificates yet" description="Add a certification above to display it here." />
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((c) =>
            editingId === c.id ? (
              <li key={c.id}>
                <Card>
                  <form
                    onSubmit={(e) => void saveEdit(e)}
                    style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxWidth: "26rem" }}
                  >
                    <CertificateFields form={editForm} onChange={setEditForm} idPrefix={`edit-${c.id}`} />
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
              <li key={c.id}>
                <Card>
                  <strong>{c.name}</strong>
                  {c.description ? (
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0.35rem 0" }}>{c.description}</p>
                  ) : null}
                  <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem" }}>
                    <Button variant="secondary" type="button" onClick={() => startEdit(c)} disabled={pendingId !== null}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      type="button"
                      onClick={() => void remove(c)}
                      loading={pendingId === c.id}
                      disabled={pendingId !== null && pendingId !== c.id}
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
