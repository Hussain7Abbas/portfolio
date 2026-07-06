"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <nav className="mb-6 flex flex-wrap gap-4">
        <Link href="/" className="text-primary hover:underline">
          Overview
        </Link>
        <Link href="/users" className="font-semibold text-foreground">
          Users
        </Link>
      </nav>
      <h1 className="mt-0 text-2xl font-semibold">Users</h1>
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="space-y-2">
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
          onClick={() => {
            setAppliedSearch(searchInput.trim());
            setPage(1);
          }}
        >
          Search
        </Button>
      </div>
      {loading ? <p className="text-muted-foreground">Loading…</p> : null}
      {error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : null}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-2">Email</th>
            <th className="p-2">Name</th>
            <th className="p-2">Username</th>
            <th className="p-2">Role</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.profile?.username ?? "—"}</td>
              <td className="p-2">
                <Select
                  value={u.role}
                  onValueChange={(value) => {
                    if (value) void setRole(u.id, value);
                  }}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">user</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="p-2">
                <Button variant="destructive" type="button" onClick={() => void removeUser(u.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 ? (
        <div className="mt-4 flex items-center gap-2">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-sm">
            Page {page} / {pages}
          </span>
          <Button
            type="button"
            variant="outline"
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
