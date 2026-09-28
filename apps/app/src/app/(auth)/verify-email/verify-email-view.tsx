"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/loading-button";
import { authClient } from "@/lib/auth-client";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_S = 45;

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || otp.length !== OTP_LENGTH) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
      if (error) {
        setVerifyError(error.message ?? "Invalid or expired code.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setVerifyError("Could not verify the code. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    if (!email || cooldown > 0) return;
    setResendState("sending");
    setResendError(null);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) {
        setResendState("error");
        setResendError(error.message ?? "Could not send a new code. Try again.");
        return;
      }
      setResendState("sent");
      setCooldown(RESEND_COOLDOWN_S);
    } catch {
      setResendState("error");
      setResendError("Could not send a new code. Try again.");
    }
  }

  return (
    <>
      <h1 className="mb-2 text-2xl">Check your email</h1>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        We sent a {OTP_LENGTH}-digit verification code{email ? ` to ${email}` : ""}. Enter it
        below to activate your account.
      </p>

      <form onSubmit={verify} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
            required
            className="text-center text-lg tracking-[0.5em]"
          />
        </div>
        {verifyError ? (
          <p role="alert" className="m-0 text-sm text-destructive">
            {verifyError}
          </p>
        ) : null}
        <LoadingButton
          type="submit"
          loading={verifying}
          disabled={!email || otp.length !== OTP_LENGTH}
        >
          {verifying ? "Verifying…" : "Verify email"}
        </LoadingButton>
      </form>

      <div className="mt-3 flex flex-col gap-2">
        <LoadingButton
          type="button"
          variant="outline"
          onClick={() => void resend()}
          disabled={!email || cooldown > 0}
          loading={resendState === "sending"}
        >
          {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
        </LoadingButton>
        {resendState === "sent" ? (
          <p className="m-0 text-sm text-green-600 dark:text-green-400">A new code is on its way.</p>
        ) : null}
        {resendState === "error" && resendError ? (
          <p role="alert" className="m-0 text-sm text-destructive">
            {resendError}
          </p>
        ) : null}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Wrong account? <Link href="/sign-in">Sign in</Link> with a different email.
      </p>
    </>
  );
}
