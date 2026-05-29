import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Stage } from "../src/generated/prisma/enums";

const pgAdapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter: pgAdapter });

interface TeamData {
  name: string;
  code: string;
  group: string;
}

const FLAG_EMOJIS: Record<string, string> = {
  MEX: "🇲🇽", RSA: "🇿🇦", KOR: "🇰🇷", CZE: "🇨🇿",
  CAN: "🇨🇦", BIH: "🇧🇦", QAT: "🇶🇦", SUI: "🇨🇭",
  BRA: "🇧🇷", MAR: "🇲🇦", HAI: "🇭🇹", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA: "🇺🇸", PAR: "🇵🇾", AUS: "🇦🇺", TUR: "🇹🇷",
  GER: "🇩🇪", CUW: "🇨🇼", CIV: "🇨🇮", ECU: "🇪🇨",
  NED: "🇳🇱", JPN: "🇯🇵", SWE: "🇸🇪", TUN: "🇹🇳",
  BEL: "🇧🇪", EGY: "🇪🇬", IRN: "🇮🇷", NZL: "🇳🇿",
  ESP: "🇪🇸", CPV: "🇨🇻", KSA: "🇸🇦", URU: "🇺🇾",
  FRA: "🇫🇷", SEN: "🇸🇳", IRQ: "🇮🇶", NOR: "🇳🇴",
  ARG: "🇦🇷", ALG: "🇩🇿", AUT: "🇦🇹", JOR: "🇯🇴",
  POR: "🇵🇹", COD: "🇨🇩", UZB: "🇺🇿", COL: "🇨🇴",
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", CRO: "🇭🇷", GHA: "🇬🇭", PAN: "🇵🇦",
};

const teams: TeamData[] = [
  // Gruppe A
  { name: "Mexiko", code: "MEX", group: "Gruppe A" },
  { name: "Südafrika", code: "RSA", group: "Gruppe A" },
  { name: "Südkorea", code: "KOR", group: "Gruppe A" },
  { name: "Tschechien", code: "CZE", group: "Gruppe A" },
  // Gruppe B
  { name: "Kanada", code: "CAN", group: "Gruppe B" },
  { name: "Bosnien-Herzegowina", code: "BIH", group: "Gruppe B" },
  { name: "Katar", code: "QAT", group: "Gruppe B" },
  { name: "Schweiz", code: "SUI", group: "Gruppe B" },
  // Gruppe C
  { name: "Brasilien", code: "BRA", group: "Gruppe C" },
  { name: "Marokko", code: "MAR", group: "Gruppe C" },
  { name: "Haiti", code: "HAI", group: "Gruppe C" },
  { name: "Schottland", code: "SCO", group: "Gruppe C" },
  // Gruppe D
  { name: "USA", code: "USA", group: "Gruppe D" },
  { name: "Paraguay", code: "PAR", group: "Gruppe D" },
  { name: "Australien", code: "AUS", group: "Gruppe D" },
  { name: "Türkiye", code: "TUR", group: "Gruppe D" },
  // Gruppe E
  { name: "Deutschland", code: "GER", group: "Gruppe E" },
  { name: "Curaçao", code: "CUW", group: "Gruppe E" },
  { name: "Elfenbeinküste", code: "CIV", group: "Gruppe E" },
  { name: "Ecuador", code: "ECU", group: "Gruppe E" },
  // Gruppe F
  { name: "Niederlande", code: "NED", group: "Gruppe F" },
  { name: "Japan", code: "JPN", group: "Gruppe F" },
  { name: "Schweden", code: "SWE", group: "Gruppe F" },
  { name: "Tunesien", code: "TUN", group: "Gruppe F" },
  // Gruppe G
  { name: "Belgien", code: "BEL", group: "Gruppe G" },
  { name: "Ägypten", code: "EGY", group: "Gruppe G" },
  { name: "Iran", code: "IRN", group: "Gruppe G" },
  { name: "Neuseeland", code: "NZL", group: "Gruppe G" },
  // Gruppe H
  { name: "Spanien", code: "ESP", group: "Gruppe H" },
  { name: "Cabo Verde", code: "CPV", group: "Gruppe H" },
  { name: "Saudi-Arabien", code: "KSA", group: "Gruppe H" },
  { name: "Uruguay", code: "URU", group: "Gruppe H" },
  // Gruppe I
  { name: "Frankreich", code: "FRA", group: "Gruppe I" },
  { name: "Senegal", code: "SEN", group: "Gruppe I" },
  { name: "Irak", code: "IRQ", group: "Gruppe I" },
  { name: "Norwegen", code: "NOR", group: "Gruppe I" },
  // Gruppe J
  { name: "Argentinien", code: "ARG", group: "Gruppe J" },
  { name: "Algerien", code: "ALG", group: "Gruppe J" },
  { name: "Österreich", code: "AUT", group: "Gruppe J" },
  { name: "Jordanien", code: "JOR", group: "Gruppe J" },
  // Gruppe K
  { name: "Portugal", code: "POR", group: "Gruppe K" },
  { name: "Kongo DR", code: "COD", group: "Gruppe K" },
  { name: "Usbekistan", code: "UZB", group: "Gruppe K" },
  { name: "Kolumbien", code: "COL", group: "Gruppe K" },
  // Gruppe L
  { name: "England", code: "ENG", group: "Gruppe L" },
  { name: "Kroatien", code: "CRO", group: "Gruppe L" },
  { name: "Ghana", code: "GHA", group: "Gruppe L" },
  { name: "Panama", code: "PAN", group: "Gruppe L" },
];

