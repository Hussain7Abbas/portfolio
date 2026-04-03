import { redirect } from "next/navigation";
import { fetchWithSession, getServerSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const res = await fetchWithSession("/api/profile");
  if (!res.ok) {
    redirect("/onboarding");
  }
  const data = (await res.json()) as { profile: unknown };
  if (!data.profile) {
    redirect("/onboarding");
  }
  redirect("/profile");
}
