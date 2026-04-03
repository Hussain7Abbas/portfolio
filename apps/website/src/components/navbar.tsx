import Link from "next/link";
import { cn } from "@devport/ui";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="text-lg font-bold text-foreground">
          DevPort
        </Link>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <Link href="#features" className={cn("text-muted-foreground hover:text-foreground transition-colors")}>
            Features
          </Link>
          <Link href="#how" className={cn("text-muted-foreground hover:text-foreground transition-colors")}>
            How it works
          </Link>
          <a
            href={githubUrl}
            className="text-muted-foreground transition-colors hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href={`${appUrl}/sign-up`}
            className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
}
