# apps/portfolio — public portfolio renderer

Next.js 15 App Router app on port 3002 that renders published portfolios at `/<username>/<templateSlug>/...`. No auth; data comes from the backend's public `/api/portfolio/*` routes. Shared rules live in the [root AGENTS.md](../../AGENTS.md); details in [docs/apps/portfolio.md](../../docs/apps/portfolio.md).

## Structure

- `src/app/[username]/[templateSlug]/` — `layout.tsx` (fetch, 404 checks, metadata, JSON-LD, template shell) and sub-pages `page.tsx` (home), `about`, `projects`, `certificates`, `contact`, `github`, `settings`.
- `src/app/sitemap.ts`, `robots.ts`, `not-found.tsx`.
- `src/lib/get-portfolio.ts` — `getPortfolioByUsername` (React `cache`, `revalidate: 60`, server-side `API_URL`) and `PortfolioPayload` types.
- `src/templates/registry.ts` — maps template slug → shell component + supported `TemplateSubPage`s.
- `src/templates/vscode/` — the VS Code template ported from `legacy/original-portfolio` (`.jsx` components, CSS Modules in `styles/`, `vscode-shell.tsx`, `base-context.tsx`).

## Rules

- Every page must `notFound()` unless the portfolio exists, `profile.activeTemplate === templateSlug`, and `templateSupportsPage(templateSlug, "<page>")`.
- Adding a template: add metadata to `packages/templates/src/index.ts`, register it in `src/templates/registry.ts`, put its code under `src/templates/<slug>/`, and verify `/<username>/<slug>` routes. The backend and user app pick it up from `@devport/templates`.
- Template styling uses CSS Modules (imported via the `@vscode/styles/*` alias for the VS Code template); this app does not use Tailwind or `@devport/ui`.
- Keep ported `.jsx` template components in their original style unless converting a file fully to TSX; the tsconfig allows JS.
- Links inside a template must be built from the base path provided by the shell/context, not hard-coded to `/`.
- Contact form posts from the browser to `NEXT_PUBLIC_API_URL` (CORS), not through a rewrite.

## Commands

```bash
bun run --filter @devport/portfolio dev
bun run --filter @devport/portfolio typecheck
```

Keep this file current whenever routes, the template registry, or template conventions change, per the root maintenance rule.
