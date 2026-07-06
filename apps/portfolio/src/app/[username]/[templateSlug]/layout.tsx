import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioByUsername } from "@/lib/get-portfolio";
import { getTemplateDefinition } from "@/templates/registry";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string; templateSlug: string }>;
}

function portfolioBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3002";
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);

  if (!data || data.profile.activeTemplate !== templateSlug) {
    return { title: "Portfolio not found" };
  }

  const seo = data.seoMeta;
  const profile = data.profile;
  const title =
    seo?.title ??
    `${profile.displayName} — ${profile.title ?? "Developer portfolio"}`;
  const description =
    seo?.description ??
    profile.bio ??
    `${profile.displayName}'s developer portfolio`;
  const canonicalPath = `/${profile.username}/${templateSlug}`;
  const base = portfolioBaseUrl();
  const ogImages: NonNullable<Metadata["openGraph"]>["images"] = [];
  if (seo?.ogImage) {
    ogImages.push({ url: seo.ogImage, width: 1200, height: 630 });
  } else if (profile.photoUrl) {
    ogImages.push({ url: profile.photoUrl });
  }

  const keywords =
    seo?.keywords
      ?.split(",")
      .map((k) => k.trim())
      .filter(Boolean) ?? undefined;

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    authors: [{ name: profile.displayName }],
    alternates: {
      canonical: `${base}${canonicalPath}`,
    },
    openGraph: {
      title,
      description,
      url: `${base}${canonicalPath}`,
      siteName: "DevPort",
      type: "website",
      images: ogImages.length ? ogImages : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PortfolioTemplateLayout({
  children,
  params,
}: LayoutProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);
  const def = getTemplateDefinition(templateSlug);

  if (!data || data.profile.activeTemplate !== templateSlug || !def) {
    notFound();
  }

  const base = portfolioBaseUrl();
  const path = `/${data.profile.username}/${templateSlug}`;
  const sameAs = [
    data.profile.githubUrl,
    data.profile.linkedinUrl,
    data.profile.twitterUrl,
    data.profile.websiteUrl,
  ].filter((url): url is string => Boolean(url));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.profile.displayName,
    description: data.profile.bio ?? undefined,
    url: `${base}${path}`,
    image: data.profile.photoUrl ?? data.seoMeta?.ogImage ?? undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const Shell = def.shell;
  const shell = Shell ? (
    <Shell base={path} titlebarTitle={`${data.profile.displayName} - Visual Studio Code`}>
      {children}
    </Shell>
  ) : (
    children
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {shell}
    </>
  );
}
