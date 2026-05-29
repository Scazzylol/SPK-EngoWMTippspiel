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
  USA: "🇺🇸", ESP: "🇪🇸", MAR: "🇲🇦", ZIM: "🇿🇼",
  ARG: "🇦🇷", CAN: "🇨🇦", COL: "🇨🇴", NGA: "🇳🇬",
  MEX: "🇲🇽", BRA: "🇧🇷", JPN: "🇯🇵", CRC: "🇨🇷",
  FRA: "🇫🇷", UKR: "🇺🇦", SEN: "🇸🇳", AUS: "🇦🇺",
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", SRB: "🇷🇸", IRQ: "🇮🇶", ECU: "🇪🇨",
  GER: "🇩🇪", SUI: "🇨🇭", PAR: "🇵🇾", HON: "🇭🇳",
  POR: "🇵🇹", ITA: "🇮🇹", KOR: "🇰🇷", PAN: "🇵🇦",
  NED: "🇳🇱", DEN: "🇩🇰", URU: "🇺🇾", MLI: "🇲🇱",
  BEL: "🇧🇪", AUT: "🇦🇹", IRN: "🇮🇷", JAM: "🇯🇲",
  POL: "🇵🇱", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", KSA: "🇸🇦", ISL: "🇮🇸",
  CRO: "🇭🇷", SWE: "🇸🇪", UZB: "🇺🇿", EGY: "🇪🇬",
  GEO: "🇬🇪", ROU: "🇷🇴", BIH: "🇧🇦", CHA: "🇹🇩",
};

const teams: TeamData[] = [
  // Gruppe A
  { name: "USA", code: "USA", group: "Gruppe A" },
  { name: "Spanien", code: "ESP", group: "Gruppe A" },
  { name: "Marokko", code: "MAR", group: "Gruppe A" },
  { name: "Simbabwe", code: "ZIM", group: "Gruppe A" },
  // Gruppe B
  { name: "Argentinien", code: "ARG", group: "Gruppe B" },
  { name: "Kanada", code: "CAN", group: "Gruppe B" },
  { name: "Kolumbien", code: "COL", group: "Gruppe B" },
  { name: "Nigeria", code: "NGA", group: "Gruppe B" },
  // Gruppe C
  { name: "Mexiko", code: "MEX", group: "Gruppe C" },
  { name: "Brasilien", code: "BRA", group: "Gruppe C" },
  { name: "Japan", code: "JPN", group: "Gruppe C" },
  { name: "Costa Rica", code: "CRC", group: "Gruppe C" },
  // Gruppe D
  { name: "Frankreich", code: "FRA", group: "Gruppe D" },
  { name: "Ukraine", code: "UKR", group: "Gruppe D" },
  { name: "Senegal", code: "SEN", group: "Gruppe D" },
  { name: "Australien", code: "AUS", group: "Gruppe D" },
  // Gruppe E
  { name: "England", code: "ENG", group: "Gruppe E" },
  { name: "Serbien", code: "SRB", group: "Gruppe E" },
  { name: "Irak", code: "IRQ", group: "Gruppe E" },
  { name: "Ecuador", code: "ECU", group: "Gruppe E" },
  // Gruppe F
  { name: "Deutschland", code: "GER", group: "Gruppe F" },
  { name: "Schweiz", code: "SUI", group: "Gruppe F" },
  { name: "Paraguay", code: "PAR", group: "Gruppe F" },
  { name: "Honduras", code: "HON", group: "Gruppe F" },
  // Gruppe G
  { name: "Portugal", code: "POR", group: "Gruppe G" },
  { name: "Italien", code: "ITA", group: "Gruppe G" },
  { name: "Südkorea", code: "KOR", group: "Gruppe G" },
  { name: "Panama", code: "PAN", group: "Gruppe G" },
  // Gruppe H
  { name: "Niederlande", code: "NED", group: "Gruppe H" },
  { name: "Dänemark", code: "DEN", group: "Gruppe H" },
  { name: "Uruguay", code: "URU", group: "Gruppe H" },
  { name: "Mali", code: "MLI", group: "Gruppe H" },
  // Gruppe I
  { name: "Belgien", code: "BEL", group: "Gruppe I" },
  { name: "Österreich", code: "AUT", group: "Gruppe I" },
  { name: "Iran", code: "IRN", group: "Gruppe I" },
  { name: "Jamaika", code: "JAM", group: "Gruppe I" },
  // Gruppe J
  { name: "Polen", code: "POL", group: "Gruppe J" },
  { name: "Schottland", code: "SCO", group: "Gruppe J" },
  { name: "Saudi-Arabien", code: "KSA", group: "Gruppe J" },
  { name: "Island", code: "ISL", group: "Gruppe J" },
  // Gruppe K
  { name: "Kroatien", code: "CRO", group: "Gruppe K" },
  { name: "Schweden", code: "SWE", group: "Gruppe K" },
  { name: "Usbekistan", code: "UZB", group: "Gruppe K" },
  { name: "Ägypten", code: "EGY", group: "Gruppe K" },
  // Gruppe L
  { name: "Georgien", code: "GEO", group: "Gruppe L" },
  { name: "Rumänien", code: "ROU", group: "Gruppe L" },
  { name: "Bosnien-Herzegowina", code: "BIH", group: "Gruppe L" },
  { name: "Tschad", code: "CHA", group: "Gruppe L" },
];

