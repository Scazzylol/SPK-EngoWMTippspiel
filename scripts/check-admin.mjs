import postgres from "postgres";
import "dotenv/config";

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

try {
  const users = await sql`SELECT id, name, is_admin FROM better_auth_user ORDER BY name`;
  for (const u of users) {
    console.log(u.name, "→ is_admin:", u.is_admin);
  }
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await sql.end();
}
