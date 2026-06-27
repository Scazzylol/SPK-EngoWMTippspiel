"use server";

import { z } from "zod";
import { sql } from "@/lib/db-singleton";
import { isAdmin } from "@/lib/admin";
import { calculateKnockoutStage, advanceToNextRound } from "@/lib/knockout";

const matchSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(99).nullable(),
  awayScore: z.number().int().min(0).max(99).nullable(),
  advancementWinnerId: z.string().nullable().optional(),
});

export async function updateMatchResult(
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
  advancementWinnerId?: string | null
) {
  if (!(await isAdmin())) {
    return { error: "Keine Admin-Rechte" };
  }

  const parsed = matchSchema.safeParse({ matchId, homeScore, awayScore, advancementWinnerId });
  if (!parsed.success) {
    return { error: "Ungültige Eingabe" };
  }

  try {
    // Prüfen ob es ein Gruppenspiel ist
    const [matchInfo] = await sql<{ stage: string }[]>`SELECT stage FROM "Match" WHERE id = ${matchId}`;
    const isGroupMatch = matchInfo?.stage === "GROUP";

    await sql`
      UPDATE "Match"
      SET "homeScore" = ${homeScore}, "awayScore" = ${awayScore},
          "advancementWinnerId" = ${advancementWinnerId ?? null},
          "isLocked" = true, "updatedAt" = NOW()
      WHERE id = ${matchId}
    `;

    // Bei Gruppen-Ergebnis-Änderung: alle KO-Team-Zuordnungen löschen,
    // damit beim späteren Klick auf "KO berechnen" sauber neu gerechnet wird.
    // calculateKnockoutStage() wird hier NICHT aufgerufen – das passiert erst
    // manuell über den Admin-Button, nachdem die gesamte Gruppenphase beendet ist.
    if (isGroupMatch) {
      await sql`UPDATE "Match" SET "homeTeamId" = NULL, "awayTeamId" = NULL WHERE stage != 'GROUP'::"Stage"`;
    }

    await autoAdvance();
    return { success: true };
  } catch (e) {
    console.error("updateMatchResult error:", e);
    return { error: "Fehler beim Speichern" };
  }
}

async function autoAdvance() {
  try {
    // KO-Runden fortlaufend vorrücken, solange möglich
    while (true) {
      const result = await advanceToNextRound();
      if ("error" in result) break;
    }
  } catch (e) {
    console.error("autoAdvance error:", e);
  }
}

export async function toggleMatchLock(matchId: string) {
  if (!(await isAdmin())) {
    return { error: "Keine Admin-Rechte" };
  }

  try {
    await sql`
      UPDATE "Match"
      SET "isLocked" = NOT "isLocked", "updatedAt" = NOW()
      WHERE id = ${matchId}
    `;
    return { success: true };
  } catch (e) {
    console.error("toggleMatchLock error:", e);
    return { error: "Fehler beim Sperren" };
  }
}

interface AdminMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  groupName: string | null;
  stage: string;
  startTime: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  advancementWinnerId: string | null;
  isLocked: boolean;
}

export async function getAdminMatches(): Promise<AdminMatch[]> {
  if (!(await isAdmin())) {
    return [];
  }

  try {
    const rows = await sql<any[]>`
      SELECT
        m.id,
        m."homeTeamId",
        m."awayTeamId",
        m."advancementWinnerId",
        home.name AS "homeTeam",
        away.name AS "awayTeam",
        g.name AS "groupName",
        m.stage,
        m."startTime",
        m."homeScore",
        m."awayScore",
        m."isLocked"
      FROM "Match" m
      LEFT JOIN "Team" home ON m."homeTeamId" = home.id
      LEFT JOIN "Team" away ON m."awayTeamId" = away.id
      LEFT JOIN "Group" g ON m."groupId" = g.id
      ORDER BY m."startTime", m."matchNumber"
    `;

    return rows.map((row: any) => ({
      id: row.id,
      homeTeamId: row.homeTeamId ?? null,
      awayTeamId: row.awayTeamId ?? null,
      advancementWinnerId: row.advancementWinnerId ?? null,
      homeTeam: row.homeTeam || "TBD",
      awayTeam: row.awayTeam || "TBD",
      groupName: row.groupName || null,
      stage: row.stage,
      startTime: row.startTime instanceof Date ? row.startTime.toISOString() : String(row.startTime),
      homeScore: row.homeScore ?? null,
      awayScore: row.awayScore ?? null,
      isLocked: row.isLocked,
    }));
  } catch (e) {
    console.error("getAdminMatches error:", e);
    return [];
  }
}

export async function calculateKnockout(): Promise<{ success: boolean } | { error: string }> {
  if (!(await isAdmin())) {
    return { error: "Keine Admin-Rechte" };
  }

  try {
    await calculateKnockoutStage();

    const advanced = await advanceToNextRound();
    if ("error" in advanced && advanced.error && !advanced.error.includes("Keine neue Runde")) {
      return { error: advanced.error };
    }

    return { success: true };
  } catch (e) {
    console.error("calculateKnockout error:", e);
    return { error: "Fehler bei der Berechnung" };
  }
}
