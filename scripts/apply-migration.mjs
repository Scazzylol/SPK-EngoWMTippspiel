import postgres from "postgres";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const sql = postgres(connectionString, { prepare: false, max: 2 });

try {
  const migrationPath = join(root, "prisma", "migrations", "20260601000000_extra_time_penalty_advancement", "migration.sql");
  const sqlContent = readFileSync(migrationPath, "utf8");
  const statements = sqlContent.split(";").filter(s => s.trim());
  for (const stmt of statements) {
    await sql.unsafe(stmt + ";");
  }
  console.log("Migration applied successfully");
} catch (e) {
  if (e.message?.includes("already exists")) {
    console.log("Column already exists, skipping");
  } else {
    console.error("Migration error:", e.message);
  }
} finally {
  await sql.end();
}
