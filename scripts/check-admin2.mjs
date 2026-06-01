import postgres from "postgres";
import "dotenv/config";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 2 });

try {
  const result = await sql`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'better_auth_user' AND column_name = 'is_admin'
  `;
  console.log("is_admin column:", result.length > 0 ? "EXISTS" : "NOT FOUND");
  
  if (result.length > 0) {
    const users = await sql`SELECT name, is_admin FROM better_auth_user ORDER BY name LIMIT 20`;
    for (const u of users) {
      console.log(u.name, "→ is_admin:", u.is_admin);
    }
  } else {
    // Column doesn't exist - let's check what columns exist
    const cols = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'better_auth_user'
      ORDER BY ordinal_position
    `;
    console.log("Available columns:", cols.map(c => c.column_name).join(", "));
  }
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await sql.end();
}
