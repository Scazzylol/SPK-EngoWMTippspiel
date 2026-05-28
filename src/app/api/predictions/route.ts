import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { predictions as predictionsTable } from "@/lib/auth-schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const userPredictions = await db
      .select()
      .from(predictionsTable)
      .where(eq(predictionsTable.userId, userId));

    return NextResponse.json(userPredictions);
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

    const existing = await db
      .select()
      .from(predictionsTable)
      .where(and(eq(predictionsTable.userId, userId), eq(predictionsTable.matchId, matchId)));

    if (existing.length > 0) {
      const updated = await db
        .update(predictionsTable)
        .set({ homeScore, awayScore })
        .where(eq(predictionsTable.id, existing[0].id))
        .returning();
      return NextResponse.json(updated[0]);
    }

    const inserted = await db
      .insert(predictionsTable)
      .values({ userId, matchId, homeScore, awayScore })
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json({ error: "Failed to save prediction" }, { status: 500 });
  }
}
