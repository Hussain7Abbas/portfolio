import { notFound } from "next/navigation";
import RepoCard from "@/templates/vscode/components/RepoCard";
import styles from "@vscode/styles/GithubPage.module.css";
import { getPortfolioByUsername } from "@/lib/get-portfolio";
import { templateSupportsPage } from "@/templates/registry";

const defaultApi = "http://127.0.0.1:3001";

type PublicRepo = {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  language: string | null;
};

async function fetchPublicRepos(username: string): Promise<{ githubUsername: string | null; repos: PublicRepo[] }> {
  const apiUrl = process.env.API_URL ?? defaultApi;
  try {
    const res = await fetch(`${apiUrl}/api/portfolio/${encodeURIComponent(username)}/github`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { githubUsername: null, repos: [] };
    return (await res.json()) as { githubUsername: string | null; repos: PublicRepo[] };
  } catch {
    return { githubUsername: null, repos: [] };
  }
}

interface PageProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

export default async function GithubPage({ params }: PageProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);
  if (!data || data.profile.activeTemplate !== templateSlug || !templateSupportsPage(templateSlug, "github")) {
    notFound();
  }

  const { githubUsername, repos } = await fetchPublicRepos(username);

  if (!githubUsername || repos.length === 0) {
    return (
      <p style={{ color: "var(--text-color, #eee)" }}>
        No GitHub repositories selected yet.
      </p>
    );
  }

  return (
    <>
      <h3 className={styles.title} style={{ fontSize: "1.5rem" }}>
        GitHub — {githubUsername}
      </h3>
      <div className={styles.container}>
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>
    </>
  );
}
