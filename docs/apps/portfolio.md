# Portfolio renderer (`apps/portfolio`)

[← Apps](Intro.md)

A Next.js 15 App Router application (port 3002, `standalone`) that renders public portfolios. Rules: [apps/portfolio/AGENTS.md](../../apps/portfolio/AGENTS.md).

## Routing

`/<username>/<templateSlug>/` serves the home page, with sub-pages `about`, `projects`, `certificates`, `contact`, `github`, and `settings`. The root `/` is a placeholder explainer page.

`[username]/[templateSlug]/layout.tsx`:

1. Loads the portfolio with `getPortfolioByUsername` (server-side, `API_URL`, 60 s revalidate, deduplicated per request through React `cache`).
2. Returns 404 when the user is missing or unpublished, the slug is not the user's `activeTemplate`, or the slug is not registered.
3. Builds metadata from `SEOMeta`, falling back to the profile: title, description, keywords, canonical URL, Open Graph, and Twitter card. It also emits a schema.org `Person` JSON-LD block.
4. Wraps the pages in the template's shell component.

Each sub-page repeats the checks and calls `templateSupportsPage` before rendering. `sitemap.ts` lists every published profile's template pages, and `robots.ts` points to the sitemap.

## Templates

`src/templates/registry.ts` maps a slug to a `TemplateDefinition`: an optional `shell` component and the set of supported `TemplateSubPage`s. Only `vscode` exists today.

The **VS Code template** (`src/templates/vscode/`) is ported from `legacy/original-portfolio`. It is built from `.jsx` components (titlebar, sidebar, explorer, tabs, bottom bar, cards) and CSS Modules in `styles/`, imported through the `@vscode/styles/*` alias. `vscode-shell.tsx` provides the layout. `base-context.tsx` exposes the portfolio's base path (`/<username>/vscode`) so internal links resolve under it.

### Adding a template

1. Add `{ slug, name, description }` to `TEMPLATES` in `packages/templates/src/index.ts`. The backend then accepts the slug and the portal offers it.
2. Implement the template under `apps/portfolio/src/templates/<slug>/`, including a shell that accepts `TemplateShellProps` if it needs one.
3. Register the template in `src/templates/registry.ts` with the sub-pages it supports.
4. Make sure the page components render correctly for the new template, then check every `/<username>/<slug>/…` route.

## Contact form

`contact/contact-form.tsx` posts from the browser to `${NEXT_PUBLIC_API_URL}/api/portfolio/:username/contact`. This requires the portfolio origin to be in the backend's CORS list. Submissions arrive in the owner's inbox in the user portal.
