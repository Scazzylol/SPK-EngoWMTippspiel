import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db-singleton";

interface PredictionRow {
  id: string;
  userid: string;
  matchid: string;
  homescore: number;
  awayscore: number;
}

interface PredictionResponse {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const rows = await sql<PredictionRow[]>`SELECT * FROM "Prediction" WHERE "userId" = ${userId}`;

    const predictions: PredictionResponse[] = rows.map((row) => ({
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
