"use server";

import { z } from "zod";
import { sql } from "@/lib/db-singleton";
import { getSession } from "@/lib/session";

const schema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
});

export async function savePrediction(matchId: string, homeScore: number, awayScore: number) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Nicht eingeloggt" };
  }

  const parsed = schema.safeParse({ matchId, homeScore, awayScore });
  if (!parsed.success) {
    return { error: "Ungültige Eingabe" };
  }

  try {
    const [match] = await sql`SELECT "isLocked", "startTime", "homeTeamId", "awayTeamId" FROM "Match" WHERE id = ${matchId}`;
    if (!match) return { error: "Spiel nicht gefunden" };
    if (!match.homeTeamId || !match.awayTeamId) {
      return { error: "Teams für dieses Spiel stehen noch nicht fest" };
    }
    if (match.isLocked || new Date(match.startTime) < new Date()) {
      return { error: "Spiel ist bereits gesperrt" };
    }

    const [existing] = await sql`SELECT id FROM "Prediction" WHERE "userId" = ${session.user.id} AND "matchId" = ${matchId}`;

    if (existing) {
      await sql`UPDATE "Prediction" SET "homeScore" = ${homeScore}, "awayScore" = ${awayScore} WHERE id = ${existing.id}`;
    } else {
      await sql`INSERT INTO "Prediction" (id, "userId", "matchId", "homeScore", "awayScore") VALUES (gen_random_uuid(), ${session.user.id}, ${matchId}, ${homeScore}, ${awayScore})`;
    }

    return { success: true };
  } catch (e) {
    console.error("savePrediction error:", e);
    return { error: "Fehler beim Speichern" };
  }
}