async function main() {
  console.log("Seeding database...");

  const groups = ["Gruppe A", "Gruppe B", "Gruppe C", "Gruppe D", "Gruppe E", "Gruppe F", "Gruppe G", "Gruppe H", "Gruppe I", "Gruppe J", "Gruppe K", "Gruppe L"];
  const createdGroups: Record<string, string> = {};

  for (const groupName of groups) {
    const group = await prisma.group.upsert({
      where: { name: groupName },
      update: {},
      create: { name: groupName },
    });
    createdGroups[groupName] = group.id;
  }

  console.log(`Created ${groups.length} groups`);

  for (const teamData of teams) {
    await prisma.team.upsert({
      where: { code: teamData.code },
      update: {
        name: teamData.name,
        groupId: createdGroups[teamData.group],
        flagEmoji: FLAG_EMOJIS[teamData.code],
      },
      create: {
        name: teamData.name,
        code: teamData.code,
        groupId: createdGroups[teamData.group],
        flagEmoji: FLAG_EMOJIS[teamData.code],
      },
    });
  }

  console.log(`Created/updated ${teams.length} teams`);

  const groupMatchPairs: [number, number][] = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2]
  ];

  let matchNumber = 1;
  const startDate = new Date("2026-06-11T18:00:00Z");

  for (let g = 0; g < groups.length; g++) {
    const groupName = groups[g];
    const groupTeams = await prisma.team.findMany({
      where: { groupId: createdGroups[groupName] },
    });

    if (groupTeams.length !== 4) continue;

    for (const [homeIdx, awayIdx] of groupMatchPairs) {
      const homeTeam = groupTeams[homeIdx];
      const awayTeam = groupTeams[awayIdx];

      await prisma.match.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          groupId: createdGroups[groupName],
          stage: Stage.GROUP,
          matchNumber: matchNumber++,
          startTime: new Date(startDate.getTime() + (matchNumber - 1) * 2 * 3600 * 1000),
        },
      });
    }
  }

  console.log("Created group stage matches");

  const knockoutStages = [
    { stage: Stage.ROUND_OF_32, count: 16 },
    { stage: Stage.ROUND_OF_16, count: 8 },
    { stage: Stage.QUARTER_FINALS, count: 4 },
    { stage: Stage.SEMI_FINALS, count: 2 },
    { stage: Stage.THIRD_PLACE, count: 1 },
    { stage: Stage.FINAL, count: 1 },
  ];

  for (const { stage, count } of knockoutStages) {
    for (let i = 0; i < count; i++) {
      await prisma.match.create({
        data: {
          stage,
          matchNumber: matchNumber++,
          startTime: new Date("2026-06-29T18:00:00Z"),
          isLocked: false,
        },
      });
    }
    console.log(`Created ${count} ${stage} matches`);
  }

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
