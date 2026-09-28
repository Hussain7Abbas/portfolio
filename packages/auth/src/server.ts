import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@devport/db";
import { sendEmail } from "./email";

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

const OTP_EXPIRES_IN_S = 10 * 60;

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
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: OTP_EXPIRES_IN_S,
      // Replaces link-based verification: sign-up / sign-in send a code instead of a link.
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === "email-verification"
            ? "Your DevPort verification code"
            : type === "forget-password"
              ? "Your DevPort password reset code"
              : "Your DevPort sign-in code";
        const minutes = OTP_EXPIRES_IN_S / 60;
        await sendEmail({
          to: email,
          subject,
          text: `Your DevPort code is ${otp}. It expires in ${minutes} minutes.`,
          html: `<p>Your DevPort code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p><p>It expires in ${minutes} minutes. If you didn't request it, you can ignore this email.</p>`,
        });
      },
    }),
  ],
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
    process.env.APP_URL ?? "http://localhost:3000",
    process.env.DASHBOARD_URL ?? "http://localhost:3003",
    process.env.PORTFOLIO_URL ?? "http://localhost:3002",
    process.env.WEBSITE_URL ?? "http://localhost:3004",
  ],
});
