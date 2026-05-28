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

const teams: TeamData[] = [
  // Group A
  { name: "USA", code: "USA", group: "A" },
  { name: "Spanien", code: "ESP", group: "A" },
  { name: "Marokko", code: "MAR", group: "A" },
  { name: "Simbabwe", code: "ZIM", group: "A" },
  // Group B
  { name: "Argentinien", code: "ARG", group: "B" },
  { name: "Kanada", code: "CAN", group: "B" },
  { name: "Kolumbien", code: "COL", group: "B" },
  { name: "Nigeria", code: "NGA", group: "B" },
  // Group C
  { name: "Mexiko", code: "MEX", group: "C" },
  { name: "Brasilien", code: "BRA", group: "C" },
  { name: "Japan", code: "JPN", group: "C" },
  { name: "Costa Rica", code: "CRC", group: "C" },
  // Group D
  { name: "Frankreich", code: "FRA", group: "D" },
  { name: "Ukraine", code: "UKR", group: "D" },
  { name: "Senegal", code: "SEN", group: "D" },
  { name: "Australien", code: "AUS", group: "D" },
  // Group E
  { name: "England", code: "ENG", group: "E" },
  { name: "Serbien", code: "SRB", group: "E" },
  { name: "Irak", code: "IRQ", group: "E" },
  { name: "Ecuador", code: "ECU", group: "E" },
  // Group F
  { name: "Deutschland", code: "GER", group: "F" },
  { name: "Schweiz", code: "SUI", group: "F" },
  { name: "Paraguay", code: "PAR", group: "F" },
  { name: "Honduras", code: "HON", group: "F" },
  // Group G
  { name: "Portugal", code: "POR", group: "G" },
  { name: "Italien", code: "ITA", group: "G" },
  { name: "Südkorea", code: "KOR", group: "G" },
  { name: "Panama", code: "PAN", group: "G" },
  // Group H
  { name: "Niederlande", code: "NED", group: "H" },
  { name: "Dänemark", code: "DEN", group: "H" },
  { name: "Uruguay", code: "URU", group: "H" },
  { name: "Mali", code: "MLI", group: "H" },
  // Group I
  { name: "Belgien", code: "BEL", group: "I" },
  { name: "Österreich", code: "AUT", group: "I" },
  { name: "Iran", code: "IRN", group: "I" },
  { name: "Jamaika", code: "JAM", group: "I" },
  // Group J
  { name: "Polen", code: "POL", group: "J" },
  { name: "Schottland", code: "SCO", group: "J" },
  { name: "Saudi-Arabien", code: "KSA", group: "J" },
  { name: "Island", code: "ISL", group: "J" },
  // Group K
  { name: "Kroatien", code: "CRO", group: "K" },
  { name: "Schweden", code: "SWE", group: "K" },
  { name: "Usbekistan", code: "UZB", group: "K" },
  { name: "Ägypten", code: "EGY", group: "K" },
  // Group L
  { name: "Georgien", code: "GEO", group: "L" },
  { name: "Rumänien", code: "ROU", group: "L" },
  { name: "Bosnien-Herzegowina", code: "BIH", group: "L" },
  { name: "Tschad", code: "CHA", group: "L" },
];

async function main() {
  console.log("Seeding database...");

  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
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
      },
      create: {
        name: teamData.name,
        code: teamData.code,
        groupId: createdGroups[teamData.group],
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
    { stage: Stage.ROUND_OF_32, count: 8 },
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
