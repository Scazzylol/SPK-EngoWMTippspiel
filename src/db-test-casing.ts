import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

(async () => {
  const r = await sql`SELECT * FROM "Match" LIMIT 1`;
  console.log("Keys:", Object.keys(r[0]));
  console.log(JSON.stringify(r[0], null, 2));
  await sql.end();
})();
