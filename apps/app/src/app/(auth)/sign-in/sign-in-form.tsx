"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (res.error) {
      if (res.error.code === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(res.error.message ?? "Sign in failed");
      return;
    }
    router.push(nextPath.startsWith("/") ? nextPath : "/");
    router.refresh();
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Sign in</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
        DevPort — manage your portfolio
      </p>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              padding: "0.5rem 0.65rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "var(--input-bg)",
              color: "var(--fg)",
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              padding: "0.5rem 0.65rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "var(--input-bg)",
              color: "var(--fg)",
            }}
          />
        </label>
        {error ? (
          <p role="alert" style={{ color: "var(--error)", fontSize: "0.9rem", margin: 0 }}>
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "0.25rem",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--muted)" }}>
        No account?{" "}
        <Link href="/sign-up">Create one</Link>
      </p>
    </>
  );
}
