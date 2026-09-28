# packages/ui — `@devport/ui`

Shared shadcn-style components (style `base-nova`, built on `@base-ui/react`, `lucide-react` icons) and the `cn` helper. Shared rules live in the [root AGENTS.md](../../AGENTS.md); see also [docs/packages.md](../../docs/packages.md#devportui).

## Structure

- `src/components/ui/*.tsx` — primitives (button, card, input, label, select, checkbox, textarea, separator, skeleton, alert-dialog, sonner).
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge).
- `components.json` — shadcn CLI config that writes here while using `apps/app`'s Tailwind config and CSS.

## Rules

- There is no `exports` map: apps consume these files through tsconfig paths (`@/components/ui/*` → `packages/ui/src/components/ui/*`, `@/lib/utils` → `packages/ui/src/lib/utils.ts`) in `apps/app`, `apps/dashboard` (and `@/lib/utils` in `apps/website`). Inside this package, import siblings the same way (`@/lib/utils`).
- Consuming apps must include `../../packages/ui/src/**/*` in their Tailwind `content` and define the CSS variables used by `@devport/tailwind-config`.
- Add or update primitives with the shadcn CLI run from this package; keep generated formatting (no semicolons). Components must stay app-agnostic — no data fetching or app routes.

## Commands

```bash
bun run --filter @devport/ui typecheck
```

Keep this file current whenever the component set, aliases, or consumption pattern change, per the root maintenance rule.
