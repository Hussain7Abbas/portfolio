# Step 3 — Database Package (Prisma + Docker PostgreSQL)

## Goal

Create the `@devport/db` package with the full Prisma schema, set up Docker Compose with
PostgreSQL for local development, and run the initial migration.

## Steps

### 3.1 — Docker Compose for local PostgreSQL

**docker/docker-compose.yml:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: devport
      POSTGRES_USER: devport
      POSTGRES_PASSWORD: devport
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devport"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

Start it:
```bash
docker compose -f docker/docker-compose.yml up -d
```

### 3.2 — Create root .env

```env
DATABASE_URL="postgresql://devport:devport@localhost:5432/devport"
```

### 3.3 — Install Prisma in packages/db

```bash
cd packages/db
bun add prisma @prisma/client
```

### 3.4 — Create Prisma schema

**packages/db/prisma/schema.prisma:**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── BetterAuth-managed tables ───────────────────────────
// These table shapes are dictated by BetterAuth's Prisma adapter.
// Do NOT rename columns — BetterAuth reads/writes them directly.

model User {
  id            String   @id
  name          String
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  role          String   @default("user")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  sessions     Session[]
  accounts     Account[]
  profile      Profile?
  projects     Project[]
  certificates Certificate[]
  events       Event[]
  githubConfig GithubConfig?
  messages     ContactMessage[]
  seoMeta      SEOMeta?
}

model Session {
  id        String   @id
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                    String    @id
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ─── Application tables ──────────────────────────────────

model Profile {
  id             String  @id @default(cuid())
  userId         String  @unique
  username       String  @unique
  displayName    String
  title          String?
  bio            String? @db.Text
  photoUrl       String?
  resumeUrl      String?
  githubUrl      String?
  linkedinUrl    String?
  twitterUrl     String?
  websiteUrl     String?
  emailPublic    String?
  activeTemplate String  @default("vscode")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([username])
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  name        String
  image       String?
  description String?  @db.Text
  tags        String[]
  demoUrl     String?
  sourceUrl   String?
  order       Int      @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model Certificate {
  id          String  @id @default(cuid())
  userId      String
  name        String
  image       String?
  description String? @db.Text
  url         String?
  order       Int     @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model Event {
  id          String  @id @default(cuid())
  userId      String
  name        String
  image       String?
  description String? @db.Text
  url         String?
  order       Int     @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model GithubConfig {
  id             String   @id @default(cuid())
  userId         String   @unique
  githubUsername String
  selectedRepos  String[]

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ContactMessage {
  id      String  @id @default(cuid())
  userId  String
  name    String
  email   String
  subject String
  message String  @db.Text
  read    Boolean @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId, read])
}

model SEOMeta {
  id          String  @id @default(cuid())
  userId      String  @unique
  title       String?
  description String? @db.Text
  ogImage     String?
  keywords    String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3.5 — Create Prisma client singleton

**packages/db/src/index.ts:**
```ts
import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "../generated/prisma";
export type { PrismaClient } from "../generated/prisma";
```

### 3.6 — Generate client and run migration

```bash
cd packages/db
bunx prisma generate
bunx prisma migrate dev --name init
```

### 3.7 — Verify from root

```bash
# From monorepo root
bun run db:generate
bun run db:studio   # Opens Prisma Studio — verify all tables exist
```

## Key Notes

- The `generated/` folder is gitignored. Every developer runs `db:generate` after clone.
- `turbo.json` has `db:generate` with `cache: false` — it always runs.
- `dev` and `build` tasks `dependsOn: ["^db:generate"]` so the client is always fresh.
- BetterAuth tables (User, Session, Account, Verification) follow BetterAuth's expected column
  names. If BetterAuth's schema changes, update these models to match.

## Verification

- `docker compose -f docker/docker-compose.yml ps` shows postgres running
- `bunx prisma studio` opens and shows all 10 tables
- Importing `import { prisma } from "@devport/db"` resolves in other packages

## Next Step

Proceed to [Step 04 — Auth Package (BetterAuth)](./04-auth.md).
