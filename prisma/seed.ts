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
  { name: "Kanada", code: "CAN", group: "A" },
  { name: "Mexiko", code: "MEX", group: "A" },
  { name: "Ecuador", code: "ECU", group: "A" },
  // Group B
  { name: "Argentinien", code: "ARG", group: "B" },
  { name: "Frankreich", code: "FRA", group: "B" },
  { name: "Tunesien", code: "TUN", group: "B" },
  { name: "Polen", code: "POL", group: "B" },
  // Group C
  { name: "Brasilien", code: "BRA", group: "C" },
  { name: "Kroatien", code: "CRO", group: "C" },
  { name: "Serbien", code: "SRB", group: "C" },
  { name: "Costa Rica", code: "CRC", group: "C" },
  // Group D
  { name: "Spanien", code: "ESP", group: "D" },
  { name: "Japan", code: "JPN", group: "D" },
  { name: "Deutschland", code: "GER", group: "D" },
  { name: "Kolumbien", code: "COL", group: "D" },
  // Group E
  { name: "England", code: "ENG", group: "E" },
  { name: "Südkorea", code: "KOR", group: "E" },
  { name: "Irak", code: "IRQ", group: "E" },
  { name: "Malaysia", code: "MAS", group: "E" },
  // Group F
  { name: "Portugal", code: "POR", group: "F" },
  { name: "Schweiz", code: "SUI", group: "F" },
  { name: "Marokko", code: "MAR", group: "F" },
  { name: "Ghana", code: "GHA", group: "F" },
  // Group G
  { name: "Italien", code: "ITA", group: "G" },
  { name: "Niederlande", code: "NED", group: "G" },
  { name: "Österreich", code: "AUT", group: "G" },
  { name: "Ungarn", code: "HUN", group: "G" },
  // Group H
  { name: "Belgien", code: "BEL", group: "H" },
  { name: "Dänemark", code: "DEN", group: "H" },
  { name: "Schweden", code: "SWE", group: "H" },
  { name: "Nigeria", code: "NGA", group: "H" },
  // Group I
  { name: "Ukraine", code: "UKR", group: "I" },
  { name: "Türkei", code: "TUR", group: "I" },
  { name: "Iran", code: "IRN", group: "I" },
  { name: "Jamaika", code: "JAM", group: "I" },
  // Group J
  { name: "Australien", code: "AUS", group: "J" },
  { name: "Uruguay", code: "URU", group: "J" },
  { name: "Senegal", code: "SEN", group: "J" },
  { name: "Vietnam", code: "VIE", group: "J" },
  // Group K
  { name: "Saudi-Arabien", code: "KSA", group: "K" },
  { name: "Ägypten", code: "EGY", group: "K" },
  { name: "Schottland", code: "SCO", group: "K" },
  { name: "Neuseeland", code: "NZL", group: "K" },
  // Group L
  { name: "Paraguay", code: "PAR", group: "L" },
  { name: "Bahrain", code: "BRN", group: "L" },
  { name: "Panama", code: "PAN", group: "L" },
  { name: "Cape Verde", code: "CPV", group: "L" },
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
