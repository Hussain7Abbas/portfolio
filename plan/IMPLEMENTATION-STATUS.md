# Implementation status

Last updated: 2026-04-03

## Completed

- **Monorepo** — Turborepo, Bun workspaces, shared packages (`tsconfig`, `tailwind-config`, `db`, `auth`, `ui`).
- **Backend** — Elysia routes (profile through admin), public portfolio + contact + sitemap.
- **User app** — Full portal with onboarding, CRUD, uploads, GitHub, messages, SEO, settings; **Next `standalone`** for Docker.
- **Dashboard** — Admin overview + users; **standalone**.
- **Portfolio** — VS Code template routes; **standalone**.
- **Website** — Tailwind + `@devport/tailwind-config`, **framer-motion** sections, **`output: "export"`** → static `out/`; `@devport/ui` (`cn`).
- **Docker** — [`docker/Dockerfile.backend`](../docker/Dockerfile.backend), [`docker/Dockerfile.next`](../docker/Dockerfile.next), [`docker/Dockerfile.website`](../docker/Dockerfile.website), [`docker/docker-compose.prod.yml`](../docker/docker-compose.prod.yml), [`docker/nginx/nginx.conf`](../docker/nginx/nginx.conf), [`docker/README.md`](../docker/README.md).
- **Docs** — [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- **Quality** — `bun run typecheck` and `bun run build` pass.

## Optional follow-ups

- **TLS** — Terminate HTTPS on nginx or a load balancer; mount certs (see `plan/16-docker-prod.md`).
- **CI** — Build and push images with pinned `NEXT_PUBLIC_*` / `BETTER_AUTH_*` for each environment.
- **Portfolio** — Public GitHub calendar / richer repo cards (extra API or server fetch).
- **E2E tests**.

## Commands

```bash
bun install
docker compose -f docker/docker-compose.yml up -d
cp .env.example .env
bun run db:push
bun run dev
```

Production Docker: see [`docker/README.md`](../docker/README.md).