// UTC times for group stage matches (6 per group)
// Order: (0v1), (2v3), (0v2), (1v3), (0v3), (1v2)
const GROUP_MATCH_TIMES: Record<string, string[]> = {
  "Gruppe A": [
    "2026-06-12T01:00:00Z", // MEX vs RSA (Thu Jun 11, 19:00 CST)
    "2026-06-12T08:00:00Z", // KOR vs CZE (Fri Jun 12, 02:00 CST)
    "2026-06-18T20:00:00Z", // CZE vs RSA (Thu Jun 18, 16:00 EDT)
    "2026-06-19T07:00:00Z", // MEX vs KOR (Fri Jun 19, 01:00 CST)
    "2026-06-25T07:00:00Z", // CZE vs MEX (Thu Jun 25, 01:00 CST)
    "2026-06-25T07:00:00Z", // RSA vs KOR (Thu Jun 25, 01:00 CST)
  ],
  "Gruppe B": [
    "2026-06-13T01:00:00Z", // CAN vs BIH (Fri Jun 12, 19:00 EDT)
    "2026-06-14T02:00:00Z", // QAT vs SUI (Sat Jun 13, 19:00 PDT)
    "2026-06-19T02:00:00Z", // SUI vs BIH (Thu Jun 18, 19:00 PDT)
    "2026-06-19T05:00:00Z", // CAN vs QAT (Thu Jun 18, 22:00 PDT)
    "2026-06-25T02:00:00Z", // SUI vs CAN (Wed Jun 24, 19:00 PDT)
    "2026-06-25T02:00:00Z", // BIH vs QAT (Wed Jun 24, 19:00 PDT)
  ],
  "Gruppe C": [
    "2026-06-14T01:00:00Z", // BRA vs MAR (Sat Jun 13, 22:00 EDT)
    "2026-06-14T05:00:00Z", // HAI vs SCO (Sun Jun 14, 01:00 EDT)
    "2026-06-20T04:30:00Z", // BRA vs HAI (Fri Jun 19, 00:30 EDT)
    "2026-06-20T06:00:00Z", // SCO vs MAR (Fri Jun 19, 22:00 EDT)
    "2026-06-25T02:00:00Z", // SCO vs BRA (Wed Jun 24, 22:00 EDT)
    "2026-06-25T02:00:00Z", // MAR vs HAI (Wed Jun 24, 22:00 EDT)
  ],
  "Gruppe D": [
    "2026-06-13T05:00:00Z", // USA vs PAR (Sat Jun 13, 01:00 EDT)
    "2026-06-14T08:00:00Z", // AUS vs TUR (Sun Jun 14, 04:00 PDT)
    "2026-06-20T02:00:00Z", // USA vs AUS (Fri Jun 19, 19:00 PDT)
    "2026-06-20T07:00:00Z", // TUR vs PAR (Sat Jun 20, 03:00 PDT)
    "2026-06-26T06:00:00Z", // TUR vs USA (Fri Jun 26, 02:00 PDT)
    "2026-06-26T06:00:00Z", // PAR vs AUS (Fri Jun 26, 02:00 PDT)
  ],
  "Gruppe E": [
    "2026-06-14T21:00:00Z", // GER vs CUW (Sun Jun 14, 17:00 EDT)
    "2026-06-15T03:00:00Z", // CIV vs ECU (Sun Jun 14, 23:00 EDT)
    "2026-06-21T00:00:00Z", // GER vs CIV (Sat Jun 20, 20:00 EDT)
    "2026-06-21T04:00:00Z", // ECU vs CUW (Sun Jun 21, 00:00 CDT)
    "2026-06-26T00:00:00Z", // CUW vs CIV (Thu Jun 25, 20:00 EDT)
    "2026-06-26T00:00:00Z", // ECU vs GER (Thu Jun 25, 20:00 EDT)
  ],
  "Gruppe F": [
    "2026-06-15T00:00:00Z", // NED vs JPN (Sun Jun 14, 20:00 CDT)
    "2026-06-15T06:00:00Z", // SWE vs TUN (Mon Jun 15, 02:00 CST)
    "2026-06-20T21:00:00Z", // NED vs SWE (Sat Jun 20, 17:00 CDT)
    "2026-06-21T08:00:00Z", // TUN vs JPN (Sun Jun 21, 04:00 CST)
    "2026-06-26T03:00:00Z", // JPN vs SWE (Thu Jun 25, 23:00 CDT)
    "2026-06-26T03:00:00Z", // TUN vs NED (Thu Jun 25, 23:00 CDT)
  ],
  "Gruppe G": [
    "2026-06-15T23:00:00Z", // BEL vs EGY (Mon Jun 15, 19:00 PDT)
    "2026-06-16T05:00:00Z", // IRN vs NZL (Tue Jun 16, 01:00 EDT)
    "2026-06-21T23:00:00Z", // BEL vs IRN (Sun Jun 21, 19:00 PDT)
    "2026-06-22T05:00:00Z", // NZL vs EGY (Mon Jun 22, 01:00 PDT)
    "2026-06-27T07:00:00Z", // EGY vs IRN (Sat Jun 27, 03:00 PDT)
    "2026-06-27T07:00:00Z", // NZL vs BEL (Sat Jun 27, 03:00 PDT)
  ],
  "Gruppe H": [
    "2026-06-15T20:00:00Z", // ESP vs CPV (Mon Jun 15, 16:00 EDT)
    "2026-06-16T02:00:00Z", // KSA vs URU (Mon Jun 15, 22:00 EDT)
    "2026-06-21T20:00:00Z", // ESP vs KSA (Sun Jun 21, 16:00 EDT)
    "2026-06-22T02:00:00Z", // URU vs CPV (Sun Jun 21, 22:00 EDT)
    "2026-06-27T04:00:00Z", // CPV vs KSA (Sat Jun 27, 00:00 CDT)
    "2026-06-27T04:00:00Z", // URU vs ESP (Sat Jun 27, 00:00 CST)
  ],
  "Gruppe I": [
    "2026-06-16T23:00:00Z", // FRA vs SEN (Tue Jun 16, 19:00 EDT)
    "2026-06-17T02:00:00Z", // IRQ vs NOR (Tue Jun 16, 22:00 EDT)
    "2026-06-23T01:00:00Z", // FRA vs IRQ (Mon Jun 22, 21:00 EDT)
    "2026-06-23T04:00:00Z", // NOR vs SEN (Tue Jun 23, 00:00 EDT)
    "2026-06-26T23:00:00Z", // NOR vs FRA (Fri Jun 26, 19:00 EDT)
    "2026-06-26T23:00:00Z", // SEN vs IRQ (Fri Jun 26, 19:00 EDT)
  ],
  "Gruppe J": [
    "2026-06-17T05:00:00Z", // ARG vs ALG (Wed Jun 17, 01:00 CDT)
    "2026-06-17T08:00:00Z", // AUT vs JOR (Wed Jun 17, 04:00 PDT)
    "2026-06-22T21:00:00Z", // ARG vs AUT (Mon Jun 22, 17:00 CDT)
    "2026-06-23T07:00:00Z", // JOR vs ALG (Tue Jun 23, 03:00 PDT)
    "2026-06-28T06:00:00Z", // ALG vs AUT (Sun Jun 28, 02:00 CDT)
    "2026-06-28T06:00:00Z", // JOR vs ARG (Sun Jun 28, 02:00 CDT)
  ],
  "Gruppe K": [
    "2026-06-17T21:00:00Z", // POR vs COD (Wed Jun 17, 17:00 CDT)
    "2026-06-18T06:00:00Z", // UZB vs COL (Thu Jun 18, 02:00 CST)
    "2026-06-23T21:00:00Z", // POR vs UZB (Tue Jun 23, 17:00 CDT)
    "2026-06-24T06:00:00Z", // COL vs COD (Wed Jun 24, 02:00 CST)
    "2026-06-28T03:30:00Z", // COL vs POR (Sat Jun 27, 23:30 EDT)
    "2026-06-28T03:30:00Z", // COD vs UZB (Sat Jun 27, 23:30 EDT)
  ],
  "Gruppe L": [
    "2026-06-18T00:00:00Z", // ENG vs CRO (Wed Jun 17, 20:00 CDT)
    "2026-06-18T03:00:00Z", // GHA vs PAN (Wed Jun 17, 23:00 EDT)
    "2026-06-24T00:00:00Z", // ENG vs GHA (Tue Jun 23, 20:00 EDT)
    "2026-06-24T03:00:00Z", // PAN vs CRO (Tue Jun 23, 23:00 EDT)
    "2026-06-28T01:00:00Z", // PAN vs ENG (Sat Jun 27, 21:00 EDT)
    "2026-06-28T01:00:00Z", // CRO vs GHA (Sat Jun 27, 21:00 EDT)
  ],
};

