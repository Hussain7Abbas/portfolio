# Architecture

[← Docs index](intro.md)

## Monorepo layout

Turborepo orchestrates Bun workspaces under `apps/*` and `packages/*` (see root `package.json` and `turbo.json`). `dev`, `build`, and `typecheck` all depend on `^db:generate`, so the Prisma client is generated before anything that imports `@devport/db`.

| App | Dev port | Production host (example) | Role |
|-----|----------|---------------------------|------|
| `@devport/backend` | 3001 | `api.iscoded.com` | Elysia API + Better Auth |
| `@devport/app` | 3000 | `app.iscoded.com` | User portal |
| `@devport/portfolio` | 3002 | `portfolio.iscoded.com` | Public portfolio renderer |
| `@devport/dashboard` | 3003 | `dashboard.iscoded.com` | Admin panel |
| `@devport/website` | 3004 | `iscoded.com` | Static marketing site |

Hostnames come from the example [`docker/nginx/nginx.conf`](../docker/nginx/nginx.conf).

## Request flow

```
browser ──► app / dashboard (Next.js) ──rewrite /api/*──► backend (Elysia) ──► Postgres
                                                              │
browser ──► portfolio (Next.js, server fetch via API_URL) ────┘
browser ──► portfolio contact form ──NEXT_PUBLIC_API_URL (CORS)──► backend
browser ──► website (static files, no API)
```

- **User portal and dashboard** proxy `/api/*` to the backend with a Next.js rewrite (`BACKEND_URL`, default `http://127.0.0.1:3001`). Because the browser only sees the app origin, Better Auth cookies are first-party. Server components forward the incoming cookies when they call the API (`src/lib/session.ts`).
- **Portfolio** fetches `/api/portfolio/:username` server-side with a 60 s revalidate, and `/api/portfolio/sitemap` for `sitemap.xml`. Unpublished profiles return 404.
- **Backend** allows CORS from the four `NEXT_PUBLIC_*_URL` origins, which are also Better Auth's `trustedOrigins`.

## Authentication

Better Auth (`packages/auth`) with the Prisma adapter:

- Email + password with **required email verification**. Until a mail provider is wired up, the verification link is logged to the backend console. The link is rewritten to the app origin so the session cookie lands on the right domain.
- Optional Google and GitHub OAuth, enabled only when both client id and secret env vars are set.
- A `role` user field (`"user"` by default, `"admin"` for dashboard access; not user-settable).
- Enforcement: Next middleware in `apps/app` (session + verified email) and `apps/dashboard` (session + admin role); backend `authMacro` (`auth: true` / `admin: true`).

## Data model

Defined in [`packages/db/prisma/schema.prisma`](../packages/db/prisma/schema.prisma):

- Better Auth tables: `User`, `Session`, `Account`, `Verification`.
- Portfolio data (one-to-one with `User`): `Profile` (unique `username`, `activeTemplate`, `published`), `GithubConfig`, `SEOMeta`.
- Portfolio lists (one-to-many, ordered by `order`): `Project`, `Certificate`, `Event`.
- Inbox: `ContactMessage` (written by the public contact form, read in the user portal).

All user-owned rows cascade on user deletion.

## Templates

Template metadata (slug, name, description) lives in `@devport/templates` and is shared by the backend (validating `activeTemplate`), the user portal (template picker), and the portfolio app. The portfolio app maps each slug to a React shell and a set of supported sub-pages. See [apps/portfolio.md](apps/portfolio.md).

## File uploads

The backend issues S3 presigned PUT URLs (`/api/upload/presigned-url`) for images and PDFs. It enforces type and size limits and uses per-user key prefixes. Uploads are disabled (503) when the AWS env vars are missing.
