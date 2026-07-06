"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@devport/ui";
import { authClient } from "@/lib/auth-client";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_S = 45;

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  useEffect(() => {
    const startedAt = Date.now();
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const { data } = await authClient.getSession();
        if (data?.user?.emailVerified) {
          cancelled = true;
          setVerified(true);
          router.push("/");
          router.refresh();
          return;
        }
      } catch {
        /* ignore transient network errors while polling */
      }
      if (!cancelled && Date.now() - startedAt < POLL_TIMEOUT_MS) {
        setTimeout(() => void poll(), POLL_INTERVAL_MS);
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function resend() {
    if (!email || cooldown > 0) return;
    setResendState("sending");
    setResendError(null);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/`,
      });
      if (error) {
        setResendState("error");
        setResendError(error.message ?? "Could not resend the email. Try again.");
        return;
      }
      setResendState("sent");
      setCooldown(RESEND_COOLDOWN_S);
    } catch {
      setResendState("error");
      setResendError("Could not resend the email. Try again.");
    }
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Check your email</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.5 }}>
        {verified ? (
          "Email verified! Redirecting…"
        ) : (
          <>
            We sent a verification link{email ? ` to ${email}` : ""}. Click it to activate your
            account — this page will update automatically once you do.
          </>
        )}
      </p>

      {!verified ? (
        <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void resend()}
            disabled={!email}
            loading={resendState === "sending"}
          >
            {cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
          </Button>
          {resendState === "sent" ? (
            <p style={{ color: "var(--success)", fontSize: "0.85rem", margin: 0 }}>
              Verification email sent.
            </p>
          ) : null}
          {resendState === "error" && resendError ? (
            <p role="alert" style={{ color: "var(--error)", fontSize: "0.85rem", margin: 0 }}>
              {resendError}
            </p>
          ) : null}
        </div>
      ) : null}

      <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--muted)" }}>
        Wrong account? <Link href="/sign-in">Sign in</Link> with a different email.
      </p>
    </>
  );
}
