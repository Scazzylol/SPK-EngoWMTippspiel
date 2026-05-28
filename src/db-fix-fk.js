require("dotenv").config({ path: "./.env" });
const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL);

async function fix() {
  // Check FK constraints on better_auth_account
  const fks = await sql`SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'better_auth_account'`;
  console.log("FKs on better_auth_account:", fks);

  // Drop and recreate FK with correct reference
  try {
    await sql`ALTER TABLE better_auth_account DROP CONSTRAINT IF EXISTS better_account_user_id_fkey`;
    console.log("Dropped old FK constraint");
  } catch (e) {
    console.log("Drop error:", e.message);
  }

  try {
    await sql`ALTER TABLE better_auth_account ADD CONSTRAINT better_auth_account_user_id_fkey FOREIGN KEY (user_id) REFERENCES better_auth_user(id)`;
    console.log("Created new FK constraint");
  } catch (e) {
    console.log("Create error:", e.message);
  }

  // Verify
  const fks2 = await sql`SELECT constraint_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'better_auth_account'`;
  console.log("FKs after fix:", fks2);

  await sql.end();
}

fix().catch(console.error);
