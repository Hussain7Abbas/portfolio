import { redirect } from "next/navigation";
import { fetchWithSession } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const res = await fetchWithSession("/api/profile");
  if (!res.ok) {
    redirect("/sign-in");
  }
  const data = (await res.json()) as {
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
    } | null;
  };

  if (!data.profile) {
    redirect("/onboarding");
  }

  const portfolioBase =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3002";
  const p = data.profile;

  return (
    <div>
      <p className="mb-4 text-muted-foreground">
        Public portfolio:{" "}
        <a
          href={`${portfolioBase}/${p.username}/${p.activeTemplate}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          {portfolioBase.replace(/^https?:\/\//, "")}/{p.username}/{p.activeTemplate}
        </a>
      </p>
      <ProfileForm initial={p} />
    </div>
  );
}
