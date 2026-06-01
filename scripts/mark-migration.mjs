import postgres from "postgres";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const sql = postgres(connectionString, { prepare: false });

try {
  const migrationName = "20260601000000_extra_time_penalty_advancement";
  const [existing] = await sql`SELECT id FROM "_prisma_migrations" WHERE migration_name = ${migrationName}`;
  if (!existing) {
    await sql`
      INSERT INTO "_prisma_migrations" (id, migration_name, started_at, finished_at, applied_steps_count, logs, rolled_back_at)
      VALUES (gen_random_uuid(), ${migrationName}, NOW(), NOW(), 1, '', NULL)
    `;
    console.log("Migration recorded in _prisma_migrations");
  } else {
    console.log("Migration already recorded");
  }
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await sql.end();
}
