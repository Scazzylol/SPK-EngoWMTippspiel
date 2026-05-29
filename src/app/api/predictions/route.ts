import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db-singleton";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const matchId = searchParams.get("matchId");

    // Eigene Tipps für einen User
    if (userId && !matchId) {
      const rows = await sql`SELECT id, "userId", "matchId", "homeScore", "awayScore" FROM "Prediction" WHERE "userId" = ${userId}`;

      const predictions = rows.map((row: any) => ({
        id: row.id,
        userId: row.userId,
        matchId: row.matchId,
        homeScore: row.homeScore ?? 0,
        awayScore: row.awayScore ?? 0,
      }));

      return NextResponse.json(predictions);
    }

    // Alle Tipps für ein Match (nur wenn gelockt)
    if (matchId) {
      const [match] = await sql`SELECT "isLocked", "startTime" FROM "Match" WHERE id = ${matchId}`;
      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      const isLocked = match.isLocked || new Date(match.startTime) < new Date();
      if (!isLocked) {
        return NextResponse.json({ error: "Match is not locked yet" }, { status: 403 });
      }

      const rows = await sql`
        SELECT p.id, p."userId", p."matchId", p."homeScore", p."awayScore", u.name, u.username
        FROM "Prediction" p
        JOIN better_auth_user u ON p."userId" = u.id
        WHERE p."matchId" = ${matchId}
        ORDER BY u.name
      `;

      const predictions = rows.map((row: any) => ({
        id: row.id,
        userId: row.userId,
        matchId: row.matchId,
        homeScore: row.homeScore ?? 0,
        awayScore: row.awayScore ?? 0,
        name: row.name,
        username: row.username,
      }));

      return NextResponse.json(predictions);
    }

    return NextResponse.json({ error: "userId or matchId is required" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}
