import type { Server } from "elysia/universal/server";

export function getClientIp(request: Request, server: Server | null): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  const socket = server?.requestIP(request);
  return socket?.address ?? "unknown";
}
