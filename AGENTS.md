# DevPort — agent instructions

DevPort is an open-source, self-hosted developer portfolio platform. Users sign up, fill in portfolio data (profile, projects, certificates, events, GitHub repos, SEO), pick a template, and their portfolio is served at `/<username>/<templateSlug>` by the portfolio app. It is a Turborepo + Bun workspaces monorepo.

Project documentation starts at [docs/intro.md](docs/intro.md).

## Directory map

| Path | Responsibility | Scoped rules |
|------|----------------|--------------|
| `apps/backend` | Elysia (Bun) REST API on :3001; mounts Better Auth | [apps/backend/AGENTS.md](apps/backend/AGENTS.md) |
| `apps/app` | User portal (Next.js 15) on :3000 — onboarding + CRUD | [apps/app/AGENTS.md](apps/app/AGENTS.md) |
| `apps/portfolio` | Public portfolio renderer (Next.js 15) on :3002 — templates | [apps/portfolio/AGENTS.md](apps/portfolio/AGENTS.md) |
| `apps/dashboard` | Admin panel (Next.js 15) on :3003 — same auth/fetch pattern as `apps/app`, admin role required | — |
| `apps/website` | Marketing site (Next.js 15, `output: "export"`, framer-motion) on :3004; no auth, no API | — |
| `packages/db` | `@devport/db` — Prisma 7 schema + client singleton | [packages/db/AGENTS.md](packages/db/AGENTS.md) |
| `packages/auth` | `@devport/auth` — Better Auth server (`/server`) and React client (`/client`) | — |
| `packages/ui` | `@devport/ui` — shared shadcn/Base UI components + `cn` | [packages/ui/AGENTS.md](packages/ui/AGENTS.md) |
| `packages/templates` | `@devport/templates` — template metadata/slugs shared by backend, app, portfolio | — |
| `packages/tsconfig` | Shared `base.json`, `nextjs.json`, `node.json` | — |
| `packages/tailwind-config` | Shared Tailwind 3 preset (CSS-variable colors) | — |
| `docker/` | Local Postgres compose, production Dockerfiles, nginx example | see [docker/README.md](docker/README.md) |
| `plan/` | Historical step-by-step implementation plans and status (may lag the code) | — |
| `legacy/original-portfolio` | Pre-DevPort Next.js 12 portfolio; reference only | do not edit |

## Shared rules

- Use **bun** for everything (install, scripts, workspace filters). Never npm/pnpm/yarn.
- TypeScript is strict (`strict`, `noUncheckedIndexedAccess`). No `any`; no `eslint-disable`/`@ts-ignore` comments. Narrow `unknown` with explicit types.
- Run `bun run typecheck` after every change; it must pass. There is no lint, formatter, or test suite configured — do not claim to have run them.
- Cross-workspace imports go through package names (`@devport/db`, `@devport/auth/server`, …) declared as `workspace:*` dependencies, never relative paths across `apps/`/`packages/`. Exception: `@devport/ui` is consumed via tsconfig path aliases (see [packages/ui/AGENTS.md](packages/ui/AGENTS.md)).
- The browser never talks to the backend directly from `apps/app` / `apps/dashboard`: their Next config rewrites `/api/*` to `BACKEND_URL`, so auth cookies stay on the app origin. Keep it that way.
- Env vars are per workspace: each app (and `packages/db` for the Prisma CLI) has its own `.env.example` → `.env`; there is no root `.env`. Add a new var only to the `.env.example` of the workspace that reads it, with a comment. Code in `packages/auth/src/server.ts` runs inside the backend, so its vars go in `apps/backend/.env.example`. If a non-`NEXT_PUBLIC_*` var affects a build output, list it under that workspace's `turbo.json` `build.env`. `NEXT_PUBLIC_*` values are inlined at build time.
- Keep features free/open-source (no paywall logic). Templates are added by PR, not at runtime.
- Do not edit `legacy/`, generated output (`packages/db/generated/`, `.next/`, `dist/`, `out/`), or `bun.lock` by hand.

## Code style

- TypeScript/TSX, 2-space indent, double quotes, semicolons, trailing commas (match surrounding file; shadcn files in `packages/ui` omit semicolons — leave them as generated).
- Filenames kebab-case (`projects-client.tsx`, `rate-limit.ts`); components PascalCase, functions camelCase, constants `UPPER_SNAKE_CASE`. Ported VS Code template files keep their original PascalCase `.jsx` names.
- Prefer `type` aliases for object shapes; `import type` for type-only imports.
- Errors from the API are JSON `{ error: string }` with a proper status code.
- Short JSDoc (`/** … */`) only on non-obvious helpers; avoid narrating comments.

## Commands (repo root)

```bash
bun install
docker compose -f docker/docker-compose.yml up -d   # local Postgres 16
for f in packages/db apps/backend apps/app apps/dashboard apps/portfolio apps/website; do cp "$f/.env.example" "$f/.env"; done
# then fill apps/backend/.env (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, …)
bun run db:push      # sync schema + prisma generate
bun run dev          # all apps via turbo
bun run typecheck    # all workspaces
bun run build        # production builds
bun run db:studio
```

Run one workspace with `bun run --filter @devport/<name> <script>`. `dev`, `build`, and `typecheck` depend on `db:generate`, so the Prisma client is regenerated automatically.

## Keeping instructions and docs current

As part of every task, keep project instructions and documentation synchronized with user-requested changes and relevant changes already made by the user. Before finishing, review the affected `AGENTS.md` files and `docs/` pages and update any rules, directory descriptions, code conventions, commands, architecture, interfaces, configuration, or behavior that changed. Add, move, or remove scoped instructions and documentation when project scopes change, and repair their indexes and links. Update affected documentation in the same task as the code changes; do not leave known stale guidance. Preserve unrelated user edits and document the current intended state without reverting code to match old documentation. If a change has no documentation or instruction impact, leave those files unchanged. Keep every `CLAUDE.md` as only `@AGENTS.md`, with the actual rules in its sibling `AGENTS.md`.
