import { NextResponse } from "next/server";
import { sql } from "@/lib/db-singleton";
import { calculatePoints } from "@/lib/scoring";

interface PredictionJoinRow {
  userId: string;
  predhome: number;
  predaway: number;
  actualhome: number;
  actualaway: number;
}

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

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  worldChampionTeam: { id: string; name: string; code: string } | null;
}

export async function GET() {
  try {
    const predictions = await sql<PredictionJoinRow[]>`
      SELECT p."userId", p."homeScore" AS predHome, p."awayScore" AS predAway,
             m."homeScore" AS actualHome, m."awayScore" AS actualAway
      FROM "Prediction" p
      JOIN "Match" m ON p."matchId" = m.id
      WHERE m."homeScore" IS NOT NULL AND m."awayScore" IS NOT NULL
    `;

    const userPoints: Record<string, number> = {};

    for (const p of predictions) {
      const pts = calculatePoints(p.predhome, p.predaway, p.actualhome, p.actualaway);
      userPoints[p.userId] = (userPoints[p.userId] || 0) + pts;
    }

    const userIds = Object.keys(userPoints);
    if (userIds.length === 0) {
      return NextResponse.json([]);
    }

    const users = await sql<UserRow[]>`
      SELECT id, name, "world_champion_id" FROM "better_auth_user" WHERE id = ANY(${userIds}) AND is_admin = false
    `;

    // Get all teams for world champion display
    const teams = await sql<TeamRow[]>`SELECT id, name, code FROM "Team"`;
    const teamMap: Record<string, TeamRow> = {};
    for (const t of teams) {
      teamMap[t.id] = t;
    }

    // Find the final match result to determine actual world champion
    const finalMatch = await sql<{ homeScore: number; awayScore: number; homeTeamId: string | null; awayTeamId: string | null }[]>`
      SELECT "homeScore", "awayScore", "homeTeamId", "awayTeamId"
      FROM "Match"
      WHERE stage = 'final' AND "homeScore" IS NOT NULL AND "awayScore" IS NOT NULL
      ORDER BY "matchDate" DESC LIMIT 1
    `;

    let actualChampionId: string | null = null;
    if (finalMatch.length > 0) {
      const fm = finalMatch[0];
      if (fm.homeScore > fm.awayScore) {
        actualChampionId = fm.homeTeamId;
      } else if (fm.awayScore > fm.homeScore) {
        actualChampionId = fm.awayTeamId;
      }
    }

    const userNames: Record<string, string> = {};
    const userWorldChampion: Record<string, string | null> = {};
    for (const u of users) {
      userNames[u.id] = u.name;
      userWorldChampion[u.id] = u.world_champion_id;
    }

    const leaderboard: LeaderboardEntry[] = userIds
      .map((id) => {
        let pts = userPoints[id];
        // +15 bonus if world champion prediction was correct
        if (actualChampionId && userWorldChampion[id] === actualChampionId) {
          pts += 15;
        }
        return {
          userId: id,
          name: userNames[id] || "Unbekannt",
          points: pts,
          worldChampionTeam: userWorldChampion[id] && teamMap[userWorldChampion[id]]
            ? { id: userWorldChampion[id], name: teamMap[userWorldChampion[id]].name, code: teamMap[userWorldChampion[id]].code }
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
