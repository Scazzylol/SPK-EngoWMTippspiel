"use server";

import { z } from "zod";
import { sql } from "@/lib/db-singleton";
import { isAdmin } from "@/lib/admin";
import { calculateKnockoutStage, advanceToNextRound } from "@/lib/knockout";

const matchSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(99).nullable(),
  awayScore: z.number().int().min(0).max(99).nullable(),
});

export async function updateMatchResult(
  matchId: string,
  homeScore: number | null,
  awayScore: number | null
) {
  if (!(await isAdmin())) {
    return { error: "Keine Admin-Rechte" };
  }

  const parsed = matchSchema.safeParse({ matchId, homeScore, awayScore });
  if (!parsed.success) {
    return { error: "Ungültige Eingabe" };
  }

  try {
    await sql`
      UPDATE "Match"
      SET "homeScore" = ${homeScore}, "awayScore" = ${awayScore}, "isLocked" = true, "updatedAt" = NOW()
      WHERE id = ${matchId}
    `;
    return { success: true };
  } catch (e) {
    console.error("updateMatchResult error:", e);
    return { error: "Fehler beim Speichern" };
  }
}

export async function updateMatchResults(
  results: { matchId: string; homeScore: number | null; awayScore: number | null }[]
) {
  if (!(await isAdmin())) {
    return { error: "Keine Admin-Rechte" };
  }

  const parsed = z.array(matchSchema).safeParse(results);
  if (!parsed.success) {
    return { error: "Ungültige Eingabe" };
  }

  try {
    for (const r of results) {
      await sql`
        UPDATE "Match"
        SET "homeScore" = ${r.homeScore}, "awayScore" = ${r.awayScore}, "isLocked" = true, "updatedAt" = NOW()
        WHERE id = ${r.matchId}
      `;
    }
    return { success: true };
  } catch (e) {
    console.error("updateMatchResults error:", e);
    return { error: "Fehler beim Speichern" };
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

export async function calculateKnockout() {
  if (!(await isAdmin())) {
    return { error: "Keine Admin-Rechte" };
  }

  try {
    const result = await calculateKnockoutStage();
    if ("error" in result) {
      return { error: result.error };
    }

    const advanced = await advanceToNextRound();
    if ("error" in advanced && !advanced.error?.includes("Keine neue Runde")) {
      return { error: advanced.error };
    }

    return { success: true };
  } catch (e) {
    console.error("calculateKnockout error:", e);
    return { error: "Fehler bei der Berechnung" };
  }
}
