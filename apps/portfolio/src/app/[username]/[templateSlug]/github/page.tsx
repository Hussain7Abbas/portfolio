import { notFound } from "next/navigation";
import RepoCard from "@/templates/vscode/components/RepoCard";
import styles from "@vscode/styles/GithubPage.module.css";
import { getPortfolioByUsername } from "@/lib/get-portfolio";

interface PageProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

export default async function GithubPage({ params }: PageProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);
  if (!data || data.profile.activeTemplate !== templateSlug || templateSlug !== "vscode") {
    notFound();
  }
  const gh = data.githubConfig as {
    githubUsername: string;
    selectedRepos: string[];
  } | null;

  if (!gh || gh.selectedRepos.length === 0) {
    return (
      <p style={{ color: "var(--text-color, #eee)" }}>
        No GitHub repositories selected yet.
      </p>
    );
  }

  const user = gh.githubUsername;

  return (
    <>
      <h3 className={styles.title} style={{ fontSize: "1.5rem" }}>
        GitHub — {user}
      </h3>
      <div className={styles.container}>
        {gh.selectedRepos.map((name) => (
          <RepoCard
            key={name}
            repo={{
              name,
              description: null,
              htmlUrl: `https://github.com/${user}/${name}`,
              stars: 0,
            }}
          />
        ))}
      </div>
    </>
  );
}
