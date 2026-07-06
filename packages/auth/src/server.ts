import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@devport/db";

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    : undefined;

const github =
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }
    : undefined;

const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    async sendVerificationEmail({ user, url }) {
      // Make sure the link always points at the app origin (which proxies /api to the backend),
      // regardless of how BETTER_AUTH_URL is configured, so the session cookie set on
      // verification is scoped to the domain the app's own fetches use.
      const [, query] = url.split("?");
      const verifyUrl = query ? `${appOrigin}/api/auth/verify-email?${query}` : url;
      // TODO(production): wire up a real transactional email provider (Resend, SES, Postmark...).
      // For now this logs the link so it can be copied during local development / MVP testing.
      console.log(`[devport] Verification email for ${user.email}: ${verifyUrl}`);
    },
  },
  socialProviders: {
    ...(google ? { google } : {}),
    ...(github ? { github } : {}),
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
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3003",
    process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3002",
    process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3004",
  ],
});
