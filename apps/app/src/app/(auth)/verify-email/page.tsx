import { Suspense } from "react";
import { VerifyEmailView } from "./verify-email-view";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <VerifyEmailView />
    </Suspense>
  );
}
