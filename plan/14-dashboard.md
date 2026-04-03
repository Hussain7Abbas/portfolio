# Step 14 — Admin Dashboard

## Goal

Build the `apps/dashboard` admin panel at `dashboard.iscoded.com`. Admins can view platform
stats, manage users, and view template information.

## Steps

### 14.1 — Initialize the app

```bash
cd apps/dashboard
bun add next@latest react@latest react-dom@latest
bun add @devport/ui @devport/auth
bun add -d @types/react @types/react-dom @devport/tsconfig @devport/tailwind-config
bun add -d typescript tailwindcss postcss autoprefixer tailwindcss-animate
```

### 14.2 — Auth setup

Same BetterAuth client pattern as `apps/app`, but middleware additionally checks for admin role.

**apps/dashboard/src/middleware.ts:**

```tsx
import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/sign-in"];

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
```

The admin role check happens at the page level via server-side session check:
```tsx
const session = await getSession();
if (session?.user.role !== "admin") {
  redirect("/sign-in");
}
```

### 14.3 — Pages

#### Sign In — `apps/dashboard/src/app/(auth)/sign-in/page.tsx`

Simple email/password login form (no sign-up — admins are created manually or via seed script).

#### Dashboard Layout — `apps/dashboard/src/app/(authenticated)/layout.tsx`

Sidebar with:
- DevPort logo
- Navigation: Overview, Users, Templates
- Admin name + logout

#### Overview — `apps/dashboard/src/app/(authenticated)/page.tsx`

Stat cards showing:
- Total users
- Total portfolios (profiles created)
- Total messages sent
- New users this week

Data from `GET /api/admin/overview`.

#### Users — `apps/dashboard/src/app/(authenticated)/users/page.tsx`

Table with columns:
- Name
- Email
- Username
- Role
- Joined date
- Actions (View, Delete)

Features:
- Search by name/email
- Pagination (20 per page)
- Click row to view detail

Data from `GET /api/admin/users?search=&page=&limit=`.

#### User Detail — `apps/dashboard/src/app/(authenticated)/users/[id]/page.tsx`

Shows:
- User info (name, email, role, joined date)
- Profile info (username, bio, template)
- Stats: project count, certificate count, message count
- Link to their live portfolio
- "Delete User" button with confirmation

Data from `GET /api/admin/users/:id`.

#### Templates — `apps/dashboard/src/app/(authenticated)/templates/page.tsx`

Read-only page listing available templates:
- Template name, slug, author, description
- Number of users using each template

This is informational — templates are managed via git contributions, not the dashboard.

### 14.4 — Admin seed script

**packages/db/src/seed.ts:**

Create an initial admin user:
```ts
import { prisma } from "./index";
import { auth } from "@devport/auth/server";

async function seed() {
  // Create admin user via BetterAuth
  // Or directly insert into DB with hashed password
  console.log("Admin user created");
}

seed();
```

Add to `packages/db/package.json`:
```json
{
  "scripts": {
    "db:seed": "bun run src/seed.ts"
  }
}
```

## File Structure

```
apps/dashboard/src/
├── app/
│   ├── layout.tsx
│   ├── (auth)/
│   │   └── sign-in/
│   │       └── page.tsx
│   └── (authenticated)/
│       ├── layout.tsx              # Sidebar + topbar
│       ├── page.tsx                # Overview
│       ├── users/
│       │   ├── page.tsx            # User list
│       │   └── [id]/
│       │       └── page.tsx        # User detail
│       └── templates/
│           └── page.tsx            # Template list
├── lib/
│   ├── auth-client.ts
│   ├── session.ts
│   └── api.ts
└── middleware.ts
```

## Key Notes

- Admin accounts cannot be created via the UI — use the seed script or directly modify the
  database. This is intentional for security.
- The dashboard uses the same backend API as the user app but hits `/api/admin/*` routes which
  require the `admin` role.
- Keep the dashboard simple — it's a management tool, not a feature-rich admin panel.
- No sign-up page — only sign-in.

## Verification

- `bun run dev` starts on port 3003
- Non-admin users get rejected
- Admin can log in and see the overview
- Users list loads with search and pagination
- Can view a user's detail page
- Can delete a user (with confirmation)
- Templates page shows the VS Code template
- TypeScript compiles without errors

## Next Step

Proceed to [Step 15 — Landing Page (Website App)](./15-website.md).
