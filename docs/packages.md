# Shared packages

[← Docs index](intro.md)

Workspace packages are consumed as `workspace:*` dependencies and ship TypeScript source directly. They have no build step; Next apps list the ones that need transpiling in `transpilePackages`.

## `@devport/db`

Prisma 7 + PostgreSQL. `prisma/schema.prisma` generates into the gitignored `generated/prisma` folder. `src/index.ts` exports a singleton `prisma` client (via `@prisma/adapter-pg`) and re-exports every generated model type. `prisma.config.ts` loads the root `.env`. For the models, see [Architecture → Data model](architecture.md#data-model). Rules: [packages/db/AGENTS.md](../packages/db/AGENTS.md).

## `@devport/auth`

Better Auth configuration.

- `@devport/auth/server` exports `auth`: the Prisma adapter, email/password with required verification, optional Google/GitHub OAuth, the `role` additional field, and trusted origins. The backend mounts `auth.handler` and uses `auth.api.getSession`.
- `@devport/auth/client` exports `createDevPortAuthClient(baseURL?)`, a `better-auth/react` client. The app and dashboard call it with the browser's own origin so requests go through the `/api` rewrite.

## `@devport/ui`

Shared shadcn components (style `base-nova`, built on `@base-ui/react`) plus `cn()`. The package has no `exports` map. The app and dashboard import it through tsconfig path aliases (`@/components/ui/*`, `@/lib/utils`), and the website imports only `cn`. Consumers must add `packages/ui/src` to their Tailwind content globs. Rules: [packages/ui/AGENTS.md](../packages/ui/AGENTS.md).

## `@devport/templates`

The canonical list of portfolio templates: `TEMPLATES`, `TEMPLATE_SLUGS`, `DEFAULT_TEMPLATE_SLUG`, `isValidTemplateSlug`, `getTemplateMeta`. The backend, user portal, and portfolio app all use it. Adding a template is described in [apps/portfolio.md](apps/portfolio.md#adding-a-template).

## `@devport/tsconfig`

- `base.json`: strict mode, `noUncheckedIndexedAccess`, `isolatedModules`, `noEmit`.
- `nextjs.json`: the Next.js app settings and the `@/*` alias.
- `node.json`: settings for Node/Bun packages.

## `@devport/tailwind-config`

A Tailwind 3 preset. It maps semantic color names (`background`, `primary`, `muted`, …) and radii to CSS variables and adds `tailwindcss-animate`. Each app spreads the preset and sets its own `content` globs. The variables themselves are defined in each app's `globals.css`.
