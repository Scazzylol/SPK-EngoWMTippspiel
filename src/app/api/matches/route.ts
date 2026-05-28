import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

function normalizeStage(stage: string): string {
  const map: Record<string, string> = {
    GROUP: "group",
    ROUND_OF_32: "round_of_32",
    ROUND_OF_16: "round_of_16",
    QUARTER_FINALS: "quarter_finals",
    SEMI_FINALS: "semi_finals",
    THIRD_PLACE: "third_place",
    FINAL: "final",
  };
  return map[stage] || stage.toLowerCase();
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        m.id,
        home.name AS homeTeamName,
        away.name AS awayTeamName,
        m."startTime" AS matchDate,
        g.name AS groupName,
        m.stage
      FROM "Match" m
      LEFT JOIN "Team" home ON m."homeTeamId" = home.id
      LEFT JOIN "Team" away ON m."awayTeamId" = away.id
      LEFT JOIN "Group" g ON m."groupId" = g.id
      ORDER BY m."startTime", m."matchNumber"
    `;

    const matches = rows.map((row: any) => ({
      id: row.id,
      homeTeam: row.hometeamname || "TBD",
      awayTeam: row.awayteamname || "TBD",
      matchDate: row.matchdate,
      groupName: row.groupname,
      stage: normalizeStage(row.stage),
    }));

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json([], { status: 200 });
  }
}
