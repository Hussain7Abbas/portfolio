import { redirect } from "next/navigation";
import { fetchWithSession, getServerSession } from "@/lib/session";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in?next=/onboarding");
  }
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  const res = await fetchWithSession("/api/profile");
  if (res.ok) {
    const data = (await res.json()) as { profile: unknown | null };
    if (data.profile) {
      redirect("/profile");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[30rem]">{children}</div>
    </div>
  );
}
