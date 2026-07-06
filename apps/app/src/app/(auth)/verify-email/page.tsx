import { Suspense } from "react";
import { VerifyEmailView } from "./verify-email-view";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p style={{ color: "var(--muted)" }}>Loading…</p>}>
      <VerifyEmailView />
    </Suspense>
  );
}
