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
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
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
      SELECT id, name FROM "better_auth_user" WHERE id = ANY(${userIds}) AND is_admin = false
    `;

    const userNames: Record<string, string> = {};
    for (const u of users) {
      userNames[u.id] = u.name;
    }

    const leaderboard: LeaderboardEntry[] = userIds
      .map((id) => ({
        userId: id,
        name: userNames[id] || "Unbekannt",
        points: userPoints[id],
      }))
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ rank: index + 1, ...entry }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
