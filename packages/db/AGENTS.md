# packages/db — `@devport/db`

Prisma 7 schema and PostgreSQL client for the whole monorepo. Shared rules live in the [root AGENTS.md](../../AGENTS.md); the data model is described in [docs/packages.md](../../docs/packages.md#devportdb).

## Structure

- `prisma/schema.prisma` — the schema (`prisma-client` generator, output `../generated/prisma`).
- `prisma.config.ts` — loads `.env` from the repo root, then this package; falls back to a placeholder URL so `prisma generate` works without a database.
- `src/index.ts` — exports `prisma` (global singleton using `@prisma/adapter-pg`, throws if `DATABASE_URL` is unset) and re-exports all generated types.
- `generated/` — gitignored Prisma output; never edit or import it directly.

## Rules

- Import only from `@devport/db`.
- Schema changes: edit `schema.prisma`, run `bun run db:push` (dev) — there is no `prisma/migrations` directory yet. Keep Better Auth's `User`/`Session`/`Account`/`Verification` models compatible with `packages/auth`.
- User-owned models reference `userId` with `onDelete: Cascade` and an index; ids are `cuid()`; include `createdAt`/`updatedAt`. Ordered lists use an `order Int @default(0)` column.
- After changing a model, update backend route schemas and any payload types that mirror it (e.g. `apps/portfolio/src/lib/get-portfolio.ts`).

## Commands

```bash
bun run db:generate
bun run db:push
bun run db:migrate
bun run db:studio
```

Keep this file current whenever the schema workflow or package structure changes, per the root maintenance rule.
