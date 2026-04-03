"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AppHeader() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "1rem",
      }}
    >
      <button
        type="button"
        onClick={() => void signOut()}
        style={{
          padding: "0.35rem 0.65rem",
          fontSize: "0.85rem",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--muted)",
        }}
      >
        Sign out
      </button>
    </div>
  );
}