// UTC times for knockout matches
const KNOCKOUT_MATCHES = [
  // Round of 32 (Jun 28 - Jul 4)
  { stage: Stage.ROUND_OF_32, time: "2026-06-29T02:00:00Z" },  // #73
  { stage: Stage.ROUND_OF_32, time: "2026-06-29T21:00:00Z" },  // #76
  { stage: Stage.ROUND_OF_32, time: "2026-06-30T00:30:00Z" },  // #74
  { stage: Stage.ROUND_OF_32, time: "2026-06-30T05:00:00Z" },  // #75
  { stage: Stage.ROUND_OF_32, time: "2026-06-30T21:00:00Z" },  // #78
  { stage: Stage.ROUND_OF_32, time: "2026-07-01T01:00:00Z" },  // #77
  { stage: Stage.ROUND_OF_32, time: "2026-07-01T05:00:00Z" },  // #79
  { stage: Stage.ROUND_OF_32, time: "2026-07-01T20:00:00Z" },  // #80
  { stage: Stage.ROUND_OF_32, time: "2026-07-02T00:00:00Z" },  // #82
  { stage: Stage.ROUND_OF_32, time: "2026-07-02T04:00:00Z" },  // #81
  { stage: Stage.ROUND_OF_32, time: "2026-07-02T23:00:00Z" },  // #84
  { stage: Stage.ROUND_OF_32, time: "2026-07-03T03:00:00Z" },  // #83
  { stage: Stage.ROUND_OF_32, time: "2026-07-03T07:00:00Z" },  // #85
  { stage: Stage.ROUND_OF_32, time: "2026-07-03T22:00:00Z" },  // #88
  { stage: Stage.ROUND_OF_32, time: "2026-07-04T02:00:00Z" },  // #86
  { stage: Stage.ROUND_OF_32, time: "2026-07-04T05:30:00Z" },  // #87
  // Round of 16 (Jul 4 - Jul 7)
  { stage: Stage.ROUND_OF_16, time: "2026-07-04T21:00:00Z" },  // #90
  { stage: Stage.ROUND_OF_16, time: "2026-07-05T01:00:00Z" },  // #89
  { stage: Stage.ROUND_OF_16, time: "2026-07-06T00:00:00Z" },  // #91
  { stage: Stage.ROUND_OF_16, time: "2026-07-06T04:00:00Z" },  // #92
  { stage: Stage.ROUND_OF_16, time: "2026-07-06T23:00:00Z" },  // #93
  { stage: Stage.ROUND_OF_16, time: "2026-07-07T04:00:00Z" },  // #94
  { stage: Stage.ROUND_OF_16, time: "2026-07-07T20:00:00Z" },  // #95
  { stage: Stage.ROUND_OF_16, time: "2026-07-08T00:00:00Z" },  // #96
  // Quarter-finals (Jul 9 - Jul 12)
  { stage: Stage.QUARTER_FINALS, time: "2026-07-10T00:00:00Z" },  // #97
  { stage: Stage.QUARTER_FINALS, time: "2026-07-11T02:00:00Z" },  // #98
  { stage: Stage.QUARTER_FINALS, time: "2026-07-12T01:00:00Z" },  // #99
  { stage: Stage.QUARTER_FINALS, time: "2026-07-12T05:00:00Z" },  // #100
  // Semi-finals (Jul 14 - Jul 15)
  { stage: Stage.SEMI_FINALS, time: "2026-07-14T23:00:00Z" },  // #101
  { stage: Stage.SEMI_FINALS, time: "2026-07-15T23:00:00Z" },  // #102
  // Third place (Jul 18)
  { stage: Stage.THIRD_PLACE, time: "2026-07-19T01:00:00Z" },  // #103
  // Final (Jul 19)
  { stage: Stage.FINAL, time: "2026-07-19T23:00:00Z" },  // #104
];

