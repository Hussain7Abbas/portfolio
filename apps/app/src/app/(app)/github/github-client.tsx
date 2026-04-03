"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@devport/ui";
import { apiJson } from "@/lib/client-fetch";

type Repo = {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  language: string | null;
};

export function GithubClient() {
  const router = useRouter();
  const [githubUsername, setGithubUsername] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiJson<{ config: { githubUsername: string; selectedRepos: string[] } | null }>(
          "/api/github/config",
        );
        if (data.config) {
          setGithubUsername(data.config.githubUsername);
          setSelected(data.config.selectedRepos);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function fetchRepos() {
    const u = githubUsername.trim();
    if (!u) return;
    setLoadingRepos(true);
    setError(null);
    try {
      const data = await apiJson<{ repos: Repo[] }>(`/api/github/repos/${encodeURIComponent(u)}`);
      setRepos(data.repos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load repos");
      setRepos([]);
    } finally {
      setLoadingRepos(false);
    }
  }

  function toggle(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  }

  async function save() {
    setError(null);
    setMsg(null);
    try {
      await apiJson("/api/github/config", {
        method: "PUT",
        body: JSON.stringify({
          githubUsername: githubUsername.trim(),
          selectedRepos: selected,
        }),
      });
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <div style={{ maxWidth: "40rem" }}>
      <h1 style={{ marginTop: 0 }}>GitHub</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Set your GitHub username, load public repositories, and choose which appear on your portfolio.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        <div>
          <Label htmlFor="ghu">GitHub username</Label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Input
              id="ghu"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="octocat"
            />
            <Button type="button" variant="secondary" onClick={() => void fetchRepos()} disabled={loadingRepos}>
              {loadingRepos ? "Loading…" : "Load repos"}
            </Button>
          </div>
        </div>
        {error ? (
          <p role="alert" style={{ color: "var(--error)" }}>
            {error}
          </p>
        ) : null}
        {repos.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "22rem", overflow: "auto" }}>
            {repos.map((r) => (
              <li
                key={r.id}
                style={{
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(r.name)}
                  onChange={() => toggle(r.name)}
                  id={`repo-${r.id}`}
                />
                <label htmlFor={`repo-${r.id}`} style={{ cursor: "pointer", flex: 1 }}>
                  <strong>{r.name}</strong>{" "}
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>★ {r.stars}</span>
                  {r.description ? (
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{r.description}</div>
                  ) : null}
                </label>
              </li>
            ))}
          </ul>
        ) : null}
        <Button type="button" onClick={() => void save()}>
          Save configuration
        </Button>
        {msg ? <p style={{ color: "var(--muted)" }}>{msg}</p> : null}
      </div>
    </div>
  );
}
