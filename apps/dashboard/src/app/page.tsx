import Link from "next/link";
import { fetchWithSession } from "@/lib/session";

export default async function Page() {
  const res = await fetchWithSession("/api/admin/overview");
  if (!res.ok) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>DevPort Dashboard</h1>
        <p style={{ color: "var(--error)" }}>Could not load overview ({res.status}).</p>
      </main>
    );
  }
  const data = (await res.json()) as {
    userCount: number;
    profileCount: number;
    messageCount: number;
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "40rem" }}>
      <nav style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/" style={{ fontWeight: 600 }}>
          Overview
        </Link>
        <Link href="/users">Users</Link>
      </nav>
      <h1 style={{ marginTop: 0 }}>DevPort Dashboard</h1>
      <p style={{ color: "var(--muted)" }}>Admin overview</p>
      <ul style={{ lineHeight: 1.8, marginTop: "1.25rem" }}>
        <li>Users: {data.userCount}</li>
        <li>Profiles: {data.profileCount}</li>
        <li>Contact messages: {data.messageCount}</li>
      </ul>
    </main>
  );
}
