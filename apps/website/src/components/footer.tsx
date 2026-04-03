import Link from "next/link";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border px-5 py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="flex flex-wrap gap-5">
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <Link href="#features">Features</Link>
          <a href={`${appUrl}/sign-in`}>Sign in</a>
        </div>
        <p className="m-0">
          Built with Next.js, Elysia, PostgreSQL, and Better Auth.
        </p>
      </div>
    </footer>
  );
}
