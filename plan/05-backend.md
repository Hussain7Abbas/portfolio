# Step 5 — Backend API (Elysia)

## Goal

Build the Elysia backend at `apps/backend` with all REST API routes, BetterAuth handler mount,
auth middleware macro, and S3 upload support.

## Steps

### 5.1 — Install dependencies

```bash
cd apps/backend
bun add elysia @elysiajs/cors @elysiajs/static
bun add @devport/db @devport/auth
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
bun add -d bun-types @devport/tsconfig
```

### 5.2 — Entry point

**apps/backend/src/index.ts:**

```ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "@devport/auth/server";
import { profileRoutes } from "./routes/profile";
import { projectRoutes } from "./routes/projects";
import { certificateRoutes } from "./routes/certificates";
import { eventRoutes } from "./routes/events";
import { githubRoutes } from "./routes/github";
import { messageRoutes } from "./routes/messages";
import { seoRoutes } from "./routes/seo";
import { uploadRoutes } from "./routes/upload";
import { portfolioRoutes } from "./routes/portfolio";
import { adminRoutes } from "./routes/admin";

const app = new Elysia()
  .use(
    cors({
      origin: [
        process.env.NEXT_PUBLIC_APP_URL!,
        process.env.NEXT_PUBLIC_DASHBOARD_URL!,
        process.env.NEXT_PUBLIC_PORTFOLIO_URL!,
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:3003",
      ],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .mount("/api/auth", auth.handler)
  .use(profileRoutes)
  .use(projectRoutes)
  .use(certificateRoutes)
  .use(eventRoutes)
  .use(githubRoutes)
  .use(messageRoutes)
  .use(seoRoutes)
  .use(uploadRoutes)
  .use(portfolioRoutes)
  .use(adminRoutes)
  .listen(3001);

console.log(`Backend running at http://localhost:${app.server?.port}`);
```

### 5.3 — Auth middleware macro

**apps/backend/src/middleware/auth-macro.ts:**

Creates an Elysia plugin that resolves the current user/session from the request cookie and
optionally checks the role.

```ts
import { Elysia } from "elysia";
import { auth } from "@devport/auth/server";

export const authMacro = new Elysia({ name: "auth-macro" }).macro({
  auth: {
    async resolve({ request, status }) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return status(401, { error: "Unauthorized" });
      }

      return { user: session.user, session: session.session };
    },
  },
  adminAuth: {
    async resolve({ request, status }) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return status(401, { error: "Unauthorized" });
      }

      if (session.user.role !== "admin") {
        return status(403, { error: "Forbidden" });
      }

      return { user: session.user, session: session.session };
    },
  },
});
```

Usage in routes:
```ts
new Elysia()
  .use(authMacro)
  .get("/api/profile", ({ user }) => { ... }, { auth: true })
  .get("/api/admin/users", ({ user }) => { ... }, { adminAuth: true })
```

### 5.4 — Route files

Create the following route modules under `apps/backend/src/routes/`. Each is an Elysia plugin.

#### 5.4.1 — Profile routes (`routes/profile.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profile` | user | Get current user's profile |
| PUT | `/api/profile` | user | Update profile |
| POST | `/api/profile/username/check` | user | Check username availability |

#### 5.4.2 — Project routes (`routes/projects.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/projects` | user | List user's projects |
| POST | `/api/projects` | user | Create project |
| PUT | `/api/projects/:id` | user | Update project |
| DELETE | `/api/projects/:id` | user | Delete project |
| PUT | `/api/projects/reorder` | user | Reorder projects |

#### 5.4.3 — Certificate routes (`routes/certificates.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/certificates` | user | List user's certificates |
| POST | `/api/certificates` | user | Create certificate |
| PUT | `/api/certificates/:id` | user | Update certificate |
| DELETE | `/api/certificates/:id` | user | Delete certificate |

#### 5.4.4 — Event routes (`routes/events.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/events` | user | List user's events |
| POST | `/api/events` | user | Create event |
| PUT | `/api/events/:id` | user | Update event |
| DELETE | `/api/events/:id` | user | Delete event |

#### 5.4.5 — GitHub routes (`routes/github.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/github/config` | user | Get GitHub config |
| PUT | `/api/github/config` | user | Save GitHub username + selected repos |
| GET | `/api/github/repos/:username` | user | Proxy GitHub API — list user's repos |

#### 5.4.6 — Message routes (`routes/messages.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/messages` | user | List messages (with pagination, unread filter) |
| GET | `/api/messages/unread-count` | user | Get unread count |
| PUT | `/api/messages/:id/read` | user | Mark as read |
| DELETE | `/api/messages/:id` | user | Delete message |

#### 5.4.7 — SEO routes (`routes/seo.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/seo` | user | Get SEO meta |
| PUT | `/api/seo` | user | Update SEO meta |

#### 5.4.8 — Upload routes (`routes/upload.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload/presigned-url` | user | Generate S3 presigned upload URL |
| DELETE | `/api/upload` | user | Delete file from S3 |

#### 5.4.9 — Portfolio public routes (`routes/portfolio.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/portfolio/:username` | none | Full portfolio data for rendering |
| POST | `/api/portfolio/:username/contact` | none | Submit contact message to user |

The `GET /api/portfolio/:username` endpoint returns:
```ts
{
  profile: Profile;
  projects: Project[];
  certificates: Certificate[];
  events: Event[];
  githubConfig: GithubConfig | null;
  seoMeta: SEOMeta | null;
}
```

#### 5.4.10 — Admin routes (`routes/admin/index.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users` | admin | List all users (paginated, searchable) |
| GET | `/api/admin/users/:id` | admin | Get user detail |
| DELETE | `/api/admin/users/:id` | admin | Delete user |
| GET | `/api/admin/overview` | admin | Stats: user count, portfolio count, message count |

### 5.5 — S3 helper

**apps/backend/src/lib/s3.ts:**

```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });
  await s3.send(command);
}
```

### 5.6 — Verify the backend starts

```bash
cd apps/backend
bun run dev
# Should print: Backend running at http://localhost:3001
```

Test auth endpoint:
```bash
curl http://localhost:3001/api/auth/ok
# Should return { "ok": true }
```

## File Structure After This Step

```
apps/backend/
├── src/
│   ├── index.ts
│   ├── middleware/
│   │   └── auth-macro.ts
│   ├── routes/
│   │   ├── profile.ts
│   │   ├── projects.ts
│   │   ├── certificates.ts
│   │   ├── events.ts
│   │   ├── github.ts
│   │   ├── messages.ts
│   │   ├── seo.ts
│   │   ├── upload.ts
│   │   ├── portfolio.ts
│   │   └── admin/
│   │       └── index.ts
│   └── lib/
│       └── s3.ts
├── package.json
└── tsconfig.json
```

## Key Notes

- All protected routes use the `authMacro` to inject `user` into the handler context.
- Admin routes use `adminAuth` which additionally checks `user.role === "admin"`.
- Public routes (portfolio + contact) have no auth — they are consumed by the portfolio app
  and anyone visiting a portfolio.
- The backend does NOT serve HTML — it's purely a REST JSON API.
- CORS `credentials: true` is required for BetterAuth's cookie-based sessions.

## Verification

- `bun run dev` starts without errors
- `curl /api/auth/ok` returns `{ "ok": true }`
- All route modules load without import errors
- TypeScript compiles: `bun run typecheck`

## Next Step

Proceed to [Step 06 — Shared UI Package](./06-shared-ui.md).
