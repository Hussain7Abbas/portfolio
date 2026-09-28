# Development

[← Docs index](intro.md)

Rules for contributors and agents are in [AGENTS.md](../AGENTS.md); this page explains the workflow.

## Prerequisites

- [Bun](https://bun.sh) (the repo pins `bun@1.2.9` in `packageManager`).
- Docker, for local PostgreSQL 16.

## First run

```bash
bun install
docker compose -f docker/docker-compose.yml up -d
for f in packages/db apps/backend apps/app apps/dashboard apps/portfolio apps/website; do cp "$f/.env.example" "$f/.env"; done
bun run db:push
bun run dev
```

`db:push` syncs the Prisma schema to the database and regenerates the client. `dev` starts every app through Turborepo. To run one app, use `bun run --filter @devport/<name> dev`.

## Environment variables

Each workspace keeps its own `.env` next to its `package.json`, copied from the `.env.example` beside it. There is no root `.env`: Bun and Next.js load `.env` from the directory the app runs in, and Turborepo runs each app from its own directory. A variable lives only in the workspace that reads it.

| File | Variables | Notes |
|------|-----------|-------|
| `apps/backend/.env` | `DATABASE_URL` | Required at runtime. |
| | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Secret is 32+ characters. The URL is the browser origin for auth, i.e. the user app (`http://localhost:3000`), not the backend port. |
| | `APP_URL`, `DASHBOARD_URL`, `PORTFOLIO_URL`, `WEBSITE_URL` | Frontend origins for CORS and Better Auth trusted origins. |
| | `GOOGLE_*`, `GITHUB_CLIENT_*` | Optional OAuth providers. |
| | `RESEND_API_KEY`, `EMAIL_FROM` | Optional; sends verification codes through Resend. Without them, codes are printed in the backend console. |
| | `HETZNER_S3_ACCESS_KEY`, `HETZNER_S3_SECRET_KEY`, `HETZNER_S3_BUCKET`, `HETZNER_S3_LOCATION` | Optional Hetzner Object Storage for uploads. |
| | `GITHUB_API_KEY` | Optional GitHub token (no scopes). Raises the GitHub API limit for public repo lists from 60 to 5,000 requests/hour. |
| `packages/db/.env` | `DATABASE_URL` | Used only by the Prisma CLI (`db:push`, `db:migrate`, `db:studio`). |
| `apps/app/.env` | `BACKEND_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PORTFOLIO_URL` | `BACKEND_URL` is the `/api/*` rewrite target (default `http://127.0.0.1:3001`), baked in at build time. |
| `apps/dashboard/.env` | `BACKEND_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `NEXT_PUBLIC_APP_URL` | Same rewrite as the app. |
| `apps/portfolio/.env` | `API_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PORTFOLIO_URL` | `API_URL` is the server-side API base; `NEXT_PUBLIC_API_URL` is used by the contact form in the browser. |
| `apps/website/.env` | `NEXT_PUBLIC_WEBSITE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_GITHUB_REPO_URL` | Repo URL is optional. |

`build` tasks hash each workspace's `.env` files, and `apps/app` and `apps/dashboard` also declare `BACKEND_URL` in their own `turbo.json`. `.env.local.example` is left over from the legacy portfolio and is not used by the monorepo.

## Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | All apps in watch mode |
| `bun run typecheck` | `tsc --noEmit` in every workspace; run it before finishing any change |
| `bun run build` | Production builds (Next `standalone` / static export, backend bundle) |
| `bun run db:generate` / `db:push` / `db:migrate` / `db:studio` | Prisma workflows in `packages/db` |

There is no linter, formatter, or automated test suite yet, so `typecheck` is the only automated check. Check UI changes manually in the running app. For template changes, open `/<username>/vscode` on the portfolio app.

## Making an admin

Admin access depends on `User.role = "admin"`, and the role cannot be set through the API. Set it in the database, for example with `bun run db:studio`.

## Conventions

The code style, naming, and import rules are in [AGENTS.md](../AGENTS.md#code-style). Each app and package with its own conventions has a scoped `AGENTS.md`, linked from the root.
