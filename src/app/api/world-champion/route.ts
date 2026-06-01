import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sql } from "@/lib/db-singleton";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;
const pgAdapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter: pgAdapter });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  const users = await sql<{ world_champion_id: string | null }[]>`
    SELECT "world_champion_id" FROM "better_auth_user" WHERE id = ${userId}
  `;

  const firstMatch = await sql<{ matchDate: Date }[]>`
    SELECT "matchDate" FROM "Match" ORDER BY "matchDate" ASC LIMIT 1
  `;
  const isLocked = firstMatch.length > 0 && new Date(firstMatch[0].matchDate) < new Date();

  return NextResponse.json({
    teams,
    pick: users[0]?.world_champion_id ?? null,
    isLocked,
  });
}
