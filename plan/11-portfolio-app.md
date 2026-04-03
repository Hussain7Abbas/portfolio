# Step 11 — Portfolio App Setup

## Goal

Create the `apps/portfolio` Next.js 15 application with dynamic routing that resolves
`/[username]/[templateSlug]` and renders the appropriate template with the user's data.

## Steps

### 11.1 — Initialize the app

```bash
cd apps/portfolio
bun add next@latest react@latest react-dom@latest
bun add @devport/ui
bun add framer-motion react-github-calendar
bun add -d @types/react @types/react-dom @devport/tsconfig @devport/tailwind-config
bun add -d typescript tailwindcss postcss autoprefixer tailwindcss-animate
```

### 11.2 — Next.js config

**apps/portfolio/next.config.ts:**
```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@devport/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "imgur.com" },
    ],
  },
};

export default config;
```

### 11.3 — Data types

**apps/portfolio/src/types/portfolio.ts:**

```ts
interface PortfolioProfile {
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
}

interface PortfolioProject {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  tags: string[];
  demoUrl: string | null;
  sourceUrl: string | null;
}

interface PortfolioCertificate {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  url: string | null;
}

interface PortfolioEvent {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  url: string | null;
}

interface PortfolioGithubConfig {
  githubUsername: string;
  selectedRepos: string[];
}

interface PortfolioSEO {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  keywords: string | null;
}

interface PortfolioData {
  profile: PortfolioProfile;
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
  events: PortfolioEvent[];
  githubConfig: PortfolioGithubConfig | null;
  seoMeta: PortfolioSEO | null;
}
```

### 11.4 — Data fetching helper

**apps/portfolio/src/lib/api.ts:**
```ts
const API_URL = process.env.API_URL ?? "http://localhost:3001";

export async function getPortfolioData(username: string): Promise<PortfolioData | null> {
  const res = await fetch(`${API_URL}/api/portfolio/${username}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  return res.json();
}
```

Note: This uses `API_URL` (server-side only, not `NEXT_PUBLIC_`) since this fetch happens in
server components. In Docker/production, this is the internal network URL to the backend.

### 11.5 — Template registry

**apps/portfolio/src/templates/registry.ts:**

```ts
import type { PortfolioData } from "@/types/portfolio";

interface TemplateManifest {
  slug: string;
  name: string;
  description: string;
  author: string;
  sections: string[];
  component: React.ComponentType<{ data: PortfolioData; section: string }>;
}

// Import templates
import { vscodeTemplate } from "./vscode";

const templates: Record<string, TemplateManifest> = {
  vscode: vscodeTemplate,
};

export function getTemplate(slug: string): TemplateManifest | undefined {
  return templates[slug];
}

export function getAllTemplateSlugs(): string[] {
  return Object.keys(templates);
}

export { templates };
```

### 11.6 — Dynamic routing

**apps/portfolio/src/app/[username]/page.tsx:**
```ts
// Redirect /username → /username/<activeTemplate>
// Fetch profile to get activeTemplate, then redirect
```

**apps/portfolio/src/app/[username]/[templateSlug]/layout.tsx:**
```ts
// Fetch portfolio data
// Resolve template from registry
// If template not found → 404
// If username not found → 404
// Pass data to template component
```

**apps/portfolio/src/app/[username]/[templateSlug]/page.tsx:**
```ts
// Render template's "home" section
```

**apps/portfolio/src/app/[username]/[templateSlug]/[...section]/page.tsx:**
```ts
// Catch-all for template sub-pages: about, projects, certificates, github, contact, settings
// Render template's corresponding section
// If section not in template's sections list → 404
```

### 11.7 — Route flow

```
Request: portfolio.iscoded.com/hussain/vscode
  → [username]="hussain", [templateSlug]="vscode"
  → Fetch data from GET /api/portfolio/hussain
  → Resolve "vscode" template from registry
  → Render vscode template with section="home"

Request: portfolio.iscoded.com/hussain/vscode/projects
  → [username]="hussain", [templateSlug]="vscode", [...section]=["projects"]
  → Render vscode template with section="projects"

Request: portfolio.iscoded.com/hussain
  → Fetch profile, get activeTemplate="vscode"
  → Redirect to /hussain/vscode
```

### 11.8 — Contact form endpoint

The contact form in templates submits to the public API:
```
POST /api/portfolio/<username>/contact
Body: { name, email, subject, message }
```

This creates a `ContactMessage` in the database tied to the portfolio owner's userId.

### 11.9 — 404 handling

**apps/portfolio/src/app/not-found.tsx:**
- User not found: "This portfolio doesn't exist. Create yours at app.iscoded.com"
- Template not found: "This template doesn't exist."

## File Structure

```
apps/portfolio/src/
├── app/
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── [username]/
│       ├── page.tsx                          # Redirect to active template
│       └── [templateSlug]/
│           ├── layout.tsx                    # Data fetching + template resolution
│           ├── page.tsx                      # Home section
│           └── [...section]/
│               └── page.tsx                  # Other sections
├── templates/
│   ├── registry.ts
│   └── vscode/                              # (see Step 12)
│       └── ...
├── types/
│   └── portfolio.ts
└── lib/
    └── api.ts
```

## Key Notes

- Portfolio pages are rendered server-side for SEO. Data is fetched via `fetch()` in server
  components with `revalidate: 60` (ISR — revalidate every 60 seconds).
- Templates are statically imported into the registry. Adding a new template means adding
  a folder and registering it.
- The portfolio app has no authentication — it's purely a renderer.
- `API_URL` (not `NEXT_PUBLIC_`) is used because fetches happen server-side. In Docker, this
  would be `http://backend:3001`.

## Verification

- `bun run dev` starts on port 3002
- Visiting `/username/vscode` renders the VS Code template (after Step 12)
- Visiting `/nonexistent` shows 404
- Visiting `/username` redirects to `/username/<activeTemplate>`
- Data from the API is correctly rendered in the template

## Next Step

Proceed to [Step 12 — Migrate VS Code Template](./12-vscode-template.md).
