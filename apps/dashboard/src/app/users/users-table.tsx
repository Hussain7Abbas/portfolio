"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@devport/ui";
import { apiJson } from "@/lib/client-fetch";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profile: { username: string } | null;
};

export function UsersTable() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ page: String(page), limit: "20" });
      if (appliedSearch) q.set("search", appliedSearch);
      const data = await apiJson<{ users: UserRow[]; total: number }>(
        `/api/admin/users?${q.toString()}`,
      );
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setRole(id: string, role: string) {
    try {
      await apiJson(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await load();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Delete this user permanently?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      await load();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <nav style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/">Overview</Link>
        <Link href="/users" style={{ fontWeight: 600 }}>
          Users
        </Link>
      </nav>
      <h1 style={{ marginTop: 0 }}>Users</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div>
          <Label htmlFor="s">Search</Label>
          <Input
            id="s"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="email, name, username"
          />
        </div>
        <Button
          type="button"
          style={{ alignSelf: "flex-end" }}
          onClick={() => {
            setAppliedSearch(searchInput.trim());
            setPage(1);
          }}
        >
          Search
        </Button>
      </div>
      {loading ? <p style={{ color: "var(--muted)" }}>Loading…</p> : null}
      {error ? (
        <p role="alert" style={{ color: "var(--error)" }}>
          {error}
        </p>
      ) : null}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
            <th style={{ padding: "0.5rem" }}>Email</th>
            <th style={{ padding: "0.5rem" }}>Name</th>
            <th style={{ padding: "0.5rem" }}>Username</th>
            <th style={{ padding: "0.5rem" }}>Role</th>
            <th style={{ padding: "0.5rem" }} />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "0.5rem" }}>{u.email}</td>
              <td style={{ padding: "0.5rem" }}>{u.name}</td>
              <td style={{ padding: "0.5rem" }}>{u.profile?.username ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>
                <select
                  value={u.role}
                  onChange={(e) => void setRole(u.id, e.target.value)}
                  style={{
                    background: "var(--input-bg)",
                    color: "var(--fg)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "0.25rem",
                  }}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td style={{ padding: "0.5rem" }}>
                <Button variant="danger" type="button" onClick={() => void removeUser(u.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 ? (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span>
            Page {page} / {pages}
          </span>
          <Button
            type="button"
            variant="secondary"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
