import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  // Check Match table columns
  const matchCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Match' ORDER BY ordinal_position`;
  console.log("=== Match Table Columns ===");
  for (const col of matchCols) {
    console.log(`  ${col.column_name} (${col.data_type})`);
  }

  // Check Team table columns
  const teamCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Team' ORDER BY ordinal_position`;
  console.log("\n=== Team Table Columns ===");
  for (const col of teamCols) {
    console.log(`  ${col.column_name} (${col.data_type})`);
  }

  // Check Group table columns
  const groupCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Group' ORDER BY ordinal_position`;
  console.log("\n=== Group Table Columns ===");
  for (const col of groupCols) {
    console.log(`  ${col.column_name} (${col.data_type})`);
  }

  // Check Prediction table columns
  const predCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Prediction' ORDER BY ordinal_position`;
  console.log("\n=== Prediction Table Columns ===");
  for (const col of predCols) {
    console.log(`  ${col.column_name} (${col.data_type})`);
  }

  await sql.end();
}

main().catch(console.error);
