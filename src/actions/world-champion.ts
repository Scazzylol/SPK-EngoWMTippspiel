"use server";

import { sql } from "@/lib/db-singleton";
import { getSession } from "@/lib/session";

export async function saveWorldChampion(teamId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Nicht eingeloggt");

  // Check if the first match has already started → world champion is locked
  const firstMatch = await sql<{ matchDate: Date }[]>`
    SELECT "matchDate" FROM "Match" ORDER BY "matchDate" ASC LIMIT 1
  `;
  if (firstMatch.length > 0 && new Date(firstMatch[0].matchDate) < new Date()) {
    throw new Error("Der Weltmeister-Tipp ist gesperrt (erstes Spiel bereits angepfiffen)");
  }

  await sql`
    UPDATE "better_auth_user" SET "world_champion_id" = ${teamId} WHERE id = ${session.user.id}
  `;
}
