const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.duamgctajmmzvyjxprnq:FDKCpZ4jLi91psUX@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const phone = process.env.ADMIN_PHONE || "09121234567";
const password = process.env.ADMIN_PASSWORD || "Admin@Abol1403";
const hash = bcrypt.hashSync(password, 10);
const now = new Date().toISOString();

async function main() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const query = `
      INSERT INTO "User" ("id", "phone", "passwordHash", "name", "role", "isActive", "isPhoneVerified", "createdAt", "updatedAt")
      VALUES ('admin-1', $1, $2, 'مدیر سیستم', 'ADMIN', true, true, $3, $4)
      ON CONFLICT ("phone") DO UPDATE SET
        "passwordHash" = EXCLUDED."passwordHash",
        "role" = 'ADMIN',
        "isActive" = true,
        "updatedAt" = EXCLUDED."updatedAt";
    `;
    await pool.query(query, [phone, hash, now, now]);
    console.log("✅ Admin user ready for phone:", phone);
  } catch (err) {
    console.error("Admin user sync note:", err.message);
  } finally {
    await pool.end();
  }
}

main();
