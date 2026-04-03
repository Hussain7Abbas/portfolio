# Step 4 — Auth Package (BetterAuth)

## Goal

Create the `@devport/auth` package with BetterAuth server and client configurations. This package
is consumed by `apps/backend` (server-side auth handler) and `apps/app` + `apps/dashboard`
(client-side auth).

## Steps

### 4.1 — Install BetterAuth

```bash
cd packages/auth
bun add better-auth
```

### 4.2 — Server config

**packages/auth/src/server.ts:**

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@devport/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh every 24h
  },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL!,            // app.iscoded.com
    process.env.NEXT_PUBLIC_DASHBOARD_URL!,       // dashboard.iscoded.com
    process.env.NEXT_PUBLIC_PORTFOLIO_URL!,        // portfolio.iscoded.com
    "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:3003",
  ],
});

export type Auth = typeof auth;
```

### 4.3 — Client config

**packages/auth/src/client.ts:**

```ts
import { createAuthClient } from "better-auth/react";

export function getAuthClient(baseURL?: string) {
  return createAuthClient({
    baseURL: baseURL ?? process.env.NEXT_PUBLIC_API_URL!,
  });
}

export type AuthClient = ReturnType<typeof getAuthClient>;
```

### 4.4 — Update package.json exports

**packages/auth/package.json** should already have:
```json
{
  "exports": {
    "./server": "./src/server.ts",
    "./client": "./src/client.ts"
  }
}
```

Also add `@devport/db` as a dependency:
```json
{
  "dependencies": {
    "better-auth": "latest",
    "@devport/db": "*"
  }
}
```

### 4.5 — Environment variables required

Add to your `.env`:
```env
BETTER_AUTH_SECRET="generate-a-random-32-char-string-here"
BETTER_AUTH_URL="http://localhost:3001"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DASHBOARD_URL="http://localhost:3003"
NEXT_PUBLIC_PORTFOLIO_URL="http://localhost:3002"
```

## Auth Flow Summary

```
┌─────────────┐     POST /api/auth/sign-up      ┌──────────────┐
│  Browser     │ ──────────────────────────────►  │  Elysia      │
│  (Next.js)   │                                  │  Backend     │
│              │  ◄── Set-Cookie: session ──────  │              │
│              │                                  │  auth.handler│
│              │     GET /api/auth/get-session     │              │
│              │ ──────────────────────────────►  │              │
│              │  ◄── { user, session } ────────  │              │
└─────────────┘                                  └──────┬───────┘
                                                        │
                                                        ▼
                                                 ┌──────────────┐
                                                 │  PostgreSQL   │
                                                 └──────────────┘
```

- **Sign up**: Browser → Elysia `POST /api/auth/sign-up/email` → creates User + Account + sends
  verification email → sets session cookie.
- **Sign in**: Browser → Elysia `POST /api/auth/sign-in/email` → validates credentials → sets
  session cookie.
- **Session check**: Browser → Elysia `GET /api/auth/get-session` (with cookie) → returns user
  data.
- **Social login**: Browser redirected to Google/GitHub → callback to Elysia → creates/links
  Account → sets session cookie → redirects to app.

## Key Notes

- BetterAuth manages the `User`, `Session`, `Account`, `Verification` tables directly. It reads
  and writes those columns, so their Prisma model shape must match BetterAuth's expectations.
- The `role` field is added as `additionalFields` so BetterAuth writes it to the User table on
  signup. Default is `"user"`. Admin users are created manually or via a seed script.
- `trustedOrigins` must include all frontend origins that will send auth requests. CORS on the
  Elysia side must match.
- Email verification is required. BetterAuth handles sending verification emails — you may need to
  configure an email provider (SMTP, Resend, etc.) or handle it via a plugin. For MVP, use
  console logging and manually verify.

## Verification

- Importing `import { auth } from "@devport/auth/server"` works in the backend app
- Importing `import { getAuthClient } from "@devport/auth/client"` works in Next.js apps
- TypeScript compiles without errors

## Next Step

Proceed to [Step 05 — Backend API (Elysia)](./05-backend.md).
