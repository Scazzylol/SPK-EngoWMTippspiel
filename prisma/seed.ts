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

// UTC times for group stage matches (6 per group, standard pairing order)
// Order: (0v1), (2v3), (0v2), (1v3), (0v3), (1v2)
const GROUP_MATCH_TIMES: Record<string, string[]> = {
  "Gruppe A": [
    "2026-06-11T19:00:00Z", // MEX vs RSA
    "2026-06-12T02:00:00Z", // KOR vs CZE
    "2026-06-19T01:00:00Z", // MEX vs KOR
    "2026-06-18T16:00:00Z", // RSA vs CZE
    "2026-06-25T01:00:00Z", // MEX vs CZE
    "2026-06-25T01:00:00Z", // RSA vs KOR
  ],
  "Gruppe B": [
    "2026-06-12T19:00:00Z", // CAN vs BIH
    "2026-06-13T19:00:00Z", // QAT vs SUI
    "2026-06-18T22:00:00Z", // CAN vs QAT
    "2026-06-18T19:00:00Z", // BIH vs SUI
    "2026-06-24T19:00:00Z", // CAN vs SUI
    "2026-06-24T19:00:00Z", // BIH vs QAT
  ],
  "Gruppe C": [
    "2026-06-13T22:00:00Z", // BRA vs MAR
    "2026-06-14T01:00:00Z", // HAI vs SCO
    "2026-06-20T00:30:00Z", // BRA vs HAI
    "2026-06-19T22:00:00Z", // MAR vs SCO
    "2026-06-24T22:00:00Z", // BRA vs SCO
    "2026-06-24T22:00:00Z", // MAR vs HAI
  ],
  "Gruppe D": [
    "2026-06-13T01:00:00Z", // USA vs PAR
    "2026-06-14T16:00:00Z", // AUS vs TUR
    "2026-06-19T19:00:00Z", // USA vs AUS
    "2026-06-20T03:00:00Z", // PAR vs TUR
    "2026-06-26T02:00:00Z", // USA vs TUR
    "2026-06-26T02:00:00Z", // PAR vs AUS
  ],
  "Gruppe E": [
    "2026-06-14T17:00:00Z", // GER vs CUW
    "2026-06-14T23:00:00Z", // CIV vs ECU
    "2026-06-20T20:00:00Z", // GER vs CIV
    "2026-06-21T00:00:00Z", // CUW vs ECU
    "2026-06-25T20:00:00Z", // GER vs ECU
    "2026-06-25T20:00:00Z", // CUW vs CIV
  ],
  "Gruppe F": [
    "2026-06-14T20:00:00Z", // NED vs JPN
    "2026-06-15T02:00:00Z", // SWE vs TUN
    "2026-06-20T17:00:00Z", // NED vs SWE
    "2026-06-21T04:00:00Z", // JPN vs TUN
    "2026-06-25T23:00:00Z", // NED vs TUN
    "2026-06-25T23:00:00Z", // JPN vs SWE
  ],
  "Gruppe G": [
    "2026-06-15T19:00:00Z", // BEL vs EGY
    "2026-06-16T01:00:00Z", // IRN vs NZL
    "2026-06-21T19:00:00Z", // BEL vs IRN
    "2026-06-22T01:00:00Z", // EGY vs NZL
    "2026-06-27T03:00:00Z", // BEL vs NZL
    "2026-06-27T03:00:00Z", // EGY vs IRN
  ],
  "Gruppe H": [
    "2026-06-15T16:00:00Z", // ESP vs CPV
    "2026-06-15T22:00:00Z", // KSA vs URU
    "2026-06-21T16:00:00Z", // ESP vs KSA
    "2026-06-21T22:00:00Z", // CPV vs URU
    "2026-06-27T00:00:00Z", // ESP vs URU
    "2026-06-27T00:00:00Z", // CPV vs KSA
  ],
  "Gruppe I": [
    "2026-06-16T19:00:00Z", // FRA vs SEN
    "2026-06-16T22:00:00Z", // IRQ vs NOR
    "2026-06-22T21:00:00Z", // FRA vs IRQ
    "2026-06-23T00:00:00Z", // SEN vs NOR
    "2026-06-26T19:00:00Z", // FRA vs NOR
    "2026-06-26T19:00:00Z", // SEN vs IRQ
  ],
  "Gruppe J": [
    "2026-06-17T01:00:00Z", // ARG vs ALG
    "2026-06-17T04:00:00Z", // AUT vs JOR
    "2026-06-22T17:00:00Z", // ARG vs AUT
    "2026-06-23T03:00:00Z", // ALG vs JOR
    "2026-06-28T02:00:00Z", // ARG vs JOR
    "2026-06-28T02:00:00Z", // ALG vs AUT
  ],
  "Gruppe K": [
    "2026-06-17T17:00:00Z", // POR vs COD
    "2026-06-18T02:00:00Z", // UZB vs COL
    "2026-06-23T17:00:00Z", // POR vs UZB
    "2026-06-24T02:00:00Z", // COD vs COL
    "2026-06-28T03:30:00Z", // POR vs COL
    "2026-06-28T03:30:00Z", // COD vs UZB
  ],
  "Gruppe L": [
    "2026-06-17T20:00:00Z", // ENG vs CRO
    "2026-06-17T23:00:00Z", // GHA vs PAN
    "2026-06-23T20:00:00Z", // ENG vs GHA
    "2026-06-23T23:00:00Z", // CRO vs PAN
    "2026-06-27T21:00:00Z", // ENG vs PAN
    "2026-06-27T21:00:00Z", // CRO vs GHA
  ],
};

