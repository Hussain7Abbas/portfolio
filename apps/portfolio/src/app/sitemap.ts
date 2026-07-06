import type { MetadataRoute } from "next";
import { templateSupportsPage, type TemplateSubPage } from "@/templates/registry";

const defaultApi = "http://127.0.0.1:3001";

const SUB_PAGES: TemplateSubPage[] = [
  "about",
  "projects",
  "certificates",
  "github",
  "contact",
];

type SitemapApiResponse = {
  profiles: Array<{
    username: string;
    activeTemplate: string;
    updatedAt: string;
  }>;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apiUrl = process.env.API_URL ?? defaultApi;
  const baseUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3002";

  let profiles: SitemapApiResponse["profiles"] = [];
  try {
    const res = await fetch(`${apiUrl}/api/portfolio/sitemap`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const body = (await res.json()) as SitemapApiResponse;
      profiles = body.profiles ?? [];
    }
  } catch {
    profiles = [];
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const p of profiles) {
    const lastModified = new Date(p.updatedAt);
    const base = `${baseUrl}/${p.username}/${p.activeTemplate}`;
    entries.push({
      url: base,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    });
    for (const page of SUB_PAGES) {
      if (!templateSupportsPage(p.activeTemplate, page)) continue;
      entries.push({
        url: `${base}/${page}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
