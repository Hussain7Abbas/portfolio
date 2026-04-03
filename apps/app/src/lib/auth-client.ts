"use client";

import {
  createDevPortAuthClient,
  type DevPortAuthClient,
} from "@devport/auth/client";

function appOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const authClient: DevPortAuthClient = createDevPortAuthClient(appOrigin());
