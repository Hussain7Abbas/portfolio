import Image from "next/image";
import { notFound } from "next/navigation";
import EventCard from "@/templates/vscode/components/EventCard";
import styles from "@vscode/styles/AboutPage.module.css";
import { getPortfolioByUsername } from "@/lib/get-portfolio";

interface PageProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);
  if (!data || data.profile.activeTemplate !== templateSlug || templateSlug !== "vscode") {
    notFound();
  }
  const p = data.profile;
  const events = data.events as Array<{
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    url: string | null;
  }>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "flex-start",
      }}
    >
      {p.photoUrl ? (
        <Image
          src={p.photoUrl}
          alt={p.displayName}
          width={400}
          height={640}
          className="portfolio-photo"
          style={{
            objectFit: "cover",
            borderRadius: "0.5rem",
            maxWidth: "100%",
            height: "auto",
          }}
          unoptimized
        />
      ) : null}
      <div style={{ flex: "1 1 280px", minWidth: 0 }}>
        <h3 style={{ fontSize: "1.5rem", margin: "0.5rem 0 1rem" }}>About</h3>
        <p style={{ lineHeight: 1.7, color: "var(--text-color, #eee)" }}>
          {p.bio ?? "No bio yet."}
        </p>
        {events.length > 0 ? (
          <>
            <h3 style={{ fontSize: "1.5rem", margin: "1.5rem 0 1rem" }}>Events</h3>
            <div className={styles.container}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
