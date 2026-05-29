import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db-singleton";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const rows = await sql`SELECT id, "userId", "matchId", "homeScore", "awayScore" FROM "Prediction" WHERE "userId" = ${userId}`;

    const predictions = rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      matchId: row.matchId,
      homeScore: row.homeScore ?? 0,
      awayScore: row.awayScore ?? 0,
    }));

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}
