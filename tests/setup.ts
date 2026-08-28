import "dotenv/config";

// Unit tests reuse the local dev DB URL so module-level prisma construction
// succeeds. Tests that hit the DB use the ./dev.db file (never production data).
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}
if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "test-secret-key-not-for-production";
}