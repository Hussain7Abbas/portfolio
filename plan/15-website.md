# Step 15 — Landing Page (Website App)

## Goal

Build the `apps/website` landing page at `iscoded.com` — a marketing site for DevPort that
explains the product and links to `app.iscoded.com` for sign-up.

## Steps

### 15.1 — Initialize the app

```bash
cd apps/website
bun add next@latest react@latest react-dom@latest
bun add @devport/ui
bun add framer-motion
bun add -d @types/react @types/react-dom @devport/tsconfig @devport/tailwind-config
bun add -d typescript tailwindcss postcss autoprefixer tailwindcss-animate
```

### 15.2 — Pages

The website is fully static — no auth, no API calls (except maybe a user count for social proof).

#### Home Page — `apps/website/src/app/page.tsx`

Sections:

1. **Hero**
   - Headline: "Build Your Developer Portfolio in Minutes"
   - Subheadline: "Free, open-source portfolio platform. Create an account, add your projects, pick a template, and share your portfolio with the world."
   - CTA buttons: "Get Started" → `app.iscoded.com/sign-up`, "View on GitHub" → repo URL
   - Illustration or screenshot of a portfolio

2. **Features**
   - Multiple templates (community-contributed)
   - Easy project/certificate/event management
   - GitHub integration
   - SEO optimized
   - Contact form with in-app inbox
   - Free forever, open-source

3. **How It Works**
   - Step 1: Create an account
   - Step 2: Fill in your portfolio data
   - Step 3: Choose a template
   - Step 4: Share your portfolio URL

4. **Templates Showcase**
   - Screenshot of the VS Code template
   - "More templates coming soon — contribute yours!"

5. **Open Source CTA**
   - "DevPort is free and open-source"
   - GitHub stars badge
   - "Contribute a template" link

6. **Footer**
   - Links: GitHub, About, Contact
   - "Built with Next.js, Elysia, and PostgreSQL"

#### Layout — `apps/website/src/app/layout.tsx`

- Navbar: DevPort logo, Home, Features, GitHub link, "Get Started" button
- Footer (see above)

### 15.3 — Static optimization

Since the website is fully static:

**apps/website/next.config.ts:**
```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  transpilePackages: ["@devport/ui"],
  images: {
    unoptimized: true,
  },
};

export default config;
```

Using `output: "export"` generates a fully static site that can be served from any static
host or nginx.

### 15.4 — SEO

**apps/website/src/app/layout.tsx:**
```tsx
export const metadata: Metadata = {
  title: "DevPort — Free Developer Portfolio Platform",
  description: "Create your developer portfolio in minutes. Free, open-source, and customizable with community templates.",
  openGraph: {
    title: "DevPort — Free Developer Portfolio Platform",
    description: "Create your developer portfolio in minutes.",
    url: "https://iscoded.com",
    siteName: "DevPort",
    type: "website",
  },
};
```

## File Structure

```
apps/website/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── navbar.tsx
│   ├── hero.tsx
│   ├── features.tsx
│   ├── how-it-works.tsx
│   ├── templates-showcase.tsx
│   ├── open-source-cta.tsx
│   └── footer.tsx
```

## Key Notes

- The website is the simplest app — static HTML, no backend, no auth.
- Use `output: "export"` so it builds to static files for easy nginx serving.
- Design should be clean, modern, and developer-focused.
- All CTAs link to `app.iscoded.com` for sign-up.
- The website can be served from the same VPS as nginx handles the routing.

## Verification

- `bun run build` produces static output in `out/`
- `bun run dev` starts on port 3004
- All sections render correctly
- CTA links point to `app.iscoded.com/sign-up`
- GitHub link works
- Mobile responsive
- TypeScript compiles without errors

## Next Step

Proceed to [Step 16 — Production Docker & Nginx](./16-docker-prod.md).
