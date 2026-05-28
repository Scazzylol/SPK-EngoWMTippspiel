import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

// Official WM 2026 group compositions from Wikipedia
const groupsData = {
  Group_A: ["Mexico", "South Africa", "South Korea", "Czech Republic"],
  Group_B: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  Group_C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  Group_D: ["United States", "Paraguay", "Australia", "Turkey"],
  Group_E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  Group_F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  Group_G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  Group_H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  Group_I: ["France", "Senegal", "Iraq", "Norway"],
  Group_J: ["Argentina", "Algeria", "Austria", "Jordan"],
  Group_K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  Group_L: ["England", "Croatia", "Ghana", "Panama"],
};

// Generate team codes from names (3-letter abbreviations)
function getTeamCode(name: string): string {
  const map: Record<string, string> = {
    "South Africa": "RSA",
    "South Korea": "KOR",
    "Czech Republic": "CZE",
    Canada: "CAN",
    "Bosnia and Herzegovina": "BIH",
    Qatar: "QAT",
    Switzerland: "SUI",
    Brazil: "BRA",
    Morocco: "MAR",
    Haiti: "HAI",
    Scotland: "SCO",
    "United States": "USA",
    Paraguay: "PAR",
    Australia: "AUS",
    Turkey: "TUR",
    Germany: "GER",
    Curaçao: "CUW",
    "Ivory Coast": "CIV",
    Ecuador: "ECU",
    Netherlands: "NED",
    Japan: "JPN",
    Sweden: "SWE",
    Tunisia: "TUN",
    Belgium: "BEL",
    Egypt: "EGY",
    Iran: "IRN",
    "New Zealand": "NZL",
    Spain: "ESP",
    "Cape Verde": "CPV",
    "Saudi Arabia": "KSA",
    Uruguay: "URU",
    France: "FRA",
    Senegal: "SEN",
    Iraq: "IRQ",
    Norway: "NOR",
    Argentina: "ARG",
    Algeria: "ALG",
    Austria: "AUT",
    Jordan: "JOR",
    Portugal: "POR",
    "DR Congo": "COD",
    Uzbekistan: "UZB",
    Colombia: "COL",
    England: "ENG",
    Croatia: "CRO",
    Ghana: "GHA",
    Panama: "PAN",
  };
  return map[name] || name.substring(0, 3).toUpperCase();
}

// WM 2026 match dates (June-July 2026) - official schedule pattern
const baseDate = new Date("2026-06-11T15:00:00Z"); // Opening day

function getMatchDate(groupIndex: number, matchDay: number, matchInDay: number): Date {
  const matchDays = [0, 4, 8]; // Days offset from start
  const date = new Date(baseDate);
  date.setDate(date.getDate() + matchDays[matchDay]);
  date.setHours(date.getHours() + matchInDay * 2);
  return date;
}

