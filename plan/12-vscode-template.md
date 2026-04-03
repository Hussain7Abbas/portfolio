# Step 12 — Migrate VS Code Template

## Goal

Convert the existing VS Code portfolio (all components, styles, icons, pages) from the original
repository into the `apps/portfolio/src/templates/vscode/` directory, adapting everything from
hardcoded data to dynamic `PortfolioData` props.

## Source → Destination Mapping

| Original File | New Location |
|---------------|-------------|
| `components/Layout.jsx` | `templates/vscode/components/Layout.tsx` |
| `components/Sidebar.jsx` | `templates/vscode/components/Sidebar.tsx` |
| `components/Titlebar.jsx` | `templates/vscode/components/Titlebar.tsx` |
| `components/Tabsbar.jsx` | `templates/vscode/components/Tabsbar.tsx` |
| `components/Tab.jsx` | `templates/vscode/components/Tab.tsx` |
| `components/Explorer.jsx` | `templates/vscode/components/Explorer.tsx` |
| `components/Bottombar.jsx` | `templates/vscode/components/Bottombar.tsx` |
| `components/Head.jsx` | Removed (use Next.js `generateMetadata`) |
| `components/Illustration.jsx` | `templates/vscode/components/Illustration.tsx` |
| `components/ProjectCard.jsx` | `templates/vscode/components/ProjectCard.tsx` |
| `components/RepoCard.jsx` | `templates/vscode/components/RepoCard.tsx` |
| `components/EventCard.jsx` | `templates/vscode/components/EventCard.tsx` |
| `components/CertificateCard.jsx` | `templates/vscode/components/CertificateCard.tsx` |
| `components/ContactCode.jsx` | `templates/vscode/components/ContactCode.tsx` |
| `components/ThemeInfo.jsx` | `templates/vscode/components/ThemeInfo.tsx` |
| `components/icons/*.jsx` | `templates/vscode/components/icons/*.tsx` |
| `components/magicui/blur-fade.jsx` | `packages/ui/src/components/blur-fade.tsx` (shared) |
| `styles/themes.css` | `templates/vscode/styles/themes.css` |
| `styles/*.module.css` (20 files) | `templates/vscode/styles/*.module.css` |
| `pages/index.jsx` | `templates/vscode/pages/HomePage.tsx` |
| `pages/about.jsx` | `templates/vscode/pages/AboutPage.tsx` |
| `pages/projects.jsx` | `templates/vscode/pages/ProjectsPage.tsx` |
| `pages/certificates.jsx` | `templates/vscode/pages/CertificatesPage.tsx` |
| `pages/github.jsx` | `templates/vscode/pages/GithubPage.tsx` |
| `pages/contact.jsx` | `templates/vscode/pages/ContactPage.tsx` |
| `pages/settings.jsx` | `templates/vscode/pages/SettingsPage.tsx` |
| `public/` assets | `apps/portfolio/public/templates/vscode/` |

## Steps

### 12.1 — Copy and rename all files

Copy every file from the backup branch into the new template directory structure. Rename all
`.jsx` → `.tsx` and `.js` → `.ts`.

### 12.2 — Convert to TypeScript

For every file:
1. Add proper type annotations to all props, state, and function parameters
2. Replace `any` with specific types
3. Add interface definitions where needed
4. Fix any type errors

Example — `ProjectCard.jsx` → `ProjectCard.tsx`:

```tsx
// Before (JSX)
const ProjectCard = ({ project }) => { ... }

// After (TSX)
import type { PortfolioProject } from "@/types/portfolio";

interface ProjectCardProps {
  project: PortfolioProject;
}

const ProjectCard = ({ project }: ProjectCardProps) => { ... }
```

### 12.3 — Replace hardcoded data with props

The critical change: every page component that used `getStaticProps` with hardcoded JSON now
receives data via props from the template's parent.

**Before** (pages/projects.jsx):
```jsx
export async function getStaticProps() {
  const projects = getProjects(); // reads from JSON file
  return { props: { title: 'Projects', projects } };
}
```

**After** (templates/vscode/pages/ProjectsPage.tsx):
```tsx
interface ProjectsPageProps {
  projects: PortfolioProject[];
}

export default function ProjectsPage({ projects }: ProjectsPageProps) {
  // Same rendering logic, but projects come from props
}
```

### 12.4 — Adapt navigation/routing

The VS Code template's navigation (Sidebar, Explorer, Tabsbar) uses `next/link` with paths like
`/about`, `/projects`, etc. These must be updated to use the portfolio URL pattern:

**Before:** `/projects`
**After:** `/${username}/${templateSlug}/projects`

Create a context or utility that provides the base path:

```tsx
// templates/vscode/lib/useBasePath.ts
export function usePortfolioBasePath(username: string, templateSlug: string) {
  return `/${username}/${templateSlug}`;
}
```

Update all `<Link>` components in Sidebar, Explorer, Tabsbar to use this base path.

### 12.5 — Adapt the contact form

**Before:** Submits to `${process.env.NEXT_PUBLIC_API_URL}/contact` (Notion API).

**After:** Submits to `${API_URL}/api/portfolio/${username}/contact` which saves to the
`ContactMessage` table in PostgreSQL.

The ContactPage component receives the `username` as a prop so it knows where to POST.

### 12.6 — Adapt the GitHub page

**Before:** Uses `getStaticProps` to fetch from GitHub API directly.

**After:** Receives `githubConfig` (username + selected repos) from portfolio data. The template
component fetches repos client-side or via a server component using the GitHub API with the
stored username, filtering to only `selectedRepos`.

