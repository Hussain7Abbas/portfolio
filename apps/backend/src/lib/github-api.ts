import { getCached, setCached } from "./cache";

export type GithubRepo = {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  language: string | null;
};

const REPO_CACHE_TTL_MS = 12 * 60 * 1000;

export class GithubApiError extends Error {
  status: number;
  constructor(status: number) {
    super("GitHub API request failed");
    this.status = status;
  }
}

/** Fetches (and caches) a GitHub user's public, non-fork repositories. */
export async function fetchPublicRepos(githubUsername: string): Promise<GithubRepo[]> {
  const cacheKey = `github-repos:${githubUsername.toLowerCase()}`;
  const cached = getCached<GithubRepo[]>(cacheKey);
  if (cached) return cached;

  const token = process.env.GITHUB_API_KEY;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevPort",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?per_page=100&sort=updated`,
    { headers },
  );
  if (!res.ok) {
    throw new GithubApiError(res.status);
  }
  const repos = (await res.json()) as Array<{
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    fork: boolean;
    private: boolean;
  }>;
  const mapped = repos
    .filter((r) => !r.fork && !r.private)
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      htmlUrl: r.html_url,
      stars: r.stargazers_count,
      language: r.language,
    }))
    .sort((a, b) => b.stars - a.stars);

  setCached(cacheKey, mapped, REPO_CACHE_TTL_MS);
  return mapped;
}
