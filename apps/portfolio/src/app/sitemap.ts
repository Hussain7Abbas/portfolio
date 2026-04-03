import type { MetadataRoute } from "next";

const defaultApi = "http://127.0.0.1:3001";

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
    entries.push({
      url: `${baseUrl}/${p.username}/${p.activeTemplate}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  return entries;
}
