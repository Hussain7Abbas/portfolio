import { createAuthClient } from "better-auth/react";

export type DevPortAuthClient = ReturnType<typeof createAuthClient>;

export function createDevPortAuthClient(baseURL?: string): DevPortAuthClient {
  return createAuthClient({
    baseURL: baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  });
}
