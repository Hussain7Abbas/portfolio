# Step 2 — Shared Packages (tsconfig + tailwind-config)

## Goal

Create the `@devport/tsconfig` and `@devport/tailwind-config` packages so all apps share
consistent TypeScript and styling configuration.

## Steps

### 2.1 — packages/tsconfig

Create three base configs that apps extend.

**packages/tsconfig/base.json** — shared compiler settings:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist", ".next", ".turbo"]
}
```

**packages/tsconfig/nextjs.json** — for all Next.js 15 apps:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**packages/tsconfig/node.json** — for the Elysia backend:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["bun-types"]
  }
}
```

Then create a tsconfig.json in each app that extends the appropriate base:

**apps/backend/tsconfig.json:**
```json
{
  "extends": "@devport/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**apps/app/tsconfig.json** (same pattern for dashboard, portfolio, website):
```json
{
  "extends": "@devport/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2.2 — packages/tailwind-config

A shared Tailwind v4 config preset that all Next.js apps import.

**packages/tailwind-config/index.ts:**
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

Each Next.js app then has its own `tailwind.config.ts` that extends this:

```ts
import type { Config } from "tailwindcss";
import sharedConfig from "@devport/tailwind-config";

const config: Config = {
  ...sharedConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
```

### 2.3 — Add dependencies

```bash
# In each Next.js app
cd apps/app && bun add -d tailwindcss postcss autoprefixer tailwindcss-animate @devport/tailwind-config @devport/tsconfig
# Repeat for dashboard, portfolio, website

# In backend
cd apps/backend && bun add -d @devport/tsconfig bun-types
```

## Verification

- `bun run typecheck` from root should not error about missing tsconfig
- Each app's `tsconfig.json` resolves the `extends` properly

## Next Step

Proceed to [Step 03 — Database Package (Prisma + Docker PostgreSQL)](./03-database.md).
