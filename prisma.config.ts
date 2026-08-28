import path from "node:path";
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres.duamgctajmmzvyjxprnq:FDKCpZ4jLi91psUX@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres",
  },
});
