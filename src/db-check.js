require("dotenv").config({ path: "./.env" });
const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL);

async function check() {
  // Check account table structure
  try {
    const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'better_account' ORDER BY ordinal_position`;
    console.log("better_account columns:");
    cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  } catch (e) {
    console.log("No better_account table:", e.message);
  }

  // Check if better_auth_account exists
  try {
    const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'better_auth_account' ORDER BY ordinal_position`;
    console.log("\nbetter_auth_account columns:");
    cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  } catch (e) {
    console.log("No better_auth_account table found");
  }

  await sql.end();
}

check().catch(console.error);
