import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchWithSession, getServerSession } from "@/lib/session";
import { AppHeader } from "./app-header";

const nav = [
  { href: "/profile", label: "Profile" },
  { href: "/projects", label: "Projects" },
  { href: "/certificates", label: "Certificates" },
  { href: "/events", label: "Events" },
  { href: "/github", label: "GitHub" },
  { href: "/messages", label: "Messages" },
  { href: "/seo", label: "SEO" },
  { href: "/settings", label: "Settings" },
];

export default async function AppShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }
  const profileRes = await fetchWithSession("/api/profile");
  const profileData = profileRes.ok
    ? ((await profileRes.json()) as { profile: unknown | null })
    : { profile: null };
  if (!profileData.profile) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-52 shrink-0 flex-col gap-1 border-r border-border px-3 py-4">
        <div className="mb-3 pl-2 text-[0.95rem] font-bold">DevPort</div>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-2 py-1.5 text-sm text-foreground no-underline hover:bg-muted"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 px-8 py-6">
        <AppHeader />
        {children}
      </main>
    </div>
  );
}