async function main() {
  console.log("Seeding database...");

  // Clean slate
  await prisma.prediction.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.group.deleteMany({});

  const groupNames = Object.keys(GROUP_MATCH_TIMES);
  const createdGroups: Record<string, string> = {};

  for (const groupName of groupNames) {
    const group = await prisma.group.create({
      data: { name: groupName },
    });
    createdGroups[groupName] = group.id;
  }

  console.log(`Created ${groupNames.length} groups`);

  for (const teamData of teams) {
    await prisma.team.create({
      data: {
        name: teamData.name,
        code: teamData.code,
        groupId: createdGroups[teamData.group],
        flagEmoji: FLAG_EMOJIS[teamData.code],
      },
    });
  }

  console.log(`Created ${teams.length} teams`);

  const groupMatchPairs: [number, number][] = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2]
  ];

  let matchNumber = 1;

  for (const groupName of groupNames) {
    const groupTeams = await prisma.team.findMany({
      where: { groupId: createdGroups[groupName] },
    });

    if (groupTeams.length !== 4) continue;

    const times = GROUP_MATCH_TIMES[groupName];

    for (let idx = 0; idx < groupMatchPairs.length; idx++) {
      const [homeIdx, awayIdx] = groupMatchPairs[idx];
      const homeTeam = groupTeams[homeIdx];
      const awayTeam = groupTeams[awayIdx];

      await prisma.match.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          groupId: createdGroups[groupName],
          stage: Stage.GROUP,
          matchNumber: matchNumber++,
          startTime: new Date(times[idx]),
        },
      });
    }
  }

  console.log(`Created ${matchNumber - 1} group stage matches`);

  for (const { stage, time } of KNOCKOUT_MATCHES) {
    await prisma.match.create({
      data: {
        stage,
        matchNumber: matchNumber++,
        startTime: new Date(time),
        isLocked: false,
      },
    });
  }

  console.log(`Created ${KNOCKOUT_MATCHES.length} knockout matches`);
  console.log(`Total matches: ${matchNumber - 1}`);
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
