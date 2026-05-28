import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  // Delete predictions first (FK dependency)
  const delPred = await sql`DELETE FROM "Prediction"`;
  console.log(`Deleted ${delPred.count} predictions`);

  // Delete matches
  const delMatch = await sql`DELETE FROM "Match"`;
  console.log(`Deleted ${delMatch.count} matches`);

  // Delete teams
  const delTeam = await sql`DELETE FROM "Team"`;
  console.log(`Deleted ${delTeam.count} teams`);

  // Delete groups
  const delGroup = await sql`DELETE FROM "Group"`;
  console.log(`Deleted ${delGroup.count} groups`);

  console.log("Done - all app data cleared (users/auth tables untouched)");
  await sql.end();
}

main().catch(console.error);
