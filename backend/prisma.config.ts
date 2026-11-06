import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 CLI configuration.
 * Database URL and seed live here, not in schema.prisma.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
