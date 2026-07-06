"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EmptyState, Skeleton, useConfirm, useToast } from "@devport/ui";
import { apiFetch, apiJson, ApiError } from "@/lib/client-fetch";

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
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [items, setItems] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function load(p: number) {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiJson<{ messages: Message[]; total: number; page: number }>(
        `/api/messages?page=${p}&limit=20`,
      );
      setItems(data.messages);
      setTotal(data.total);
      setPage(data.page);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
  }, []);

  async function markRead(id: string) {
    setPendingId(id);
    try {
      await apiJson(`/api/messages/${id}/read`, { method: "PUT" });
      await load(page);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to mark message as read");
    } finally {
      setPendingId(null);
    }
  }

  async function remove(m: Message) {
    const ok = await confirm({
      title: "Delete message?",
      description: `The message from ${m.name} will be permanently removed.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setPendingId(m.id);
    try {
      const res = await apiFetch(`/api/messages/${m.id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to delete message");
      }
      toast.success("Message deleted.");
      await load(page);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete message");
    } finally {
      setPendingId(null);
    }
  }

  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Messages</h1>
      {!loading && !loadError ? (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Total: {total}</p>
      ) : null}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Skeleton height="6rem" />
          <Skeleton height="6rem" />
        </div>
      ) : loadError ? (
        <p role="alert" style={{ color: "var(--error)" }}>
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Messages sent through your portfolio's contact form will show up here."
        />
      ) : (
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
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void markRead(m.id)}
                      loading={pendingId === m.id}
                      disabled={pendingId !== null && pendingId !== m.id}
                    >
                      Mark read
                    </Button>
                  ) : null}
                  <Button
                    variant="danger"
                    type="button"
                    onClick={() => void remove(m)}
                    loading={pendingId === m.id}
                    disabled={pendingId !== null && pendingId !== m.id}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {!loading && !loadError && pages > 1 ? (
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
      {dialog}
    </div>
  );
}
