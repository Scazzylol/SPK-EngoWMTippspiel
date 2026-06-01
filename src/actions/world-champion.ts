"use server";

import { sql } from "@/lib/db-singleton";
import { getSession } from "@/lib/session";

export async function saveWorldChampion(teamId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Nicht eingeloggt");

  // Lock once any match has been finished or locked by admin
  const lockedMatch = await sql<{ id: string }[]>`
    SELECT id FROM "Match" WHERE "isLocked" = true OR ("homeScore" IS NOT NULL AND "awayScore" IS NOT NULL) LIMIT 1
  `;
  if (lockedMatch.length > 0) {
    throw new Error("Der Weltmeister-Tipp ist gesperrt (erstes Spiel bereits beendet)");
  }

  await sql`
    UPDATE "better_auth_user" SET "world_champion_id" = ${teamId} WHERE id = ${session.user.id}
  `;
}
