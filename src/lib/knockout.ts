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

const R32_R16_PAIRINGS = [
  [1, 4],   // W74 vs W77 → 89
  [0, 2],   // W73 vs W75 → 90
  [3, 5],   // W76 vs W78 → 91
  [6, 7],   // W79 vs W80 → 92
  [10, 11], // W83 vs W84 → 93
  [8, 9],   // W81 vs W82 → 94
  [13, 15], // W86 vs W88 → 95
  [12, 14], // W85 vs W87 → 96
];

const R16_QF_PAIRINGS = [
  [0, 1],   // W89 vs W90 → 97
  [4, 5],   // W93 vs W94 → 98
  [2, 3],   // W91 vs W92 → 99
  [6, 7],   // W95 vs W96 → 100
];

export async function calculateKnockoutStage() {
  await sql`UPDATE "Match" SET "homeTeamId" = NULL, "awayTeamId" = NULL WHERE stage != 'GROUP'::"Stage"`;

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

    if (standings.some((s) => s.played < 3)) continue;

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

  const allGroupsComplete = Object.keys(groupKey).length === 12;
  let matchups: Record<string, string> | null = null;

  if (allGroupsComplete) {
    thirdRanked.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    const bestThird = thirdRanked.slice(0, 8).map((t) => t.teamId);

    const advancingGroupLetters = Object.keys(groupKey).filter((g) =>
      bestThird.includes(groupKey[g].third)
    );

    matchups = getMatrixMatchups(advancingGroupLetters);
  }

  function grp(l: string): { winner: string; runner: string; third: string } | undefined {
    return groupKey[l as keyof typeof groupKey];
  }

  const r32Matchups: { home: string | null; away: string | null }[] = [
    { home: grp("A")?.runner ?? null, away: grp("B")?.runner ?? null },
    { home: grp("E")?.winner ?? null, away: matchups ? grp(matchups.E)?.third ?? null : null },
    { home: grp("F")?.winner ?? null, away: grp("C")?.runner ?? null },
    { home: grp("C")?.winner ?? null, away: grp("F")?.runner ?? null },
    { home: grp("I")?.winner ?? null, away: matchups ? grp(matchups.I)?.third ?? null : null },
    { home: grp("E")?.runner ?? null, away: grp("I")?.runner ?? null },
    { home: grp("A")?.winner ?? null, away: matchups ? grp(matchups.A)?.third ?? null : null },
    { home: grp("L")?.winner ?? null, away: matchups ? grp(matchups.L)?.third ?? null : null },
    { home: grp("D")?.winner ?? null, away: matchups ? grp(matchups.D)?.third ?? null : null },
    { home: grp("G")?.winner ?? null, away: matchups ? grp(matchups.G)?.third ?? null : null },
    { home: grp("K")?.runner ?? null, away: grp("L")?.runner ?? null },
    { home: grp("H")?.winner ?? null, away: grp("J")?.runner ?? null },
    { home: grp("B")?.winner ?? null, away: matchups ? grp(matchups.B)?.third ?? null : null },
    { home: grp("J")?.winner ?? null, away: grp("H")?.runner ?? null },
    { home: grp("K")?.winner ?? null, away: matchups ? grp(matchups.K)?.third ?? null : null },
    { home: grp("D")?.runner ?? null, away: grp("G")?.runner ?? null },
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

      const pairings = stage === "ROUND_OF_32" ? R32_R16_PAIRINGS
        : stage === "ROUND_OF_16" ? R16_QF_PAIRINGS
        : null;

      if (pairings) {
        for (let i = 0; i < nextMatches.length; i++) {
          const [homeIdx, awayIdx] = pairings[i];
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
