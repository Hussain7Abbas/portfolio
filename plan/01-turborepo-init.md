# Step 1 — Initialize Turborepo Monorepo

## Goal

Set up the Turborepo monorepo skeleton with Bun workspaces. After this step you have a working
`turbo dev` that starts all (currently empty) apps.

## Prerequisites

- Bun installed globally (`bun --version` should return 1.x)
- Turborepo installed globally (`bun add -g turbo`)

## Steps

### 1.1 — Clean the current repo

The existing portfolio code in the root will be moved into the template later (Step 12). For now,
keep it on a branch or in a temp directory so we can reference it.

```bash
# Create a backup branch of the current code
git checkout -b backup/original-portfolio
git push origin backup/original-portfolio
git checkout main
```

Remove all current app files from root (keep `.git`, `plan/`, `LICENSE`, `README.md`):

```bash
rm -rf pages/ components/ styles/ lib/ public/ node_modules/
rm -f package.json pnpm-lock.yaml next.config.js jsconfig.json
rm -f tailwind.config.js postcss.config.js components.json
rm -f .env.local .env.local.example
rm -rf .next/
```

### 1.2 — Create root package.json

```json
{
  "name": "devport",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:generate": "turbo db:generate",
    "db:migrate": "turbo db:migrate",
    "db:push": "turbo db:push",
    "db:studio": "bun run --filter @devport/db db:studio",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "bun@1.2.9"
}
```

### 1.3 — Create turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "globalEnv": [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_S3_BUCKET",
    "AWS_REGION"
  ],
  "tasks": {
    "dev": {
      "dependsOn": ["^db:generate"],
      "persistent": true,
      "cache": false
    },
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^db:generate"]
    },
    "typecheck": {
      "dependsOn": ["^db:generate"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:studio": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 1.4 — Create directory structure

```bash
mkdir -p apps/backend/src
mkdir -p apps/app/src
mkdir -p apps/dashboard/src
mkdir -p apps/portfolio/src
mkdir -p apps/website/src
mkdir -p packages/db/src
mkdir -p packages/db/prisma
mkdir -p packages/auth/src
mkdir -p packages/ui/src
mkdir -p packages/tsconfig
mkdir -p packages/tailwind-config
mkdir -p docker
```

### 1.5 — Create placeholder package.json for each app/package

Every workspace needs a `package.json` with a unique `name`. Create minimal ones now; they get
fleshed out in later steps.

**apps/backend/package.json:**
```json
{
  "name": "@devport/backend",
  "private": true,
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "typecheck": "tsc --noEmit"
  }
}
```

**apps/app/package.json:**
```json
{
  "name": "@devport/app",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```

**apps/dashboard/package.json:**
```json
{
  "name": "@devport/dashboard",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3003",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```

**apps/portfolio/package.json:**
```json
{
  "name": "@devport/portfolio",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```

**apps/website/package.json:**
```json
{
  "name": "@devport/website",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3004",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```

**packages/db/package.json:**
```json
{
  "name": "@devport/db",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

**packages/auth/package.json:**
```json
{
  "name": "@devport/auth",
  "private": true,
  "exports": {
    "./server": "./src/server.ts",
    "./client": "./src/client.ts"
  }
}
```

**packages/ui/package.json:**
```json
{
  "name": "@devport/ui",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.tsx"
  }
}
```

**packages/tailwind-config/package.json:**
```json
{
  "name": "@devport/tailwind-config",
  "private": true,
  "exports": {
    ".": "./index.ts"
  }
}
```

**packages/tsconfig/package.json:**
```json
{
  "name": "@devport/tsconfig",
  "private": true
}
```

### 1.6 — Create root .gitignore

```gitignore
node_modules/
.next/
dist/
.turbo/
.env
.env.local
*.tsbuildinfo
packages/db/generated/
```

### 1.7 — Create root .env.example

```env
# Database
DATABASE_URL="postgresql://devport:devport@localhost:5432/devport"

# BetterAuth
BETTER_AUTH_SECRET="your-secret-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3001"

# OAuth — Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OAuth — GitHub
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
AWS_REGION=""

# GitHub API (for portfolio GitHub integration)
GITHUB_API_KEY=""

# Public URLs (used by frontend apps)
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PORTFOLIO_URL="http://localhost:3002"
```

### 1.8 — Install root dependencies and verify

```bash
bun install
turbo --version
```

## Verification

- `bun install` completes without errors
- `turbo dev` starts (apps will fail since they're empty, but turbo itself works)
- All directories exist under `apps/` and `packages/`

## Next Step

Proceed to [Step 02 — Shared Packages (tsconfig + tailwind)](./02-shared-packages.md).
