import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchWithSession, getServerSession } from "@/lib/session";
import { AppHeader } from "./app-header";

const nav = [
  { href: "/profile", label: "Profile" },
  { href: "/projects", label: "Projects" },
  { href: "/certificates", label: "Certificates" },
  { href: "/events", label: "Events" },
  { href: "/github", label: "GitHub" },
  { href: "/messages", label: "Messages" },
  { href: "/seo", label: "SEO" },
  { href: "/settings", label: "Settings" },
];

export default async function AppShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }
  const profileRes = await fetchWithSession("/api/profile");
  const profileData = profileRes.ok
    ? ((await profileRes.json()) as { profile: unknown | null })
    : { profile: null };
  if (!profileData.profile) {
    redirect("/onboarding");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "13rem",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          padding: "1rem 0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.95rem",
            marginBottom: "0.75rem",
            paddingLeft: "0.5rem",
          }}
        >
          DevPort
        </div>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "0.4rem 0.5rem",
              borderRadius: "6px",
              textDecoration: "none",
              color: "var(--fg)",
              fontSize: "0.9rem",
            }}
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <main style={{ flex: 1, padding: "1.5rem 2rem" }}>
        <AppHeader />
        {children}
      </main>
    </div>
  );
}
