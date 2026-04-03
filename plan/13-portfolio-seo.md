# Step 13 — Portfolio SEO

## Goal

Implement dynamic SEO metadata, sitemap generation, and robots.txt for the portfolio app so that
each user's portfolio is properly indexed by search engines.

## Steps

### 13.1 — Dynamic metadata via generateMetadata

**apps/portfolio/src/app/[username]/[templateSlug]/layout.tsx:**

Use Next.js 15's `generateMetadata` to set per-user SEO tags:

```tsx
import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/api";

interface LayoutProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getPortfolioData(username);

  if (!data) {
    return { title: "Portfolio Not Found" };
  }

  const seo = data.seoMeta;
  const profile = data.profile;

  const title = seo?.title ?? `${profile.displayName} — ${profile.title ?? "Developer Portfolio"}`;
  const description = seo?.description ?? profile.bio ?? `${profile.displayName}'s developer portfolio`;

  return {
    title,
    description,
    keywords: seo?.keywords ?? undefined,
    authors: [{ name: profile.displayName }],
    openGraph: {
      title,
      description,
      url: `https://portfolio.iscoded.com/${username}`,
      siteName: "DevPort",
      type: "website",
      images: seo?.ogImage
        ? [{ url: seo.ogImage, width: 1200, height: 630 }]
        : profile.photoUrl
          ? [{ url: profile.photoUrl }]
          : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
```

### 13.2 — Per-section metadata

**apps/portfolio/src/app/[username]/[templateSlug]/[...section]/page.tsx:**

Override metadata per section (optional enhancement):

```tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, section } = await params;
  const data = await getPortfolioData(username);

  if (!data) return {};

  const sectionName = section[0];
  const baseTitle = data.seoMeta?.title ?? data.profile.displayName;

  const sectionTitles: Record<string, string> = {
    about: "About",
    projects: "Projects",
    certificates: "Certificates",
    github: "GitHub",
    contact: "Contact",
    settings: "Settings",
  };

  return {
    title: `${sectionTitles[sectionName] ?? sectionName} — ${baseTitle}`,
  };
}
```

### 13.3 — Sitemap

**apps/portfolio/src/app/sitemap.ts:**

Dynamically generates a sitemap listing all public portfolios:

```tsx
import type { MetadataRoute } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all profiles from the API
  const res = await fetch(`${API_URL}/api/portfolio/sitemap`);
  const profiles: Array<{ username: string; activeTemplate: string; updatedAt: string }> = await res.json();

  const baseUrl = "https://portfolio.iscoded.com";
  const sections = ["", "about", "projects", "certificates", "github", "contact"];

  const entries: MetadataRoute.Sitemap = [];

  for (const profile of profiles) {
    for (const section of sections) {
      const path = section
        ? `/${profile.username}/${profile.activeTemplate}/${section}`
        : `/${profile.username}/${profile.activeTemplate}`;

      entries.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(profile.updatedAt),
        changeFrequency: "weekly",
        priority: section === "" ? 1.0 : 0.7,
      });
    }
  }

  return entries;
}
```

### 13.4 — Backend sitemap endpoint

Add to `apps/backend/src/routes/portfolio.ts`:

```
GET /api/portfolio/sitemap
  Auth: none
  Response: Array<{ username: string, activeTemplate: string, updatedAt: string }>

  Returns all profiles that have a username set (i.e., completed onboarding).
```

### 13.5 — Robots.txt

**apps/portfolio/src/app/robots.ts:**

```tsx
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://portfolio.iscoded.com/sitemap.xml",
  };
}
```

### 13.6 — Canonical URLs

Add canonical URL to metadata in the layout:

```tsx
return {
  // ... other metadata
  alternates: {
    canonical: `https://portfolio.iscoded.com/${username}/${templateSlug}`,
  },
};
```

### 13.7 — Structured data (JSON-LD)

Add a JSON-LD script for rich search results:

**apps/portfolio/src/app/[username]/[templateSlug]/layout.tsx:**

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.displayName,
      jobTitle: profile.title,
      description: profile.bio,
      url: `https://portfolio.iscoded.com/${username}`,
      image: profile.photoUrl,
      sameAs: [
        profile.githubUrl,
        profile.linkedinUrl,
        profile.twitterUrl,
        profile.websiteUrl,
      ].filter(Boolean),
    }),
  }}
/>
```

## Key Notes

- `generateMetadata` is async and runs on the server — it can fetch data.
- Sitemap can grow large with many users. If >50,000 entries, implement sitemap index
  splitting (multiple sitemap files).
- ISR with `revalidate: 60` means metadata is cached for 60 seconds.
- OG images uploaded via the SEO settings page are served from S3.
- If a user hasn't set SEO meta, sensible defaults are derived from their profile data.

## Verification

- View page source of a portfolio → meta tags are correct
- Visit `/sitemap.xml` → lists all portfolios
- Visit `/robots.txt` → correct content
- Share a portfolio link on social media → OG preview shows correctly
- Google's Rich Results Test shows valid structured data

## Next Step

Proceed to [Step 14 — Admin Dashboard](./14-dashboard.md).
