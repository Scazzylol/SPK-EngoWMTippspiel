import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matches as matchesTable } from "@/lib/auth-schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const allMatches = await db.select().from(matchesTable).orderBy(asc(matchesTable.matchDate));
    return NextResponse.json(allMatches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inserted = await db.insert(matchesTable).values(body).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}
