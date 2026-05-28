import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const rows = await sql`SELECT * FROM "Prediction" WHERE "userId" = ${userId}`;

    const predictions = rows.map((row: any) => ({
      id: row.id,
      userId: row.userid,
      matchId: row.matchid,
      homeScore: row.homescore ?? 0,
      awayScore: row.awayscore ?? 0,
    }));

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, matchId, homeScore, awayScore } = body;

    if (!userId || !matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await sql`SELECT * FROM "Prediction" WHERE "userId" = ${userId} AND "matchId" = ${matchId}`;

    if (existing.length > 0) {
      const updated = await sql`
        UPDATE "Prediction" 
        SET "homeScore" = ${homeScore}, "awayScore" = ${awayScore}
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return NextResponse.json({
        id: updated[0].id,
        userId: updated[0].userid,
        matchId: updated[0].matchid,
        homeScore: updated[0].homescore,
        awayScore: updated[0].awayscore,
      });
    }

    const inserted = await sql`
      INSERT INTO "Prediction" ("userId", "matchId", "homeScore", "awayScore") 
      VALUES (${userId}, ${matchId}, ${homeScore}, ${awayScore})
      RETURNING *
    `;

    return NextResponse.json({
      id: inserted[0].id,
      userId: inserted[0].userid,
      matchId: inserted[0].matchid,
      homeScore: inserted[0].homescore,
      awayScore: inserted[0].awayscore,
    }, { status: 201 });
  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json({ error: "Failed to save prediction" }, { status: 500 });
  }
}