### 12.7 — Adapt the settings/theme page

The theme page (VS Code color themes: Dracula, Nord, etc.) stays as-is — it's a template-specific
feature that uses `localStorage` and `data-theme` attributes. No backend involvement.

### 12.8 — Template manifest export

**apps/portfolio/src/templates/vscode/index.ts:**

```tsx
import type { TemplateManifest } from "../registry";
import { VscodeTemplate } from "./VscodeTemplate";

export const vscodeTemplate: TemplateManifest = {
  slug: "vscode",
  name: "VS Code",
  description: "A Visual Studio Code inspired portfolio with file explorer navigation and multiple color themes.",
  author: "DevPort",
  sections: ["home", "about", "projects", "certificates", "github", "contact", "settings"],
  component: VscodeTemplate,
};
```

**apps/portfolio/src/templates/vscode/VscodeTemplate.tsx:**

The main wrapper component that receives `{ data, section }` and renders the appropriate page
inside the VS Code layout shell:

```tsx
import type { PortfolioData } from "@/types/portfolio";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ProjectsPage } from "./pages/ProjectsPage";
// ... etc

interface VscodeTemplateProps {
  data: PortfolioData;
  section: string;
}

export function VscodeTemplate({ data, section }: VscodeTemplateProps) {
  const renderSection = () => {
    switch (section) {
      case "home":
        return <HomePage profile={data.profile} />;
      case "about":
        return <AboutPage profile={data.profile} events={data.events} />;
      case "projects":
        return <ProjectsPage projects={data.projects} />;
      case "certificates":
        return <CertificatesPage certificates={data.certificates} />;
      case "github":
        return <GithubPage githubConfig={data.githubConfig} />;
      case "contact":
        return <ContactPage username={data.profile.username} profile={data.profile} />;
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <Layout data={data} currentSection={section}>
      {renderSection()}
    </Layout>
  );
}
```

### 12.9 — Move static assets

Move VS Code template assets to the portfolio app's public directory:

```bash
mkdir -p apps/portfolio/public/templates/vscode
# Copy theme icons, project images placeholder, etc.
cp public/*.png apps/portfolio/public/templates/vscode/
cp public/*.webp apps/portfolio/public/templates/vscode/
```

User-uploaded images (profile photos, project screenshots) are on S3 and referenced by URL —
they don't need to be in `public/`.

### 12.10 — Import template styles

The VS Code template uses CSS Modules and a `themes.css` file. Import them in the template's
root component:

```tsx
// In VscodeTemplate.tsx or Layout.tsx
import "./styles/themes.css";
```

CSS Modules are imported per-component as before — no change needed there.

## File Structure After Migration

```
apps/portfolio/src/templates/vscode/
├── index.ts                    # Template manifest
├── VscodeTemplate.tsx          # Main wrapper
├── components/
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── Titlebar.tsx
│   ├── Tabsbar.tsx
│   ├── Tab.tsx
│   ├── Explorer.tsx
│   ├── Bottombar.tsx
│   ├── Illustration.tsx
│   ├── ProjectCard.tsx
│   ├── RepoCard.tsx
│   ├── EventCard.tsx
│   ├── CertificateCard.tsx
│   ├── ContactCode.tsx
│   ├── ContactForm.tsx
│   ├── ThemeInfo.tsx
│   └── icons/
│       ├── AccountIcon.tsx
│       ├── CodeIcon.tsx
│       ├── ... (all icon components)
│       └── WatchIcon.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   ├── ProjectsPage.tsx
│   ├── CertificatesPage.tsx
│   ├── GithubPage.tsx
│   ├── ContactPage.tsx
│   └── SettingsPage.tsx
├── styles/
│   ├── themes.css
│   ├── Layout.module.css
│   ├── Titlebar.module.css
│   ├── Sidebar.module.css
│   ├── Tabsbar.module.css
│   ├── Tab.module.css
│   ├── Bottombar.module.css
│   ├── Explorer.module.css
│   ├── HomePage.module.css
│   ├── AboutPage.module.css
│   ├── ContactPage.module.css
│   ├── ContactCode.module.css
│   ├── ProjectsPage.module.css
│   ├── ProjectCard.module.css
│   ├── GithubPage.module.css
│   ├── RepoCard.module.css
│   ├── CertificatesPage.module.css
│   ├── CertificateCard.module.css
│   ├── EventCard.module.css
│   ├── SettingsPage.module.css
│   └── ThemeInfo.module.css
└── lib/
    └── paths.ts                # URL helpers for this template
```

## Key Notes

- The `blur-fade` component moves to `@devport/ui` since other templates may use it too.
- All `getStaticProps` / `getServerSideProps` patterns are removed. Data flows from the
  portfolio app's server components → template component → page components via props.
- The template is a pure React component tree — no Next.js page-level APIs inside it.
- CSS Modules work the same way since Next.js supports them in any component.
- `themes.css` uses `[data-theme]` attribute selectors which remain template-specific.

## Verification

- Visit `http://localhost:3002/hussain/vscode` and see the VS Code portfolio
- All sections render: home, about, projects, certificates, github, contact, settings
- Theme switching works (Dracula, Nord, etc.)
- Navigation between sections works with correct URLs
- Contact form submits to the API and creates a message
- Images load from S3 URLs
- TypeScript compiles without errors

## Next Step

Proceed to [Step 13 — Portfolio SEO](./13-portfolio-seo.md).
