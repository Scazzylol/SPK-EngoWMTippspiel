import { NextResponse } from "next/server";
import { sql } from "@/lib/db-singleton";
import { calculatePoints, getMatchWinner } from "@/lib/scoring";

interface UserRow {
  id: string;
  name: string;
  world_champion_id: string | null;
}

interface TeamRow {
  id: string;
  name: string;
  code: string;
}

interface PredictionRow {
  userId: string;
  predHome: number;
  predAway: number;
  predAdvancementId: string | null;
  actualHome: number | null;
  actualAway: number | null;
  actualHomeTeamId: string | null;
  actualAwayTeamId: string | null;
  actualAdvancementWinnerId: string | null;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  worldChampionTeam: { id: string; name: string; code: string } | null;
}

export async function GET() {
  try {
    const [users, teams] = await Promise.all([
      sql<UserRow[]>`
        SELECT id, name, "world_champion_id" FROM "better_auth_user" WHERE is_admin = false ORDER BY name ASC
      `,
      sql<TeamRow[]>`SELECT id, name, code FROM "Team"`,
    ]);

    const teamMap: Record<string, TeamRow> = {};
    for (const t of teams) {
      teamMap[t.id] = t;
    }

    const predictions = await sql<PredictionRow[]>`
      SELECT
        p."userId",
        p."homeScore" AS "predHome",
        p."awayScore" AS "predAway",
        p."advancementWinnerId" AS "predAdvancementId",
        m."homeScore" AS "actualHome",
        m."awayScore" AS "actualAway",
        m."homeTeamId" AS "actualHomeTeamId",
        m."awayTeamId" AS "actualAwayTeamId",
        m."advancementWinnerId" AS "actualAdvancementWinnerId"
      FROM "Prediction" p
      JOIN "Match" m ON p."matchId" = m.id
      WHERE m."homeScore" IS NOT NULL AND m."awayScore" IS NOT NULL
    `;

    const userPoints: Record<string, number> = {};
    for (const p of predictions) {
      const isActualDraw = p.actualHome !== null && p.actualAway !== null && p.actualHome === p.actualAway;
      const actualAdvancementId = isActualDraw ? p.actualAdvancementWinnerId : null;

      const pts = calculatePoints(p.predHome, p.predAway, p.actualHome, p.actualAway, {
        predictedAdvancementWinnerId: p.predAdvancementId,
        actualAdvancementWinnerId: actualAdvancementId,
      });
      userPoints[p.userId] = (userPoints[p.userId] || 0) + pts;
    }

    // Find actual world champion from final match
    const finalMatch = await sql<{ homeScore: number; awayScore: number; homeTeamId: string | null; awayTeamId: string | null; advancementWinnerId: string | null }[]>`
      SELECT "homeScore", "awayScore", "homeTeamId", "awayTeamId", "advancementWinnerId"
      FROM "Match"
      WHERE stage = 'FINAL' AND "homeScore" IS NOT NULL AND "awayScore" IS NOT NULL
      ORDER BY "startTime" DESC LIMIT 1
    `;

    let actualChampionId: string | null = null;
    if (finalMatch.length > 0) {
      actualChampionId = getMatchWinner(finalMatch[0]);
    }

    const userWorldChampion: Record<string, string | null> = {};
    for (const u of users) {
      userWorldChampion[u.id] = u.world_champion_id;
    }

    const leaderboard: LeaderboardEntry[] = users
      .map((u) => {
        let pts = userPoints[u.id] || 0;
        if (actualChampionId && userWorldChampion[u.id] === actualChampionId) {
          pts += 15;
        }
        return {
          userId: u.id,
          name: u.name,
          points: pts,
          worldChampionTeam: userWorldChampion[u.id] && teamMap[userWorldChampion[u.id]!]
            ? { id: userWorldChampion[u.id]!, name: teamMap[userWorldChampion[u.id]!]!.name, code: teamMap[userWorldChampion[u.id]!]!.code }
            : null,
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ rank: index + 1, ...entry }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
