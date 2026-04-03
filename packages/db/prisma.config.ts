import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const pkgRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(pkgRoot, "../..");
config({ path: resolve(repoRoot, ".env") });
config({ path: resolve(pkgRoot, ".env") });

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://127.0.0.1:5432/devport_prisma_generate_placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
