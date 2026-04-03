import { cookies } from "next/headers";

const appOrigin = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type ServerSession = {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
} | null;

export async function getServerSession(): Promise<ServerSession> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const res = await fetch(`${appOrigin()}/api/auth/get-session`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as ServerSession;
  if (!data?.user) {
    return null;
  }
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
  return fetch(`${appOrigin()}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      cookie: cookieHeader,
    },
    cache: "no-store",
  });
}