// UTC times for knockout matches (matchNumber order 73-104)
const KNOCKOUT_MATCHES = [
  // Round of 32 (Jun 28 - Jul 4)
  { stage: Stage.ROUND_OF_32, time: "2026-06-29T02:00:00Z" },  // #73
  { stage: Stage.ROUND_OF_32, time: "2026-06-30T00:30:00Z" },  // #74
  { stage: Stage.ROUND_OF_32, time: "2026-06-30T07:00:00Z" },  // #75
  { stage: Stage.ROUND_OF_32, time: "2026-06-29T22:00:00Z" },  // #76
  { stage: Stage.ROUND_OF_32, time: "2026-07-01T01:00:00Z" },  // #77
  { stage: Stage.ROUND_OF_32, time: "2026-06-30T22:00:00Z" },  // #78
  { stage: Stage.ROUND_OF_32, time: "2026-07-01T07:00:00Z" },  // #79
  { stage: Stage.ROUND_OF_32, time: "2026-07-01T20:00:00Z" },  // #80
  { stage: Stage.ROUND_OF_32, time: "2026-07-02T03:00:00Z" },  // #82
  { stage: Stage.ROUND_OF_32, time: "2026-07-02T07:00:00Z" },  // #81
  { stage: Stage.ROUND_OF_32, time: "2026-07-03T02:00:00Z" },  // #84
  { stage: Stage.ROUND_OF_32, time: "2026-07-03T03:00:00Z" },  // #83
  { stage: Stage.ROUND_OF_32, time: "2026-07-03T10:00:00Z" },  // #85
  { stage: Stage.ROUND_OF_32, time: "2026-07-03T23:00:00Z" },  // #88
  { stage: Stage.ROUND_OF_32, time: "2026-07-04T02:00:00Z" },  // #86
  { stage: Stage.ROUND_OF_32, time: "2026-07-04T06:30:00Z" },  // #87
  // Round of 16 (Jul 4 - Jul 7)
  { stage: Stage.ROUND_OF_16, time: "2026-07-04T22:00:00Z" },  // #90
  { stage: Stage.ROUND_OF_16, time: "2026-07-05T01:00:00Z" },  // #89
  { stage: Stage.ROUND_OF_16, time: "2026-07-06T00:00:00Z" },  // #91
  { stage: Stage.ROUND_OF_16, time: "2026-07-06T06:00:00Z" },  // #92
  { stage: Stage.ROUND_OF_16, time: "2026-07-07T00:00:00Z" },  // #93
  { stage: Stage.ROUND_OF_16, time: "2026-07-07T07:00:00Z" },  // #94
  { stage: Stage.ROUND_OF_16, time: "2026-07-07T20:00:00Z" },  // #95
  { stage: Stage.ROUND_OF_16, time: "2026-07-08T03:00:00Z" },  // #96
  // Quarter-finals (Jul 9 - Jul 12)
  { stage: Stage.QUARTER_FINALS, time: "2026-07-10T00:00:00Z" },  // #97
  { stage: Stage.QUARTER_FINALS, time: "2026-07-11T02:00:00Z" },  // #98
  { stage: Stage.QUARTER_FINALS, time: "2026-07-12T01:00:00Z" },  // #99
  { stage: Stage.QUARTER_FINALS, time: "2026-07-12T06:00:00Z" },  // #100
  // Semi-finals (Jul 14 - Jul 15)
  { stage: Stage.SEMI_FINALS, time: "2026-07-15T00:00:00Z" },  // #101
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
