# Admin dashboard (`apps/dashboard`)

[← Apps](Intro.md)

A Next.js 15 App Router application (port 3003, `standalone`) for administrators. It is structured like the [user portal](app.md): the same `/api` rewrite to the backend, the same `src/lib/session.ts`, `client-fetch.ts`, and `auth-client.ts` helpers, the same `packages/ui` path aliases, and the same Tailwind setup. Follow the conventions in [apps/app/AGENTS.md](../../apps/app/AGENTS.md).

## Access

`src/middleware.ts` allows `/sign-in` and `/forbidden` without a session. Every other route needs a session, and users without `role === "admin"` are redirected to `/forbidden`. The backend enforces the same rule with `{ admin: true }` on `/api/admin/*`. To make someone an admin, see [Development → Making an admin](../development.md#making-an-admin).

## Pages

- `/`: an overview built from `GET /api/admin/overview`.
- `/users`: a users table (`users-table.tsx`) backed by `/api/admin/users` and `/api/admin/users/:id`.
