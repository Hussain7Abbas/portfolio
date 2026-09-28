# apps/app — user portal

Next.js 15 App Router app on port 3000 where users sign up, onboard, and manage their portfolio data. Shared rules live in the [root AGENTS.md](../../AGENTS.md); details in [docs/apps/app.md](../../docs/apps/app.md). `apps/dashboard` follows the same patterns (auth, fetch helpers, UI aliases) with an admin-role check instead of email verification.

## Structure

- `src/app/(auth)/` — sign-in, sign-up, verify-email (public).
- `src/app/onboarding/` — guided wizard after signup.
- `src/app/(app)/` — authenticated sections (profile, projects, certificates, events, github, messages, seo, settings) sharing `layout.tsx`, `app-header.tsx`, `loading.tsx`, `error.tsx`.
- `src/components/` — app-specific components (`loading-button`, `empty-state`, `error-state`, `file-upload`, `use-confirm`).
- `src/lib/` — `session.ts` (server), `client-fetch.ts` (browser), `auth-client.ts`.
- `src/middleware.ts` — redirects unauthenticated users to `/sign-in?next=…` and unverified users to `/verify-email`.

## Rules

- Each section is a thin server `page.tsx` that renders a `"use client"` `<name>-client.tsx` / `<name>-form.tsx` in the same folder.
- All API calls use relative `/api/...` paths (rewritten to the backend by `next.config.ts`). In client components use `apiJson<T>()` / `apiFetch()` and catch `ApiError`; in server components use `fetchWithSession()` / `getServerSession()`.
- Shared UI comes from `@/components/ui/*` and `@/lib/utils`, which resolve into `packages/ui` via tsconfig paths. Add new shadcn primitives to `packages/ui`, not here.
- User feedback via `sonner` `toast`; destructive actions via `useConfirm`; async buttons via `LoadingButton`.
- Style with Tailwind utilities and the CSS variables in `src/app/globals.css`; keep `tailwind.config.ts` content globs including `packages/ui/src`.
- Template choices come from `@devport/templates` (`TEMPLATES`), never hard-coded slugs.

## Commands

```bash
bun run --filter @devport/app dev
bun run --filter @devport/app typecheck
```

Keep this file current whenever this app's structure or conventions change, per the root maintenance rule.
