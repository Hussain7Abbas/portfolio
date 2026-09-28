# DevPort

Open-source developer portfolio platform (Turborepo monorepo).

## Apps

| Package | Port (dev) | Description |
|---------|------------|-------------|
| `@devport/website` | 3004 | Marketing / landing |
| `@devport/app` | 3000 | User portal |
| `@devport/portfolio` | 3002 | Public portfolio renderer |
| `@devport/dashboard` | 3003 | Admin dashboard |
| `@devport/backend` | 3001 | Elysia API + Better Auth |

## Packages

- `@devport/db` — Prisma + PostgreSQL schema
- `@devport/auth` — Better Auth server + React client helpers
- `@devport/ui` — Shared shadcn/Base UI components and `cn`
- `@devport/templates` — Portfolio template metadata and slugs
- `@devport/tsconfig` — Shared TypeScript configs
- `@devport/tailwind-config` — Shared Tailwind preset

## Prerequisites

- [Bun](https://bun.sh)
- Docker (for local PostgreSQL — optional until DB is wired)

## Setup

```bash
cp .env.example .env
# Set DATABASE_URL, BETTER_AUTH_SECRET (32+ chars), BETTER_AUTH_URL (browser origin, e.g. app on :3000)
# Optional: NEXT_PUBLIC_GITHUB_REPO_URL for the marketing site GitHub links

bun install
docker compose -f docker/docker-compose.yml up -d
bun run db:push
bun run dev
```

Project documentation starts at [`docs/intro.md`](./docs/intro.md); agent/contributor rules are in [`AGENTS.md`](./AGENTS.md). The original implementation plans are in [`plan/`](./plan/). See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for local development and PR expectations. Production Docker examples live under [`docker/`](./docker/README.md).

## Legacy

The previous single-app portfolio lives under [`legacy/original-portfolio/`](./legacy/README.md).

## License

See [LICENSE](./LICENSE).
