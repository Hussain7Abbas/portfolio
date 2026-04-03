"use client";

import {
  createDevPortAuthClient,
  type DevPortAuthClient,
} from "@devport/auth/client";

function dashboardOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3003";
}

export const authClient: DevPortAuthClient = createDevPortAuthClient(dashboardOrigin());
