# Backend (`apps/backend`)

[← Apps](Intro.md)

The backend is an Elysia server running on Bun (port 3001). It hosts Better Auth under `/api/auth/*` and every DevPort data endpoint. Rules: [apps/backend/AGENTS.md](../../apps/backend/AGENTS.md).

## Composition

`src/index.ts` sets up the server in this order:

1. CORS for the four app origins, with credentials enabled.
2. A global error handler. Validation errors return 400 with the first message, unknown routes return 404, and anything else is logged and returns 500. Every error body has the shape `{ error }`.
3. The Better Auth handler, then each route plugin, then `/health`.

`src/plugins/auth.ts` defines the `auth` and `admin` macros that resolve the session into `user`/`session` for a handler.

## Endpoints

| Area | Routes | Access |
|------|--------|--------|
| Profile | `GET/PUT /api/profile`, `POST /api/profile/username/check` | user |
| Projects | `/api/projects`, `/api/projects/:id`, `/api/projects/reorder` | user |
| Certificates | `/api/certificates`, `/api/certificates/:id` | user |
| Events | `/api/events`, `/api/events/:id` | user |
| GitHub | `/api/github/config`, `/api/github/repos/:username` | user |
| Messages | `/api/messages`, `/api/messages/:id`, `/api/messages/:id/read`, `/api/messages/unread-count` | user |
| SEO | `GET/PUT /api/seo` | user |
| Upload | `POST /api/upload/presigned-url`, `DELETE /api/upload` | user |
| Public portfolio | `GET /api/portfolio/sitemap`, `GET /api/portfolio/:username`, `GET /api/portfolio/:username/github`, `POST /api/portfolio/:username/contact` | public |
| Admin | `/api/admin/overview`, `/api/admin/users`, `/api/admin/users/:id` | admin |

The `routes/*.ts` files are the source of truth for methods and body schemas.

## Behaviour notes

- **Public payloads** go through `public*` mappers in `routes/portfolio.ts`, so internal fields are never exposed. Profiles with `published = false` return 404 and are left out of the sitemap.
- **Contact form** requests are rate-limited per client IP (`lib/rate-limit.ts`, `lib/request-ip.ts`, which honours `x-forwarded-for` and `x-real-ip`) and stored as `ContactMessage` rows.
- **GitHub** repo lists come from the GitHub REST API (optionally authenticated with `GITHUB_API_KEY`). Forks and private repos are filtered out and results are cached in memory for 12 minutes.
- **Usernames** are checked against `lib/reserved-usernames.ts`.
- **URLs** supplied by users must be absolute `http(s)` (`lib/url-validate.ts`).
- **Uploads** limit content types to png/jpeg/gif/webp/svg/pdf, capped at 5 MB for images and 10 MB for PDFs, with keys under `uploads/<userId>/`.
- The cache and the rate limiter are in-memory and per process.
