import "dotenv/config";
import crypto from "crypto";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { hex } from "@better-auth/utils/hex";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL or DIRECT_URL must be set");
  process.exit(1);
}

const { default: postgres } = await import("postgres");
const sql = postgres(connectionString, { prepare: false });

const testUsers = Array.from({ length: 10 }, (_, i) => ({
  username: `test${i + 1}`,
  email: `test${i + 1}@test.de`,
  password: "test1234",
  name: `Test-User ${i + 1}`,
}));

const adminUser = {
  username: "admin",
  email: "admin@wm-tippspiel.de",
  password: "admin123",
  name: "Admin",
};

const allUsers = [...testUsers, adminUser];

for (const user of allUsers) {
  const existing = await sql`
    SELECT id FROM better_auth_user WHERE username = ${user.username}
  `;

  if (existing.length > 0) {
    console.log(`User '${user.username}' existiert bereits, überspringe.`);
    continue;
  }

  const userId = crypto.randomUUID();
  const now = new Date();
  const passwordHash = await hashPassword(user.password);

  await sql`
    INSERT INTO better_auth_user (id, name, email, email_verified, username, display_username, is_admin, created_at, updated_at)
    VALUES (${userId}, ${user.name}, ${user.email}, true, ${user.username}, ${user.username}, ${user.username === "admin"}, ${now}, ${now})
  `;

  const accountId = crypto.randomUUID();
  await sql`
    INSERT INTO better_auth_account (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES (${accountId}, ${userId}, 'credential', ${userId}, ${passwordHash}, ${now}, ${now})
  `;

  console.log(`User '${user.username}' angelegt${user.username === "admin" ? " (Admin)" : ""}.`);
}

await sql.end();
console.log("\nFertig! Alle User wurden angelegt.");
console.log("Test-User: test1-test10 mit Passwort 'test1234'");
console.log("Admin-User: admin mit Passwort 'admin123'");

async function hashPassword(password) {
  // Must match @better-auth/utils/password exactly:
  // salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)))
  // key = scryptAsync(password, salt_string, ...) where salt is a hex string
  const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
  const key = await scryptAsync(password.normalize("NFKC"), salt, {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${hex.encode(key)}`;
}
