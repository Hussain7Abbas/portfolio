# Marketing website (`apps/website`)

[← Apps](Intro.md)

A Next.js 15 landing page (port 3004 in dev) built with `output: "export"` into static files in `out/`. In production, nginx serves those files ([Deployment](../deployment.md)). The site has no auth and makes no API calls, so it must stay compatible with static export: no server-only features, and images stay `unoptimized`.

## Structure

`src/app/page.tsx` puts the page together from section components in `src/components/`: `navbar`, `hero`, `features`, `how-it-works`, `templates-showcase`, `open-source-cta`, and `footer`. Animations use `framer-motion`, and styling uses Tailwind 3 with the shared preset. `cn()` comes from `packages/ui` through the `@/lib/utils` alias.

Outbound links use the `NEXT_PUBLIC_*_URL` variables, plus `NEXT_PUBLIC_GITHUB_REPO_URL` for the repository link. These values are inlined at build time.
