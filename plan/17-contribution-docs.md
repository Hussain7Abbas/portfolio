# Step 17 — Contribution Docs & Final Checks

## Goal

Write the CONTRIBUTING.md template guide, update the README, and run final typechecks across
all apps and packages.

## Steps

### 17.1 — CONTRIBUTING.md

**CONTRIBUTING.md** at repository root:

````markdown
# Contributing to DevPort

Thank you for your interest in contributing to DevPort! This guide covers how to contribute
a portfolio template.

## Table of Contents

- [Getting Started](#getting-started)
- [Contributing a Template](#contributing-a-template)
- [Template Interface](#template-interface)
- [Portfolio Data Shape](#portfolio-data-shape)
- [Development Workflow](#development-workflow)
- [Submitting a PR](#submitting-a-pr)

## Getting Started

1. Fork and clone the repo
2. Install dependencies: `bun install`
3. Copy `.env.example` to `.env` and fill in values
4. Start PostgreSQL: `docker compose -f docker/docker-compose.yml up -d`
5. Run migrations: `bun run db:push`
6. Start dev: `bun run dev`

## Contributing a Template

Templates live in `apps/portfolio/src/templates/<your-template-slug>/`.

### Directory Structure

```
apps/portfolio/src/templates/your-template/
├── index.ts                    # Template manifest (required)
├── YourTemplate.tsx            # Main wrapper component (required)
├── components/                 # Your template's components
│   └── ...
├── pages/                      # Section page components
│   ├── HomePage.tsx            # Required
│   ├── AboutPage.tsx           # Required
│   ├── ProjectsPage.tsx        # Required
│   ├── CertificatesPage.tsx    # Optional
│   ├── GithubPage.tsx          # Optional
│   ├── ContactPage.tsx         # Required
│   └── SettingsPage.tsx        # Optional
├── styles/                     # Your CSS/CSS Modules
│   └── ...
└── lib/                        # Template utilities (optional)
    └── ...
```

### Template Manifest

Your `index.ts` must export a `TemplateManifest`:

```ts
import type { TemplateManifest } from "../registry";
import { YourTemplate } from "./YourTemplate";

export const yourTemplate: TemplateManifest = {
  slug: "your-template",        // URL-safe, lowercase, hyphens only
  name: "Your Template Name",
  description: "A brief description of your template.",
  author: "Your Name",
  sections: ["home", "about", "projects", "certificates", "github", "contact", "settings"],
  component: YourTemplate,
};
```

### Register Your Template

Add your template to `apps/portfolio/src/templates/registry.ts`:

```ts
import { yourTemplate } from "./your-template";

const templates: Record<string, TemplateManifest> = {
  vscode: vscodeTemplate,
  "your-template": yourTemplate,  // Add this line
};
```

## Template Interface

Your main component receives:

```ts
interface TemplateProps {
  data: PortfolioData;
  section: string;       // "home" | "about" | "projects" | etc.
}
```

You must render the correct page based on `section`.

## Portfolio Data Shape

```ts
interface PortfolioData {
  profile: {
    username: string;
    displayName: string;
    title: string | null;
    bio: string | null;
    photoUrl: string | null;
    resumeUrl: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    websiteUrl: string | null;
    emailPublic: string | null;
    activeTemplate: string;
  };
  projects: Array<{
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    tags: string[];
    demoUrl: string | null;
    sourceUrl: string | null;
  }>;
  certificates: Array<{
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    url: string | null;
  }>;
  events: Array<{
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    url: string | null;
  }>;
  githubConfig: {
    githubUsername: string;
    selectedRepos: string[];
  } | null;
  seoMeta: {
    title: string | null;
    description: string | null;
    ogImage: string | null;
    keywords: string | null;
  } | null;
}
```

## Development Workflow

1. Create your template directory
2. Build your components and styles
3. Export the manifest
4. Register in the registry
5. Test locally:
   - Create a test user via the app
   - Visit `http://localhost:3002/<username>/<your-template-slug>`
   - Test all sections

## Rules

- Templates must be responsive (mobile + desktop)
- Templates must handle null/empty data gracefully (show placeholders)
- No external API calls from templates (all data comes via props)
- Templates may use any CSS approach (Tailwind, CSS Modules, styled-components, etc.)
- Templates may import from `@devport/ui` for shared utilities (cn, BlurFade, etc.)
- All files must be TypeScript (.ts/.tsx)
- No `any` types
- Must pass `bun run typecheck`

## Submitting a PR

1. Fork the repository
2. Create a branch: `git checkout -b template/your-template-name`
3. Add your template following the structure above
4. Run `bun run typecheck` and fix all errors
5. Test all sections locally
6. Submit a PR with:
   - Template name and description
   - Screenshot of each section
   - Your name for attribution
````

### 17.2 — Update README.md

Replace the current README with a comprehensive project README:

```markdown
# DevPort

Free, open-source developer portfolio platform. Create an account, add your projects,
pick a template, and share your portfolio with the world.

## Features

- Multiple portfolio templates (community-contributed)
- Project, certificate, and event management
- GitHub integration (show selected repos)
- Contact form with in-app inbox
- SEO metadata customization
- Multiple auth methods (email, Google, GitHub)

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Elysia (Bun)
- **Auth**: BetterAuth
- **Database**: PostgreSQL + Prisma
- **File Storage**: AWS S3
- **Monorepo**: Turborepo

## Quick Start

### Prerequisites

- Bun >= 1.0
- Docker (for PostgreSQL)

### Setup

    git clone https://github.com/youruser/devport.git
    cd devport
    cp .env.example .env
    # Edit .env with your values

    bun install
    docker compose -f docker/docker-compose.yml up -d
    bun run db:push
    bun run db:generate
    bun run dev

### Apps

| App | URL | Description |
|-----|-----|-------------|
| Website | http://localhost:3004 | Landing page |
| User App | http://localhost:3000 | Portfolio management |
| Portfolio | http://localhost:3002 | Portfolio renderer |
| Dashboard | http://localhost:3003 | Admin panel |
| Backend | http://localhost:3001 | API server |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for template contribution guide.

## License

MIT
```

### 17.3 — Final typecheck

Run from monorepo root:

```bash
bun run typecheck
```

This runs `tsc --noEmit` in all apps and packages via Turborepo. Fix every error.

Common issues to check:
- Missing type imports from `@devport/db`
- Props passed incorrectly between components
- Null checks on optional fields
- BetterAuth type exports

### 17.4 — Full build test

```bash
bun run build
```

Verify all apps build successfully. Fix any build errors.

### 17.5 — Docker build test

```bash
docker compose -f docker/docker-compose.prod.yml build
```

Verify all Docker images build. Test the full stack locally:

```bash
docker compose -f docker/docker-compose.prod.yml up -d
# Test each service
```

### 17.6 — End-to-end smoke test

Manual test checklist:

- [ ] Visit website landing page
- [ ] Sign up as a new user
- [ ] Complete onboarding wizard (username, profile, project, template)
- [ ] Edit profile
- [ ] Add/edit/delete a project
- [ ] Add/edit/delete a certificate
- [ ] Add/edit/delete an event
- [ ] Connect GitHub and select repos
- [ ] Update SEO settings
- [ ] Change template in settings
- [ ] Visit portfolio at `localhost:3002/<username>/vscode`
- [ ] Verify all portfolio sections render
- [ ] Submit contact form on portfolio
- [ ] Check message appears in inbox
- [ ] Log in as admin on dashboard
- [ ] View overview stats
- [ ] View user list
- [ ] View sitemap.xml on portfolio app
- [ ] Verify responsive design (mobile)

## Key Notes

- The typecheck is the single most important verification. If `bun run typecheck` passes
  across all packages, the project is structurally sound.
- The build test catches runtime issues that TypeScript misses (like missing CSS imports,
  bad image paths, etc.).
- The Docker build test catches dependency issues in the production environment.

## Project Complete

After this step, DevPort is a fully functional portfolio platform with:
- User registration and authentication
- Portfolio data management
- Template-based portfolio rendering
- Admin dashboard
- Production-ready Docker deployment
- Community template contribution system
