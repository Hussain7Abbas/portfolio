import { notFound } from "next/navigation";
import ProjectCard from "@/templates/vscode/components/ProjectCard";
import styles from "@vscode/styles/ProjectsPage.module.css";
import { getPortfolioByUsername } from "@/lib/get-portfolio";

interface PageProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

export default async function ProjectsPage({ params }: PageProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);
  if (!data || data.profile.activeTemplate !== templateSlug || templateSlug !== "vscode") {
    notFound();
  }
  const projects = data.projects as Array<{
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    tags: string[];
    demoUrl: string | null;
    sourceUrl: string | null;
  }>;

  return (
    <>
      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Projects</h3>
      <div className={styles.container}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}
