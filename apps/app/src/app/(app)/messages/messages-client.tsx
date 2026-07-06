"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingButton } from "@/components/loading-button";
import { EmptyState } from "@/components/empty-state";
import { useConfirm } from "@/components/use-confirm";
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
      <h1 className="mt-0">Messages</h1>
      {!loading && !loadError ? (
        <p className="text-sm text-muted-foreground">Total: {total}</p>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : loadError ? (
        <p role="alert" className="text-destructive">
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Messages sent through your portfolio's contact form will show up here."
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((m) => (
            <li key={m.id}>
              <Card className={m.read ? "opacity-85" : undefined}>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>{m.subject}</strong>
                    <span className="text-sm text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="my-1.5 text-sm">
                    From {m.name} &lt;{m.email}&gt;
                  </p>
                  <p className="m-0 whitespace-pre-wrap">{m.message}</p>
                  <div className="mt-2 flex gap-1.5">
                    {!m.read ? (
                      <LoadingButton
                        type="button"
                        variant="outline"
                        onClick={() => void markRead(m.id)}
                        loading={pendingId === m.id}
                        disabled={pendingId !== null && pendingId !== m.id}
                      >
                        Mark read
                      </LoadingButton>
                    ) : null}
                    <LoadingButton
                      variant="destructive"
                      type="button"
                      onClick={() => void remove(m)}
                      loading={pendingId === m.id}
                      disabled={pendingId !== null && pendingId !== m.id}
                    >
                      Delete
                    </LoadingButton>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {!loading && !loadError && pages > 1 ? (
        <div className="mt-4 flex items-center gap-2">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => void load(page - 1)}>
            Prev
          </Button>
          <span className="text-sm">
            Page {page} / {pages}
          </span>
          <Button
            type="button"
            variant="outline"
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
