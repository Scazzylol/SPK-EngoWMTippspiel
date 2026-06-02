import { sql } from "@/lib/db-singleton";
import { getMatchWinner } from "@/lib/scoring";
import thirdPlaceMatrix from "@/data/fifa-2026-third-place-matrix.json";

interface GroupRow {
  id: string;
  name: string;
}

interface TeamRow {
  id: string;
  name: string;
  code: string;
}

interface MatchScoreRow {
  homeScore: number;
  awayScore: number;
  homeTeamId: string;
  awayTeamId: string;
}

interface MatchDetailRow {
  id: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  advancementWinnerId: string | null;
  matchNumber: number;
}

interface MatchIdRow {
  id: string;
  matchNumber: number;
}

interface MatrixEntry {
  advancing: string[];
  matchups: Record<string, string>;
}

type GroupKey = Record<string, { winner: string; runner: string; third: string }>;

function getMatrixMatchups(advancingGroupLetters: string[]): Record<string, string> | null {
  const sorted = [...advancingGroupLetters].sort().join(",");
  const matrix = thirdPlaceMatrix as MatrixEntry[];
  const entry = matrix.find((e) => [...e.advancing].sort().join(",") === sorted);
  return entry?.matchups ?? null;
}

function thirdFromGroup(matchups: Record<string, string>, groupKey: GroupKey, winnerGroup: string): string | null {
  const thirdGroup = matchups[winnerGroup];
  if (!thirdGroup || !groupKey[thirdGroup]) return null;
  return groupKey[thirdGroup].third;
}

const R32_R16_PAIRINGS = [
  [0, 2],   // 73 vs 75 → 89
  [1, 4],   // 74 vs 77 → 90
  [3, 5],   // 76 vs 78 → 91
  [6, 7],   // 79 vs 80 → 92
  [8, 9],   // 81 vs 82 → 93
  [10, 11], // 83 vs 84 → 94
  [12, 14], // 85 vs 87 → 95
  [13, 15], // 86 vs 88 → 96
];

async function getGroupResults(): Promise<{ groupKey: GroupKey; bestThird: string[] } | { error: string }> {
  const groups = await sql<GroupRow[]>`SELECT id, name FROM "Group" ORDER BY name`;

  const groupKey: GroupKey = {} as GroupKey;
  const thirdRanked: { teamId: string; points: number; gd: number; gf: number; group: string }[] = [];

  for (const group of groups) {
    const teams = await sql<TeamRow[]>`SELECT id, name, code FROM "Team" WHERE "groupId" = ${group.id}`;
    const letter = group.name.replace("Gruppe ", "");

    const standings = await Promise.all(teams.map(async (team) => {
      const matches = await sql<MatchScoreRow[]>`
        SELECT "homeScore", "awayScore", "homeTeamId", "awayTeamId"
        FROM "Match"
        WHERE ("homeTeamId" = ${team.id} OR "awayTeamId" = ${team.id})
          AND stage = 'GROUP'::"Stage"
          AND "homeScore" IS NOT NULL
      `;

      let pts = 0, gf = 0, ga = 0;
      for (const m of matches) {
        const isHome = m.homeTeamId === team.id;
        const s = isHome ? m.homeScore : m.awayScore;
        const c = isHome ? m.awayScore : m.homeScore;
        gf += s; ga += c;
        if (s > c) pts += 3;
        else if (s === c) pts += 1;
      }
      return { teamId: team.id, pts, gd: gf - ga, gf, played: matches.length };
    }));

    if (standings.length === 0 || standings.some((s) => s.played < 3)) {
      return { error: `Gruppe ${letter}: nicht alle Spiele beendet` };
    }

    standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    groupKey[letter] = {
      winner: standings[0].teamId,
      runner: standings[1].teamId,
      third: standings[2].teamId,
    };
    thirdRanked.push({
      teamId: standings[2].teamId,
      points: standings[2].pts,
      gd: standings[2].gd,
      gf: standings[2].gf,
      group: letter,
    });
  }

  thirdRanked.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  const bestThird = thirdRanked.slice(0, 8);

  if (bestThird.length < 8) {
    return { error: "Nicht genug Gruppendritte verfügbar" };
  }

  return { groupKey, bestThird: bestThird.map((t) => t.teamId) };
}

