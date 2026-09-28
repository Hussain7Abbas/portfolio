# DevPort documentation

DevPort is an open-source, self-hosted developer portfolio platform. A user signs up in the **user portal**, fills in their profile, projects, certificates, events, GitHub repos and SEO settings, and picks a template. The **portfolio app** then renders their public site at `/<username>/<templateSlug>`. An **admin dashboard** manages users, and a static **marketing website** introduces the product. All apps talk to one **Elysia API** backed by PostgreSQL.

Agent/contributor rules live in [AGENTS.md](../AGENTS.md); these pages explain how the project works.

## Contents

- [Architecture](architecture.md) — apps, packages, request flow, auth, and data model overview.
- [Development](development.md) — local setup, environment variables, commands, and workflow.
- [Apps](apps/Intro.md) — one page per application (backend, app, portfolio, dashboard, website).
- [Packages](packages.md) — shared workspace packages (`db`, `auth`, `ui`, `templates`, configs).
- [Deployment](deployment.md) — production Docker images, compose stack, and nginx.

## Related material

- [README](../README.md) and [CONTRIBUTING](../CONTRIBUTING.md).
- [`plan/`](../plan/00-overview.md) — the original step-by-step implementation plans and [status](../plan/IMPLEMENTATION-STATUS.md). They are historical and may differ from the current code (e.g. they mention Tailwind 4; the apps use Tailwind 3).
- [`legacy/`](../legacy/README.md) — the pre-DevPort single-user portfolio the VS Code template was ported from.
