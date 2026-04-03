"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await authClient.signUp.email({
      name,
      email,
      password,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? "Sign up failed");
      return;
    }
    router.push("/verify-email");
    router.refresh();
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Create account</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
        Start building your DevPort profile
      </p>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
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
            minLength={8}
            autoComplete="new-password"
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
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--muted)" }}>
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </>
  );
}
