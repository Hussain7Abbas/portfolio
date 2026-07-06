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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "30rem" }}>{children}</div>
    </div>
  );
}
