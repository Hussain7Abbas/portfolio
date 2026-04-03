import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com";

export const metadata: Metadata = {
  title: "DevPort — Developer portfolios, open source",
  description:
    "Create an account, add projects and certificates, pick a template, and share your portfolio.",
};

function Nav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid var(--border)",
        background: "rgba(7, 8, 12, 0.85)",
        backdropFilter: "blur(10px)",
      }}
    >
      <nav
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "0.85rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--fg)" }}>
          DevPort
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <Link href="#features" style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            Features
          </Link>
          <Link href="#how" style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            How it works
          </Link>
          <a href={githubUrl} style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            GitHub
          </a>
          <a
            href={`${appUrl}/sign-up`}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "6px",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: "4rem",
        padding: "2.5rem 1.25rem",
        color: "var(--muted)",
        fontSize: "0.9rem",
      }}
    >
      <div
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
          <a href={githubUrl}>GitHub</a>
          <Link href="#features">Features</Link>
          <a href={`${appUrl}/sign-in`}>Sign in</a>
        </div>
        <p style={{ margin: 0 }}>
          Built with Next.js, Elysia, PostgreSQL, and Better Auth.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
