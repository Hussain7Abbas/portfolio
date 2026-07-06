"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/loading-button";
import { EmptyState } from "@/components/empty-state";
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
    <div className="max-w-2xl">
      <h1 className="mt-0">GitHub</h1>
      <p className="text-sm text-muted-foreground">
        Set your GitHub username, load public repositories, and choose which appear on your portfolio.
      </p>
      {loadingConfig ? (
        <Skeleton className="mt-4 h-9 w-80" />
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <Label htmlFor="ghu">GitHub username</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="ghu"
                value={githubUsername}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubUsername(e.target.value)}
                placeholder="octocat"
              />
              <LoadingButton
                type="button"
                variant="outline"
                onClick={() => void fetchRepos()}
                loading={loadingRepos}
                disabled={!githubUsername.trim()}
              >
                Load repos
              </LoadingButton>
            </div>
          </div>
          {repoError ? (
            <p role="alert" className="text-destructive">
              {repoError}
            </p>
          ) : null}
          {reposLoaded && repos.length === 0 && !repoError ? (
            <EmptyState title="No public repositories found" description="Check the username and try again." />
          ) : null}
          {repos.length > 0 ? (
            <ul className="m-0 max-h-[22rem] list-none overflow-auto p-0">
              {repos.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start gap-2 border-b border-border py-2"
                >
                  <Checkbox
                    id={`repo-${r.id}`}
                    checked={selected.includes(r.name)}
                    onCheckedChange={() => toggle(r.name)}
                  />
                  <label htmlFor={`repo-${r.id}`} className="flex-1 cursor-pointer">
                    <strong>{r.name}</strong>{" "}
                    <span className="text-sm text-muted-foreground">★ {r.stars}</span>
                    {r.description ? (
                      <div className="text-sm text-muted-foreground">{r.description}</div>
                    ) : null}
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
          <LoadingButton type="button" onClick={() => void save()} loading={saving}>
            Save configuration
          </LoadingButton>
        </div>
      )}
    </div>
  );
}
