# Implementation status

Last updated: 2026-04-03

## Completed

- **Monorepo** — Turborepo, Bun workspaces, shared packages (`tsconfig`, `tailwind-config`, `db`, `auth`, `ui`).
- **Backend** — Elysia routes for profile, projects (CRUD + reorder), certificates, events, GitHub config + repo list, messages, SEO, S3 presign/delete, public portfolio + contact + sitemap, admin overview/users (list, GET by id, **PATCH role**, DELETE).
- **User app (`:3000`)** — API rewrites, session middleware, auth screens, **onboarding wizard**, **profile** (incl. uploads), **projects / certificates / events** CRUD, **GitHub** picker, **messages** inbox, **SEO** form, **settings** (template), `FileUploadField` for S3.
- **Dashboard (`:3003`)** — Admin sign-in, overview, **`/users`** (search, pagination, role change, delete).
- **Portfolio (`:3002`)** — VS Code template (legacy styles + components), **routes**: home, about, projects, certificates, github, contact (public API), settings (theme preview); SEO metadata + JSON-LD; sitemap + robots; `getPortfolioByUsername` cached.
- **Website (`:3004`)** — Marketing landing (inline CSS).
- **`@devport/ui`** — `Button`, `Input`, `Textarea`, `Label`, `Card`, `cn`, `ui` style tokens.
- **Docker** — Example `docker/Dockerfile.backend`, `docker/docker-compose.prod.yml`, `docker/nginx.example.conf`.
- **Docs** — Root `CONTRIBUTING.md`.
- **Quality** — `bun run typecheck` and `bun run build` pass.

## Optional follow-ups

- **Website** — Tailwind + `output: "export"` + framer-motion (see `plan/15-website.md`).
- **Next Docker** — Per-app Dockerfiles with `output: "standalone"` (see `plan/16-docker-prod.md`).
- **Portfolio** — GitHub calendar / richer repo cards if you add a public API for repo metadata.
- **E2E tests** — Not in scope yet.

## Commands

```bash
bun install
docker compose -f docker/docker-compose.yml up -d
cp .env.example .env
bun run db:push
bun run dev
```

See [README.md](../README.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).
