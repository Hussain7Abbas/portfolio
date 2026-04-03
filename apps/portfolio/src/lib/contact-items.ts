type Profile = {
  emailPublic: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
};

export function contactItemsFromProfile(profile: Profile) {
  const items: { social: string; link: string; href: string }[] = [];
  if (profile.emailPublic) {
    items.push({
      social: "email",
      link: profile.emailPublic,
      href: `mailto:${profile.emailPublic}`,
    });
  }
  if (profile.githubUrl) {
    items.push({
      social: "github",
      link: profile.githubUrl.replace(/^https?:\/\//, ""),
      href: profile.githubUrl,
    });
  }
  if (profile.linkedinUrl) {
    items.push({
      social: "linkedin",
      link: profile.linkedinUrl.replace(/^https?:\/\//, ""),
      href: profile.linkedinUrl,
    });
  }
  if (profile.twitterUrl) {
    items.push({
      social: "twitter",
      link: profile.twitterUrl.replace(/^https?:\/\//, ""),
      href: profile.twitterUrl,
    });
  }
  if (profile.websiteUrl) {
    items.push({
      social: "website",
      link: profile.websiteUrl.replace(/^https?:\/\//, ""),
      href: profile.websiteUrl,
    });
  }
  return items;
}
