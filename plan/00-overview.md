# Step 0 — Project Overview

## What is DevPort?

DevPort is an open-source, self-hosted portfolio platform. Users create an account, fill in their
portfolio data (projects, certificates, events, bio, GitHub repos), and choose a template. Their
portfolio is rendered at `portfolio.iscoded.com/<username>/<templateSlug>`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + Bun workspaces |
| Frontend (4 apps) | Next.js 15, App Router, TypeScript |
| Backend (1 app) | Elysia (Bun runtime) |
| Auth | BetterAuth (email/password + Google + GitHub OAuth) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| File Storage | AWS S3 |
| Styling | Tailwind CSS 4 + CSS Modules (for templates) |
| UI Components | shadcn/ui pattern via `@devport/ui` |
| Containerization | Docker + docker-compose |
| Deployment | VPS (no Vercel) |

## Apps

| App | Subdomain | Purpose | Auth |
|-----|-----------|---------|------|
| `website` | `iscoded.com` | SaaS landing page | None |
| `app` | `app.iscoded.com` | User portal — manage portfolio data | User role |
| `dashboard` | `dashboard.iscoded.com` | Admin panel — manage users/templates | Admin role |
| `portfolio` | `portfolio.iscoded.com` | Render user portfolios | None |
| `backend` | `api.iscoded.com` | Elysia REST API for all apps | N/A (serves auth) |

## Shared Packages

| Package | Purpose |
|---------|---------|
| `@devport/db` | Prisma schema, client singleton, generated types |
| `@devport/auth` | BetterAuth server + client configs |
| `@devport/ui` | Shared React components (buttons, forms, cards, etc.) |
| `@devport/tsconfig` | Base TypeScript configs |
| `@devport/tailwind-config` | Shared Tailwind preset |

## Monorepo Structure

```
devport/
├── apps/
│   ├── backend/          # Elysia API (Bun)
│   ├── app/              # User portal (Next.js 15)
│   ├── dashboard/        # Admin panel (Next.js 15)
│   ├── portfolio/        # Portfolio renderer (Next.js 15)
│   └── website/          # Landing page (Next.js 15)
├── packages/
│   ├── db/               # Prisma schema + client
│   ├── auth/             # BetterAuth config
│   ├── ui/               # Shared components
│   ├── tsconfig/         # TS configs
│   └── tailwind-config/  # Tailwind preset
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.next
├── plan/                 # These plan docs
├── turbo.json
├── package.json
├── .env
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

## Implementation Phases

| Phase | Steps | What You Get |
|-------|-------|-------------|
| Phase 1 — Foundation | Steps 01–03 | Turborepo, shared packages, Prisma, Docker Postgres |
| Phase 2 — Backend | Steps 04–06 | Auth package, Elysia API, shared UI |
| Phase 3 — User App | Steps 07–10 | Auth pages, onboarding, all CRUD, S3 uploads |
| Phase 4 — Portfolio | Steps 11–13 | Portfolio app, VS Code template migration, SEO |
| Phase 5 — Admin + Website | Steps 14–15 | Admin dashboard, landing page |
| Phase 6 — DevOps + Docs | Steps 16–17 | Production Docker, contribution docs, final checks |

## Key Decisions Captured

- No `any` types in TypeScript — use proper types everywhere
- Always use `bun` as the package manager (not npm/pnpm/yarn)
- No eslint-disable comments
- Always typecheck after completing work
- Free and open-source — no paywall features
- Templates are community-contributed via git PRs
- Contact messages go to an in-app inbox (no Notion dependency)
- GitHub integration is optional per user
- No real-time preview in the editor — simple form-based CRUD
- No data import — users enter data manually
- Guided onboarding wizard after signup
