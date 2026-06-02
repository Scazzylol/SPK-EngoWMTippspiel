import { NextResponse } from "next/server";
import { sql } from "@/lib/db-singleton";
import { normalizeStage } from "@/lib/stage-labels";

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
  islocked: boolean;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  advancementwinnerid: string | null;
  advancementwinnername: string | null;
}

interface MatchResponse {
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeam: string;
  homeTeamCode: string | null;
  homeTeamFlag: string | null;
  awayTeam: string;
  awayTeamCode: string | null;
  awayTeamFlag: string | null;
  matchDate: string;
  groupName: string | null;
  stage: string;
  hasTeams: boolean;
  isLocked: boolean;
  homeScore: number | null;
  awayScore: number | null;
  advancementWinnerId: string | null;
  advancementWinner: string | null;
}

export async function GET() {
  try {
    const rows = await sql<MatchRow[]>`
      SELECT 
        m.id,
        m."homeTeamId",
        m."awayTeamId",
        home.name AS homeTeamName,
        home.code AS homeTeamCode,
        home."flagEmoji" AS homeTeamFlag,
        away.name AS awayTeamName,
        away.code AS awayTeamCode,
        away."flagEmoji" AS awayTeamFlag,
        m."startTime" AS matchDate,
        g.name AS groupName,
        m.stage,
        m."isLocked",
        m."homeScore",
        m."awayScore",
        m."advancementWinnerId",
        adv.name AS advancementWinnerName
      FROM "Match" m
      LEFT JOIN "Team" home ON m."homeTeamId" = home.id
      LEFT JOIN "Team" away ON m."awayTeamId" = away.id
      LEFT JOIN "Team" adv ON m."advancementWinnerId" = adv.id
      LEFT JOIN "Group" g ON m."groupId" = g.id
      ORDER BY m."startTime", m."matchNumber"
    `;

    const matches: MatchResponse[] = rows.map((row: any) => ({
      id: row.id,
      homeTeamId: row.homeTeamId ?? null,
      awayTeamId: row.awayTeamId ?? null,
      homeTeam: row.hometeamname || "TBD",
      homeTeamCode: row.hometeamcode || null,
      homeTeamFlag: row.hometeamflag || null,
      awayTeam: row.awayteamname || "TBD",
      awayTeamCode: row.awayteamcode || null,
      awayTeamFlag: row.awayteamflag || null,
      matchDate: row.matchdate.toISOString(),
      groupName: row.groupname || null,
      stage: normalizeStage(row.stage),
      hasTeams: !!(row.hometeamcode && row.awayteamcode),
      isLocked: row.islocked,
      homeScore: row.homeScore ?? null,
      awayScore: row.awayScore ?? null,
      advancementWinnerId: row.advancementwinnerid ?? null,
      advancementWinner: row.advancementwinnername ?? null,
    }));

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json([], { status: 200 });
  }
}
