import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Check your email</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.5 }}>
        We sent a verification link. After you verify, you can{" "}
        <Link href="/sign-in">sign in</Link>.
      </p>
    </>
  );
}
