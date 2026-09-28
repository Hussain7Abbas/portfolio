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
cp .env.example .env
bun run db:push
bun run dev
```

`db:push` syncs the Prisma schema to the database and regenerates the client. `dev` starts every app through Turborepo. To run one app, use `bun run --filter @devport/<name> dev`.

## Environment variables

All apps read the root `.env` (see [`.env.example`](../.env.example)).

| Variable | Used by | Notes |
|----------|---------|-------|
| `DATABASE_URL` | db, backend | Required at runtime. |
| `BETTER_AUTH_SECRET` | auth | 32+ characters. |
| `BETTER_AUTH_URL` | auth | The browser origin for auth, i.e. the user app (`http://localhost:3000`), not the backend port. |
| `GOOGLE_*`, `GITHUB_CLIENT_*` | auth | Optional OAuth providers. |
| `AWS_*` | backend | Optional S3 uploads. |
| `GITHUB_API_KEY` | backend | Optional; raises GitHub API rate limits. |
| `BACKEND_URL` | app, dashboard | Target of the `/api/*` rewrite (default `http://127.0.0.1:3001`). |
| `API_URL` | portfolio | Server-side API base (default `http://127.0.0.1:3001`). |
| `NEXT_PUBLIC_API_URL` | auth client, portfolio contact form | Browser-facing API URL. |
| `NEXT_PUBLIC_{APP,DASHBOARD,PORTFOLIO,WEBSITE}_URL` | all | Origins used for CORS, trusted origins, links, and canonical URLs. |
| `NEXT_PUBLIC_GITHUB_REPO_URL` | website | Optional repo link. |

`.env.local.example` is left over from the legacy portfolio and is not used by the monorepo.

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
