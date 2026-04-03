import Link from "next/link";

export default function ForbiddenPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "28rem" }}>
      <h1 style={{ marginTop: 0 }}>Access denied</h1>
      <p style={{ color: "var(--muted)" }}>
        This area is for administrators. Your account does not have the admin role.
      </p>
      <p style={{ marginTop: "1.5rem" }}>
        <Link href={appUrl}>Go to the app</Link>
      </p>
    </main>
  );
}