export async function calculateKnockoutStage() {
  // Vorhandene KO-Team-Zuordnungen löschen, damit keine stale data übrig bleibt
  await sql`UPDATE "Match" SET "homeTeamId" = NULL, "awayTeamId" = NULL WHERE stage != 'GROUP'::"Stage"`;

  const result = await getGroupResults();
  if ("error" in result) return { error: result.error };

  const { groupKey, bestThird } = result;
  const advancingGroupLetters = Object.keys(groupKey).filter((g) =>
    bestThird.includes(groupKey[g].third)
  );

  const matchups = getMatrixMatchups(advancingGroupLetters);
  if (!matchups) return { error: "Keine gültige Drittplatzierte-Matrix für diese Kombination gefunden" };

  const r32Matchups: { home: string | null; away: string | null }[] = [
    { home: groupKey.A.runner, away: groupKey.B.runner },                             // 73: 2A vs 2B
    { home: groupKey.E.winner, away: thirdFromGroup(matchups, groupKey, "E") },       // 74: 1E vs 3rd
    { home: groupKey.F.winner, away: groupKey.C.runner },                             // 75: 1F vs 2C
    { home: groupKey.C.winner, away: groupKey.F.runner },                             // 76: 1C vs 2F
    { home: groupKey.I.winner, away: thirdFromGroup(matchups, groupKey, "I") },       // 77: 1I vs 3rd
    { home: groupKey.E.runner, away: groupKey.I.runner },                             // 78: 2E vs 2I
    { home: groupKey.A.winner, away: thirdFromGroup(matchups, groupKey, "A") },       // 79: 1A vs 3rd
    { home: groupKey.L.winner, away: thirdFromGroup(matchups, groupKey, "L") },       // 80: 1L vs 3rd
    { home: groupKey.D.winner, away: thirdFromGroup(matchups, groupKey, "D") },       // 81: 1D vs 3rd
    { home: groupKey.G.winner, away: thirdFromGroup(matchups, groupKey, "G") },       // 82: 1G vs 3rd
    { home: groupKey.K.runner, away: groupKey.L.runner },                             // 83: 2K vs 2L
    { home: groupKey.H.winner, away: groupKey.J.runner },                             // 84: 1H vs 2J
    { home: groupKey.B.winner, away: thirdFromGroup(matchups, groupKey, "B") },       // 85: 1B vs 3rd
    { home: groupKey.J.winner, away: groupKey.H.runner },                             // 86: 1J vs 2H
    { home: groupKey.K.winner, away: thirdFromGroup(matchups, groupKey, "K") },       // 87: 1K vs 3rd
    { home: groupKey.D.runner, away: groupKey.G.runner },                             // 88: 2D vs 2G
  ];

  const r32Matches = await sql<MatchIdRow[]>`SELECT id FROM "Match" WHERE stage = 'ROUND_OF_32'::"Stage" ORDER BY "matchNumber"`;

  for (let i = 0; i < r32Matches.length && i < r32Matchups.length; i++) {
    const { home, away } = r32Matchups[i];
    if (home && away) {
      await sql`UPDATE "Match" SET "homeTeamId" = ${home}, "awayTeamId" = ${away} WHERE id = ${r32Matches[i].id}`;
    }
  }

  return { success: true };
}

const STAGES: { stage: string; next: string; isThirdPlace?: boolean }[] = [
  { stage: "ROUND_OF_32", next: "ROUND_OF_16" },
  { stage: "ROUND_OF_16", next: "QUARTER_FINALS" },
  { stage: "QUARTER_FINALS", next: "SEMI_FINALS" },
  { stage: "SEMI_FINALS", next: "FINAL" },
  { stage: "SEMI_FINALS", next: "THIRD_PLACE", isThirdPlace: true },
];

export async function advanceToNextRound() {
  for (const { stage, next, isThirdPlace } of STAGES) {
    const prevMatches = await sql<MatchDetailRow[]>`
      SELECT id, "homeScore", "awayScore",
             "homeTeamId", "awayTeamId",
             "advancementWinnerId", "matchNumber"
      FROM "Match"
      WHERE stage = ${stage}::"Stage"
      ORDER BY "matchNumber"
    `;

    if (prevMatches.length === 0 || prevMatches.some((m) => m.homeScore === null || m.homeTeamId === null || m.awayTeamId === null)) continue;

    const nextMatches = await sql<MatchIdRow[]>`
      SELECT id FROM "Match"
      WHERE stage = ${next}::"Stage" AND "homeTeamId" IS NULL
      ORDER BY "matchNumber"
    `;

    if (nextMatches.length === 0) continue;

    if (isThirdPlace) {
      const losers = prevMatches.map((m) => {
        const winner = getMatchWinner(m);
        return winner === m.homeTeamId ? m.awayTeamId : m.homeTeamId;
      });
      if (losers[0] && losers[1]) {
        await sql`UPDATE "Match" SET "homeTeamId" = ${losers[0]}, "awayTeamId" = ${losers[1]} WHERE id = ${nextMatches[0].id}`;
      }
    } else {
      const winners = prevMatches.map((m) => getMatchWinner(m));

      if (stage === "ROUND_OF_32") {
        for (let i = 0; i < nextMatches.length; i++) {
          const [homeIdx, awayIdx] = R32_R16_PAIRINGS[i];
          const homeId = winners[homeIdx];
          const awayId = winners[awayIdx];
          if (homeId && awayId) {
            await sql`UPDATE "Match" SET "homeTeamId" = ${homeId}, "awayTeamId" = ${awayId} WHERE id = ${nextMatches[i].id}`;
          }
        }
      } else {
        for (let i = 0; i < nextMatches.length; i++) {
          const homeId = winners[i * 2];
          const awayId = winners[i * 2 + 1];
          if (homeId && awayId) {
            await sql`UPDATE "Match" SET "homeTeamId" = ${homeId}, "awayTeamId" = ${awayId} WHERE id = ${nextMatches[i].id}`;
          }
        }
      }
    }

    return { success: true, round: next };
  }

  return { error: "Keine neue Runde berechnet" };
}
