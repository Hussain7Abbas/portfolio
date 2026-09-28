# apps/backend — Elysia API

Bun + Elysia REST API on port 3001. Serves Better Auth at `/api/auth/*` (mounted from `@devport/auth/server`) and all DevPort data routes. Shared rules live in the [root AGENTS.md](../../AGENTS.md); design notes in [docs/apps/backend.md](../../docs/apps/backend.md).

## Structure

- `src/index.ts` — app composition: CORS (origins from `NEXT_PUBLIC_*_URL`), global `onError` (maps validation → 400, not found → 404, else 500 with `{ error }`), `.mount(auth.handler)`, then `.use(<routes>)`, `/health`.
- `src/plugins/auth.ts` — `authMacro` with `auth: true` (401 without session) and `admin: true` (403 unless `role === "admin"`); exports `SessionUser`.
- `src/routes/*.ts` — one `new Elysia()` plugin per resource, exported as `<name>Routes`, all paths prefixed `/api/...`.
- `src/lib/*.ts` — small helpers: in-memory `cache` and `rate-limit`, `github-api`, `s3`, `request-ip`, `url-validate`, `reserved-usernames`.

## Rules

- New route file: `export const fooRoutes = new Elysia().use(authMacro)…`, register it in `src/index.ts`.
- Protect routes with the macro option (`{ auth: true }` / `{ admin: true }`), then cast `const u = user as SessionUser;`. Always scope Prisma queries by `userId: u.id` for user-owned data.
- Validate bodies with Elysia `t.Object(...)` schemas defined next to the routes. Validate user-supplied URLs with `isValidHttpUrl` / `findInvalidImageUrlField`.
- Failures: set `set.status` and return `{ error: "..." }`. Success payloads are wrapped objects (`{ projects }`, `{ project }`), with `201` on create.
- Public (unauthenticated) routes live in `routes/portfolio.ts`; rate-limit anything writable there (contact form uses `isRateLimited` keyed by client IP).
- S3 is optional: check `isS3Configured()` and return 503 when unset. GitHub calls go through `lib/github-api.ts` (cached).
- The in-memory cache/rate limiter are per-process; don't rely on them across instances.

## Commands

```bash
bun run --filter @devport/backend dev        # bun --hot src/index.ts
bun run --filter @devport/backend build      # bun build → dist/
bun run --filter @devport/backend typecheck
```

Keep this file current whenever the backend's routes, structure, or conventions change, per the root maintenance rule.
