# User portal (`apps/app`)

[← Apps](Intro.md)

A Next.js 15 App Router application (port 3000, `standalone` output) where users manage their portfolio. Rules: [apps/app/AGENTS.md](../../apps/app/AGENTS.md).

## Flow

1. **Sign up / sign in** (`(auth)/sign-up`, `(auth)/sign-in`) through the Better Auth React client. Email/password accounts must verify their email before they get in: `(auth)/verify-email` takes the 6-digit code sent by email (`authClient.emailOtp.verifyEmail`) and can resend it. Without Resend configured, the code is printed in the backend console.
2. **Onboarding** (`/onboarding`) is a guided wizard that creates the `Profile` (username, display name, template, …).
3. **Portal sections** under `(app)/`:
   - `profile`: bio, links, photo, and resume uploads.
   - `projects`, `certificates`, `events`: ordered CRUD lists with image uploads.
   - `github`: choose a GitHub username and select repositories.
   - `messages`: the inbox for contact-form submissions, with unread count.
   - `seo`: title, description, OG image, and keywords.
   - `settings`: active template and the published toggle.

`src/middleware.ts` protects every route except the auth pages. It checks the session through `/api/auth/get-session` and sends users to sign-in or email verification as needed.

## Data access

- Client components call `apiJson<T>(path, init)` from `src/lib/client-fetch.ts`. It sends cookies, sets a JSON content type, and throws `ApiError` with the backend's `{ error }` message.
- Server components use `getServerSession()` and `fetchWithSession()` from `src/lib/session.ts`. These forward the request cookies to `NEXT_PUBLIC_APP_URL`, which the rewrite sends on to the backend.
- `src/components/file-upload.tsx` requests a presigned URL from `/api/upload/presigned-url` and PUTs the file directly to Hetzner Object Storage.

## UI

Tailwind 3 with the shared preset, CSS variables in `src/app/globals.css`, `next-themes`, `sonner` toasts, and the shared primitives from `packages/ui` (see [Packages → @devport/ui](../packages.md#devportui)).
