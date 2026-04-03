import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPrefixes = ["/sign-in", "/sign-up", "/verify-email"];

function isPublicPath(pathname: string): boolean {
  return publicPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionRes = await fetch(
    new URL("/api/auth/get-session", request.nextUrl.origin),
    {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  let hasUser = false;
  if (sessionRes.ok) {
    const data = (await sessionRes.json()) as { user?: { id: string } };
    hasUser = Boolean(data?.user);
  }

  if (!hasUser) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
