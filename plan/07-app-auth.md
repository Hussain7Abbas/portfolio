# Step 7 — User App: Auth Pages

## Goal

Set up the `apps/app` Next.js 15 application with authentication pages (sign-in, sign-up,
email verification) and route protection middleware.

## Steps

### 7.1 — Initialize Next.js 15 app

```bash
cd apps/app
bun add next@latest react@latest react-dom@latest
bun add @devport/ui @devport/auth @devport/db
bun add -d @types/react @types/react-dom @devport/tsconfig @devport/tailwind-config
bun add -d typescript tailwindcss postcss autoprefixer tailwindcss-animate
```

### 7.2 — Next.js config

**apps/app/next.config.ts:**
```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@devport/ui", "@devport/auth"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default config;
```

### 7.3 — App layout

**apps/app/src/app/layout.tsx:**
```tsx
import type { Metadata } from "next";
import { Toaster } from "@devport/ui";
import "@devport/ui/globals.css";

export const metadata: Metadata = {
  title: "DevPort",
  description: "Manage your developer portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### 7.4 — Auth client hook

**apps/app/src/lib/auth-client.ts:**
```ts
import { getAuthClient } from "@devport/auth/client";

export const authClient = getAuthClient(process.env.NEXT_PUBLIC_API_URL);
```

### 7.5 — Auth pages

#### Sign Up — `apps/app/src/app/(auth)/sign-up/page.tsx`

Form fields:
- Name (text)
- Email (email)
- Password (password, min 8 chars)
- Confirm Password

On submit: call `authClient.signUp.email({ name, email, password })`.
On success: redirect to `/verify-email` with a message to check inbox.
Link to sign-in page.

Social buttons:
- "Sign up with Google" → `authClient.signIn.social({ provider: "google" })`
- "Sign up with GitHub" → `authClient.signIn.social({ provider: "github" })`

#### Sign In — `apps/app/src/app/(auth)/sign-in/page.tsx`

Form fields:
- Email
- Password

On submit: call `authClient.signIn.email({ email, password })`.
On success: redirect to `/` (which goes to onboarding or dashboard).
Link to sign-up page.

Same social buttons as sign-up.

#### Verify Email — `apps/app/src/app/(auth)/verify-email/page.tsx`

- Message: "Check your email for a verification link."
- Button: "Resend verification email"
- Auto-detect `?token=` query param for callback handling.

#### Auth layout — `apps/app/src/app/(auth)/layout.tsx`

Centered card layout — no sidebar. Just a logo at top, form in the middle.

### 7.6 — Middleware for route protection

**apps/app/src/middleware.ts:**

```ts
import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/sign-in", "/sign-up", "/verify-email"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### 7.7 — Session helper for server components

**apps/app/src/lib/session.ts:**
```ts
import { auth } from "@devport/auth/server";
import { headers } from "next/headers";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
```

### 7.8 — Root page redirect

**apps/app/src/app/page.tsx:**

Check if user has a profile:
- If no profile → redirect to `/onboarding`
- If has profile → redirect to `/profile`

## File Structure

```
apps/app/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   └── ...
├── lib/
│   ├── auth-client.ts
│   └── session.ts
└── middleware.ts
```

## Key Notes

- The middleware only checks for cookie existence — actual session validation happens
  server-side when `getSession()` is called in server components.
- BetterAuth's cookie name defaults to `better-auth.session_token`. If changed in config, update
  the middleware.
- Social OAuth redirects go to the Elysia backend (api.iscoded.com), then back to the app. The
  `callbackURL` in social sign-in should point to `app.iscoded.com`.
- During development, Google/GitHub OAuth might not work without proper callback URLs configured.
  Focus on email/password first.

## Verification

- `bun run dev` starts the app on port 3000
- Visiting `http://localhost:3000` redirects to `/sign-in`
- Sign-up form submits to Elysia backend and creates a user in the database
- Sign-in with valid credentials sets session cookie and redirects to home
- Protected pages redirect to sign-in when no session
- TypeScript compiles: `bun run typecheck`

## Next Step

Proceed to [Step 08 — User App: Onboarding Wizard](./08-app-onboarding.md).
