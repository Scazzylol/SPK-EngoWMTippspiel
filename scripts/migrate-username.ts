import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(import.meta.dirname, "..", ".env") });

async function main() {
  const { default: postgres } = await import("postgres");
  const sql = postgres(process.env.DATABASE_URL!);

  await sql.unsafe(`ALTER TABLE better_auth_user ADD COLUMN IF NOT EXISTS username TEXT UNIQUE`);

  const users = await sql<{ id: string; name: string }[]>`SELECT id, name FROM better_auth_user WHERE username IS NULL`;

  for (const user of users) {
    const base = user.name.toLowerCase().replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30);
    let candidate = base;
    let suffix = 1;
    while (true) {
      const existing = await sql`SELECT id FROM better_auth_user WHERE username = ${candidate} AND id != ${user.id} LIMIT 1`;
      if (existing.length === 0) break;
      candidate = `${base.slice(0, 30 - suffix.toString().length)}${suffix}`;
      suffix++;
    }
    await sql`UPDATE better_auth_user SET username = ${candidate} WHERE id = ${user.id}`;
  }

  console.log("Migration completed: added username column and backfilled existing users.");
  await sql.end();
}

main();
