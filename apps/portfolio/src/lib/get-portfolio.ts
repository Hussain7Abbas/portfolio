import { cache } from "react";

const defaultApi = "http://127.0.0.1:3001";

async function fetchPortfolioByUsername(username: string) {
  const base = process.env.API_URL ?? defaultApi;
  const res = await fetch(`${base}/api/portfolio/${encodeURIComponent(username)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<PortfolioPayload>;
}

export type SeoMetaPayload = {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  keywords: string | null;
};

export type PortfolioPayload = {
  profile: {
    id: string;
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
  projects: unknown[];
  certificates: unknown[];
  events: unknown[];
  githubConfig: unknown;
  seoMeta: SeoMetaPayload | null;
};

export const getPortfolioByUsername = cache(fetchPortfolioByUsername);
