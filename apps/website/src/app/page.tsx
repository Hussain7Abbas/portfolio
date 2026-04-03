import Link from "next/link";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com";

export default function Page() {
  return (
    <main>
      <section
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "3.5rem 1.25rem 4rem",
        }}
      >
        <p
          style={{
            fontSize: "0.8rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent)",
            margin: "0 0 0.75rem",
          }}
        >
          Open source
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            lineHeight: 1.15,
            margin: "0 0 1rem",
            maxWidth: "20ch",
          }}
        >
          Build your developer portfolio in minutes
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "1.1rem",
            maxWidth: "42ch",
            margin: "0 0 1.75rem",
          }}
        >
          Free portfolio platform: create an account, add projects and certificates, pick a
          template, and share a public URL.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <a
            href={`${appUrl}/sign-up`}
            style={{
              display: "inline-block",
              padding: "0.65rem 1.15rem",
              borderRadius: "8px",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Get started
          </a>
          <a
            href={githubUrl}
            style={{
              display: "inline-block",
              padding: "0.65rem 1.15rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              fontWeight: 600,
            }}
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section
        id="features"
        style={{
          background: "var(--bg-elevated)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "3rem 1.25rem",
        }}
      >
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 1.5rem", fontSize: "1.5rem" }}>Features</h2>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
            }}
          >
            {[
              "Templates (VS Code style today; more community templates welcome)",
              "Projects, certificates, and events with ordering",
              "GitHub integration for repos",
              "SEO fields and public portfolio rendering",
              "Contact messages delivered to your inbox",
              "Free and open source",
            ].map((text) => (
              <li
                key={text}
                style={{
                  padding: "1rem 1.1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: "0.95rem",
                }}
              >
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how" style={{ maxWidth: "56rem", margin: "0 auto", padding: "3rem 1.25rem" }}>
        <h2 style={{ margin: "0 0 1.5rem", fontSize: "1.5rem" }}>How it works</h2>
        <ol style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)" }}>
          <li style={{ marginBottom: "0.75rem" }}>Create an account and verify your email.</li>
          <li style={{ marginBottom: "0.75rem" }}>Complete your profile and add content.</li>
          <li style={{ marginBottom: "0.75rem" }}>Choose a template (e.g. VS Code).</li>
          <li>Share your public URL with employers and friends.</li>
        </ol>
      </section>

      <section
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "0 1.25rem 3rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem 1.25rem",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "linear-gradient(145deg, var(--card) 0%, var(--bg-elevated) 100%)",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem" }}>Templates</h2>
          <p style={{ margin: "0 0 1rem", color: "var(--muted)", fontSize: "0.95rem" }}>
            The VS Code–inspired template ships first. More templates and contributions are
            welcome.
          </p>
          <Link href={githubUrl} style={{ fontWeight: 600 }}>
            Contribute a template →
          </Link>
        </div>
      </section>

      <section
        style={{
          textAlign: "center",
          padding: "2.5rem 1.25rem 3rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.35rem" }}>DevPort is free and open source</h2>
        <p style={{ color: "var(--muted)", margin: "0 0 1.25rem" }}>
          Star the repo and help grow the template ecosystem.
        </p>
        <a
          href={githubUrl}
          style={{
            display: "inline-block",
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            fontWeight: 600,
          }}
        >
          GitHub
        </a>
      </section>
    </main>
  );
}
