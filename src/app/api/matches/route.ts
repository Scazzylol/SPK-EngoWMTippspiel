import { NextResponse } from "next/server";
import { sql } from "@/lib/db-singleton";

interface MatchRow {
  id: string;
  hometeamname: string;
  hometeamcode: string | null;
  hometeamflag: string | null;
  awayteamname: string;
  awayteamcode: string | null;
  awayteamflag: string | null;
  matchdate: Date;
  groupname: string | null;
  stage: string;
}

interface MatchResponse {
  id: string;
  homeTeam: string;
  homeTeamCode: string | null;
  homeTeamFlag: string | null;
  awayTeam: string;
  awayTeamCode: string | null;
  awayTeamFlag: string | null;
  matchDate: string;
  groupName: string | null;
  stage: string;
}

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
    const rows = await sql<MatchRow[]>`
      SELECT 
        m.id,
        home.name AS homeTeamName,
        home.code AS homeTeamCode,
        home."flagEmoji" AS homeTeamFlag,
        away.name AS awayTeamName,
        away.code AS awayTeamCode,
        away."flagEmoji" AS awayTeamFlag,
        m."startTime" AS matchDate,
        g.name AS groupName,
        m.stage
      FROM "Match" m
      LEFT JOIN "Team" home ON m."homeTeamId" = home.id
      LEFT JOIN "Team" away ON m."awayTeamId" = away.id
      LEFT JOIN "Group" g ON m."groupId" = g.id
      ORDER BY m."startTime", m."matchNumber"
    `;

    const matches: MatchResponse[] = rows.map((row) => ({
      id: row.id,
      homeTeam: row.hometeamname || "TBD",
      homeTeamCode: row.hometeamcode || null,
      homeTeamFlag: row.hometeamflag || null,
      awayTeam: row.awayteamname || "TBD",
      awayTeamCode: row.awayteamcode || null,
      awayTeamFlag: row.awayteamflag || null,
      matchDate: row.matchdate.toISOString(),
      groupName: row.groupname || null,
      stage: normalizeStage(row.stage),
    }));

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json([], { status: 200 });
  }
}
