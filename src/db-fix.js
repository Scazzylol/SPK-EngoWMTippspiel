require("dotenv").config({ path: "./.env" });
const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL);

async function fix() {
  try {
    await sql`ALTER TABLE better_account RENAME TO better_auth_account`;
    console.log("Renamed better_account -> better_auth_account ✓");
  } catch (e) {
    console.log("Rename error:", e.message);
  }

  // Verify
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log("\nAll tables:");
  tables.forEach(t => console.log(`  ${t.table_name}`));

  await sql.end();
}

fix().catch(console.error);
