import { NextResponse } from "next/server";
import { sql } from "@/lib/db-singleton";

interface TeamRow {
  id: string;
  name: string;
  code: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const [teams, users, lockedMatch] = await Promise.all([
    sql<TeamRow[]>`SELECT id, name, code FROM "Team" ORDER BY name ASC`,
    sql<{ world_champion_id: string | null }[]>`SELECT "world_champion_id" FROM "better_auth_user" WHERE id = ${userId}`,
    sql<{ id: string }[]>`SELECT id FROM "Match" WHERE "isLocked" = true OR ("homeScore" IS NOT NULL AND "awayScore" IS NOT NULL) LIMIT 1`,
  ]);

  const isLocked = lockedMatch.length > 0;

  return NextResponse.json({
    teams,
    pick: users[0]?.world_champion_id ?? null,
    isLocked,
  });
}
