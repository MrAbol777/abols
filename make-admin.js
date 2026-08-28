const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/^file:/, "")
  : process.env.NODE_ENV === "production"
  ? "/app/data/prod.db"
  : "./dev.db";

const db = new Database(dbPath);
const phone = process.env.ADMIN_PHONE || "09121234567";
const password = process.env.ADMIN_PASSWORD || "Admin@Abol1403";
const hash = bcrypt.hashSync(password, 10);
const now = new Date().toISOString();

db.prepare(`
  INSERT OR REPLACE INTO User (id, phone, passwordHash, name, role, isActive, isPhoneVerified, createdAt, updatedAt)
  VALUES ('admin-1', ?, ?, 'مدیر سیستم', 'ADMIN', 1, 1, ?, ?)
`).run(phone, hash, now, now);

console.log("✅ Admin user ready for phone:", phone);

// Remove default sample products completely
try {
  db.prepare("DELETE FROM ProductCheckoutField").run();
  db.prepare("DELETE FROM ProductAttribute").run();
  db.prepare("DELETE FROM ProductMedia").run();
  db.prepare("DELETE FROM Review").run();
  db.prepare("DELETE FROM Product").run();
  console.log("🧹 Default products cleared completely from database.");
} catch (e) {
  console.log("Product cleanup note:", e.message);
}

