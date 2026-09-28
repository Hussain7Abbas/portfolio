import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [emailOTPClient()],
  });
}

export type DevPortAuthClient = ReturnType<typeof createClient>;

export function createDevPortAuthClient(baseURL?: string): DevPortAuthClient {
  return createClient(baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");
}
