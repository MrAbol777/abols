import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.duamgctajmmzvyjxprnq:FDKCpZ4jLi91psUX@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

// Singleton pattern for Next.js dev (prevents exhausting connections on HMR).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
