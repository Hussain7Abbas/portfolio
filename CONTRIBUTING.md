# Contributing to DevPort

## Setup

- Install [Bun](https://bun.sh).
- Copy `.env.example` to `.env` and set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` (browser origin for the user app when using Next `/api` rewrites).
- `bun install`
- Start Postgres (e.g. `docker compose -f docker/docker-compose.yml up -d`).
- `bun run db:push`
- `bun run dev`

## Commands

| Command | Purpose |
|--------|---------|
| `bun run typecheck` | TypeScript across workspaces |
| `bun run build` | Production builds |
| `bun run db:studio` | Prisma Studio |

## Pull requests

- Keep changes focused; match existing patterns in the touched app or package.
- Run `bun run typecheck` before submitting.
- For UI, prefer shared primitives in `@devport/ui` and existing CSS variables in apps.

## Templates

The VS Code portfolio template lives under `apps/portfolio/src/templates/vscode` (ported from `legacy/original-portfolio`). When changing layout or styles, verify `/{username}/vscode` routes in the portfolio app.