async function main() {
  console.log("Seeding WM 2026 data...\n");

  // Clear existing data
  await sql`DELETE FROM "Prediction"`;
  await sql`DELETE FROM "Match"`;
  await sql`DELETE FROM "Team"`;
  await sql`DELETE FROM "Group"`;
  console.log("Cleared existing data.");

  // Insert groups
  const groupEntries = Object.entries(groupsData);
  for (const [groupName] of groupEntries) {
    await sql`INSERT INTO "Group" (id, name, "createdAt") VALUES (gen_random_uuid(), ${groupName}, now())`;
  }
  console.log(`Inserted ${groupEntries.length} groups.`);

  // Get group IDs
  const groupsRows: any[] = await sql`SELECT id, name FROM "Group"`;
  const groupIdMap: Record<string, string> = {};
  for (const row of groupsRows) {
    groupIdMap[row.name] = row.id;
  }

  // Insert teams
  let teamCount = 0;
  for (const [groupName, teams] of groupEntries) {
    for (const teamName of teams) {
      const code = getTeamCode(teamName);
      await sql`INSERT INTO "Team" (id, name, code, "flagEmoji", "groupId", "createdAt") VALUES (gen_random_uuid(), ${teamName}, ${code}, NULL, ${groupIdMap[groupName]}, now())`;
      teamCount++;
    }
  }
  console.log(`Inserted ${teamCount} teams.`);

  // Get team IDs
  const teamsRows: any[] = await sql`SELECT id, name FROM "Team"`;
  const teamIdMap: Record<string, string> = {};
  for (const row of teamsRows) {
    teamIdMap[row.name] = row.id;
  }

  // Generate group matches
  let matchCount = 0;
  const groupNames = Object.keys(groupsData);

  for (let gi = 0; gi < groupNames.length; gi++) {
    const groupName = groupNames[gi];
    const teams = groupsData[groupName as keyof typeof groupsData];

    const matchPairs = [
      [teams[0], teams[1]],
      [teams[2], teams[3]],
      [teams[0], teams[2]],
      [teams[1], teams[3]],
      [teams[0], teams[3]],
      [teams[1], teams[2]],
    ];

    for (let mi = 0; mi < matchPairs.length; mi++) {
      const [homeTeam, awayTeam] = matchPairs[mi];
      const matchDay = Math.floor(mi / 2);
      const matchInDay = mi % 2;
      const startTime = getMatchDate(gi, matchDay, matchInDay);

      await sql`INSERT INTO "Match" ("id", "homeTeamId", "awayTeamId", "groupId", stage, "matchNumber", "startTime", "isLocked", "createdAt", "updatedAt") VALUES (gen_random_uuid(), ${teamIdMap[homeTeam]}, ${teamIdMap[awayTeam]}, ${groupIdMap[groupName]}, 'GROUP', ${mi + 1}, ${startTime.toISOString()}, false, now(), now())`;
      matchCount++;
    }
  }
  console.log(`Inserted ${matchCount} group stage matches.`);

  // Insert knockout round placeholders
  const koStages = [
    { stage: "ROUND_OF_32", count: 16 },
    { stage: "ROUND_OF_16", count: 8 },
    { stage: "QUARTER_FINALS", count: 4 },
    { stage: "SEMI_FINALS", count: 2 },
    { stage: "THIRD_PLACE", count: 1 },
    { stage: "FINAL", count: 1 },
  ];

  let koCount = 0;
  const koDates = [
    "2026-07-01T15:00:00Z",
    "2026-07-05T15:00:00Z",
    "2026-07-09T15:00:00Z",
    "2026-07-13T15:00:00Z",
    "2026-07-14T19:00:00Z",
    "2026-07-19T18:00:00Z",
  ];

  for (let si = 0; si < koStages.length; si++) {
    const { stage, count } = koStages[si];
    for (let mi = 0; mi < count; mi++) {
      await sql`INSERT INTO "Match" ("id", "homeTeamId", "awayTeamId", "groupId", stage, "matchNumber", "startTime", "isLocked", "createdAt", "updatedAt") VALUES (gen_random_uuid(), NULL, NULL, NULL, ${stage}, ${mi + 1}, ${koDates[si]}, false, now(), now())`;
      koCount++;
    }
  }
  console.log(`Inserted ${koCount} knockout stage matches (teams TBD).`);

  // Verify
  const [mCount] = await sql`SELECT COUNT(*) FROM "Match"`;
  const [tCount] = await sql`SELECT COUNT(*) FROM "Team"`;
  const [gCount] = await sql`SELECT COUNT(*) FROM "Group"`;
  console.log(`\n✅ Verification: ${gCount.count} groups, ${tCount.count} teams, ${mCount.count} matches`);

  console.log("\n✅ Seeding complete!");
  console.log(`Total: ${groupEntries.length} groups, ${teamCount} teams, ${matchCount + koCount} matches`);

  await sql.end();
}

main().catch(console.error);
