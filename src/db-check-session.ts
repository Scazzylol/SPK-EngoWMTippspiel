import "dotenv/config";
import path from "path";
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function check() {
  const cols = await sql.unsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'better_auth_session'`
  );
  console.log("Session table columns:");
  console.log(JSON.stringify(cols, null, 2));

  await sql.end();
}

check().catch(console.error);
