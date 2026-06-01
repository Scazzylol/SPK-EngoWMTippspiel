import postgres from "postgres";
import "dotenv/config";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  // Check if column exists
  const [col] = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'better_auth_user' AND column_name = 'is_admin'
  `;
  if (!col) {
    console.log("Column 'is_admin' NOT FOUND in better_auth_user");
    const cols = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'better_auth_user' ORDER BY ordinal_position
    `;
    console.log("Columns:", cols.map(c => c.column_name).join(", "));
  } else {
    console.log("Column 'is_admin' EXISTS");
    const admin = await sql`SELECT name, is_admin FROM better_auth_user WHERE name = 'Admin'`;
    console.log("Admin user:", admin[0]?.name, "→ is_admin:", admin[0]?.is_admin);
  }
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await sql.end();
}
