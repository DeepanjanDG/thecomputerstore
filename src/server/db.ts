import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Deployed DATABASE_URLs go through a pooler with connection_limit=1, which suits serverless
// functions but starves `next build`, where many pages prerender concurrently in one process.
// Widen the pool for the build only.
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.NEXT_PHASE !== "phase-production-build") return url;
  try {
    const u = new URL(url);
    u.searchParams.set("connection_limit", "5");
    u.searchParams.set("pool_timeout", "60");
    return u.toString();
  } catch {
    return url;
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
