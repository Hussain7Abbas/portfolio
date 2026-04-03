import { cookies } from "next/headers";

const dashboardOrigin = () =>
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3003";

export type ServerSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
} | null;

export async function getServerSession(): Promise<ServerSession> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const res = await fetch(`${dashboardOrigin()}/api/auth/get-session`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as ServerSession;
  if (!data?.user) return null;
  return data;
}

export async function fetchWithSession(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return fetch(`${dashboardOrigin()}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      cookie: cookieHeader,
    },
    cache: "no-store",
  });
}
