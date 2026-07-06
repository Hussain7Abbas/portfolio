import Link from "next/link";
import { notFound } from "next/navigation";
import Illustration from "@/templates/vscode/components/Illustration";
import styles from "@vscode/styles/HomePage.module.css";
import { getPortfolioByUsername } from "@/lib/get-portfolio";
import { templateSupportsPage } from "@/templates/registry";

interface PageProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

export default async function PortfolioPage({ params }: PageProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);

  if (!data) {
    notFound();
  }

  if (data.profile.activeTemplate !== templateSlug) {
    notFound();
  }

  if (!templateSupportsPage(templateSlug, "home")) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "40rem" }}>
        <h1 style={{ marginTop: 0 }}>{data.profile.displayName}</h1>
        {data.profile.title ? (
          <p style={{ color: "#666", marginTop: "-0.5rem" }}>{data.profile.title}</p>
        ) : null}
        {data.profile.bio ? (
          <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{data.profile.bio}</p>
        ) : (
          <p style={{ color: "#888" }}>Template &quot;{templateSlug}&quot; has no dedicated renderer yet.</p>
        )}
      </main>
    );
  }

  const p = data.profile;
  const resume = p.resumeUrl;

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <h1>I BUILD</h1>
        <h1>WEBSITES</h1>
      </div>
      <div className={styles.foreground}>
        <div className={styles.content}>
          <h1 className={styles.name}>{p.displayName}</h1>
          <h6 className={styles.bio}>{p.title ?? "Developer"}</h6>
          {resume ? (
            <a href={resume} rel="noopener noreferrer" target="_blank">
              <button type="button" className={styles.button}>
                Resume
              </button>
            </a>
          ) : null}{" "}
          <Link href={`/${p.username}/${templateSlug}/contact`}>
            <button type="button" className={styles.outlined}>
              Contact Me
            </button>
          </Link>
        </div>
        <Illustration className={styles.illustration} />
      </div>
    </div>
  );
}
