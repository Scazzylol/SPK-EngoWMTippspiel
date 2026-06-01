import "dotenv/config";
import crypto from "crypto";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { hex } from "@better-auth/utils/hex";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set");

const { default: postgres } = await import("postgres");
const sql = postgres(connectionString, { prepare: false });

// must match @better-auth/utils/password exactly:
// salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)))
// key = scryptAsync(password, salt_string, ...) where salt is a hex string
const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
const key = await scryptAsync("admin123".normalize("NFKC"), salt, {
  N: 16384, r: 16, p: 1, dkLen: 64,
  maxmem: 128 * 16384 * 16 * 2,
});
const hash = `${salt}:${hex.encode(key)}`;

await sql`
  UPDATE better_auth_account SET password = ${hash}
  WHERE user_id = (SELECT id FROM better_auth_user WHERE username = 'admin' LIMIT 1)
`;

console.log("Admin-Passwort zurückgesetzt auf: admin123");
await sql.end();
