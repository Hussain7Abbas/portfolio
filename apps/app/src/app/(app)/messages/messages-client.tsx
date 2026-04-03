"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@devport/ui";
import { apiFetch, apiJson } from "@/lib/client-fetch";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function MessagesClient() {
  const router = useRouter();
  const [items, setItems] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(p: number) {
    setLoading(true);
    try {
      const data = await apiJson<{ messages: Message[]; total: number; page: number }>(
        `/api/messages?page=${p}&limit=20`,
      );
      setItems(data.messages);
      setTotal(data.total);
      setPage(data.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
  }, []);

  async function markRead(id: string) {
    await apiJson(`/api/messages/${id}/read`, { method: "PUT" });
    await load(page);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete message?")) return;
    const res = await apiFetch(`/api/messages/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await load(page);
    router.refresh();
  }

  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Messages</h1>
      {loading ? <p style={{ color: "var(--muted)" }}>Loading…</p> : null}
      {error ? (
        <p role="alert" style={{ color: "var(--error)" }}>
          {error}
        </p>
      ) : null}
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Total: {total}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((m) => (
          <li key={m.id}>
            <Card style={{ opacity: m.read ? 0.85 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                <strong>{m.subject}</strong>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: "0.35rem 0", fontSize: "0.9rem" }}>
                From {m.name} &lt;{m.email}&gt;
              </p>
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{m.message}</p>
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.35rem" }}>
                {!m.read ? (
                  <Button type="button" variant="secondary" onClick={() => void markRead(m.id)}>
                    Mark read
                  </Button>
                ) : null}
                <Button variant="danger" type="button" onClick={() => void remove(m.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => void load(page - 1)}>
            Prev
          </Button>
          <span style={{ fontSize: "0.9rem" }}>
            Page {page} / {pages}
          </span>
          <Button
            type="button"
            variant="secondary"
            disabled={page >= pages}
            onClick={() => void load(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
