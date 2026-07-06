"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, EmptyState, Input, Label, Skeleton, useToast } from "@devport/ui";
import { apiJson, ApiError } from "@/lib/client-fetch";

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
  const toast = useToast();
  const [githubUsername, setGithubUsername] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reposLoaded, setReposLoaded] = useState(false);

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
        /* no config saved yet */
      } finally {
        setLoadingConfig(false);
      }
    })();
  }, []);

  async function fetchRepos() {
    const u = githubUsername.trim();
    if (!u) return;
    setLoadingRepos(true);
    setRepoError(null);
    try {
      const data = await apiJson<{ repos: Repo[] }>(`/api/github/repos/${encodeURIComponent(u)}`);
      setRepos(data.repos);
      setReposLoaded(true);
    } catch (e) {
      setRepoError(e instanceof ApiError ? e.message : "Failed to load repositories");
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
    if (saving) return;
    setSaving(true);
    try {
      await apiJson("/api/github/config", {
        method: "PUT",
        body: JSON.stringify({
          githubUsername: githubUsername.trim(),
          selectedRepos: selected,
        }),
      });
      toast.success("GitHub configuration saved.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "40rem" }}>
      <h1 style={{ marginTop: 0 }}>GitHub</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Set your GitHub username, load public repositories, and choose which appear on your portfolio.
      </p>
      {loadingConfig ? (
        <Skeleton height="2.25rem" width="20rem" style={{ marginTop: "1rem" }} />
      ) : (
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => void fetchRepos()}
                loading={loadingRepos}
                disabled={!githubUsername.trim()}
              >
                Load repos
              </Button>
            </div>
          </div>
          {repoError ? (
            <p role="alert" style={{ color: "var(--error)" }}>
              {repoError}
            </p>
          ) : null}
          {reposLoaded && repos.length === 0 && !repoError ? (
            <EmptyState title="No public repositories found" description="Check the username and try again." />
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
          <Button type="button" onClick={() => void save()} loading={saving}>
            Save configuration
          </Button>
        </div>
      )}
    </div>
  );
}
