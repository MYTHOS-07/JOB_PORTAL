import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

/**
 * Single Prisma 7 client. v7 requires a driver adapter for PostgreSQL.
 */
export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

/**
 * Confirms PostgreSQL is reachable.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
