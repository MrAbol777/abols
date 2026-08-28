import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "file:/app/data/prod.db"
    : "file:./dev.db");

// The better-sqlite3 adapter parses the `file:` URL and manages the connection.
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

// Singleton pattern for Next.js dev (prevents exhausting connections on HMR).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
