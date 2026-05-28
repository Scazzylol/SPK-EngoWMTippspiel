import "dotenv/config";
import path from "path";
process.env.DOTENV_CONFIG_PATH = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  // Create auth tables first (Better-Auth schema)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS better_auth_user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      image TEXT,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    );
  `);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS better_auth_session (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES better_auth_user(id),
      expires_at TIMESTAMP NOT NULL,
      token TEXT NOT NULL UNIQUE DEFAULT '',
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    );
  `);

  // Add missing columns if they don't exist (for existing tables)
  await sql.unsafe(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'better_auth_session' AND column_name = 'token') THEN
      ALTER TABLE better_auth_session ADD COLUMN token TEXT NOT NULL DEFAULT '';
      CREATE UNIQUE INDEX IF NOT EXISTS idx_better_auth_session_token ON better_auth_session(token);
    END IF;
  END $$;`);

  await sql.unsafe(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'better_auth_session' AND column_name = 'ip_address') THEN
      ALTER TABLE better_auth_session ADD COLUMN ip_address TEXT;
    END IF;
  END $$;`);

  await sql.unsafe(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'better_auth_session' AND column_name = 'user_agent') THEN
      ALTER TABLE better_auth_session ADD COLUMN user_agent TEXT;
    END IF;
  END $$;`);

  await sql.unsafe(`
   CREATE TABLE IF NOT EXISTS better_auth_account (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES better_auth_user(id),
      account_id TEXT NOT NULL,
      provider_account_id TEXT,
      provider_id TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at TIMESTAMP,
      refresh_token_expires_at TIMESTAMP,
      scope TEXT,
      password TEXT,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    );
  `);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS better_auth_verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP,
      updated_at TIMESTAMP
    );
  `);

  // Create matches table
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      match_date TIMESTAMP NOT NULL,
      group_name TEXT,
      stage TEXT NOT NULL DEFAULT 'group'
    );
  `);

  // Create predictions table
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS predictions (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES better_auth_user(id),
      match_id INTEGER NOT NULL REFERENCES matches(id),
      home_score INTEGER NOT NULL,
      away_score INTEGER NOT NULL
    );
  `);

  // Add account_id column if it doesn't exist (for existing tables)
  await sql.unsafe(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'better_auth_account' AND column_name = 'account_id') THEN
      ALTER TABLE better_auth_account ADD COLUMN account_id TEXT NOT NULL DEFAULT '';
    END IF;
  END $$;`);

  // Make provider_account_id nullable for credential provider compatibility
  await sql.unsafe(`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'better_auth_account' AND column_name = 'provider_account_id' AND is_nullable = 'NO') THEN
      ALTER TABLE better_auth_account ALTER COLUMN provider_account_id DROP NOT NULL;
    END IF;
  END $$;`);

  console.log("All tables created successfully!");

  const count = await sql.unsafe("SELECT COUNT(*) FROM matches");
  console.log("Existing matches:", count[0].count);

  if (parseInt(count[0].count) === 0) {
    console.log("Seeding WM 2026 matches...");
    await seedMatches();
  } else {
    console.log("Matches already exist, skipping seed.");
  }

  await sql.end();
  console.log("Migration complete!");
}

async function seedMatches() {
  const groups = [
    { name: "Gruppe A", teams: ["USA", "Canada", "Mexico", "Germany"] },
    { name: "Gruppe B", teams: ["Argentina", "France", "Brazil", "Spain"] },
    { name: "Gruppe C", teams: ["England", "Portugal", "Netherlands", "Italy"] },
    { name: "Gruppe D", teams: ["Japan", "South Korea", "Australia", "Morocco"] },
  ];

  let matchDate = new Date("2026-06-11T15:00:00Z");
  const batchSize = 3;

  for (const group of groups) {
    const teams = group.teams;
    const fixtures = [
      [0, 1],
      [2, 3],
      [0, 2],
      [1, 3],
      [0, 3],
      [1, 2],
    ];

    for (let i = 0; i < fixtures.length; i++) {
      const [homeIdx, awayIdx] = fixtures[i];
      await sql.unsafe(
        `INSERT INTO matches (home_team, away_team, match_date, group_name, stage) VALUES ($1, $2, $3, $4, 'group')`,
        [teams[homeIdx], teams[awayIdx], matchDate.toISOString(), group.name]
      );

      if ((i + 1) % batchSize === 0) {
        matchDate = new Date(matchDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      } else {
        matchDate = new Date(matchDate.getTime() + 3 * 60 * 60 * 1000);
      }
    }

    matchDate = new Date(matchDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  }

  const knockoutTeams = [
    ["A1", "B2"],
    ["C1", "D2"],
    ["B1", "A2"],
    ["D1", "C2"],
  ];

  matchDate = new Date("2026-07-03T15:00:00Z");

  for (const [home, away] of knockoutTeams) {
    await sql.unsafe(
      `INSERT INTO matches (home_team, away_team, match_date, stage) VALUES ($1, $2, $3, 'round_of_16')`,
      [home, away, matchDate.toISOString()]
    );
    matchDate = new Date(matchDate.getTime() + 3 * 60 * 60 * 1000);
  }

  const quarters = [["QF1", "QF2"], ["QF3", "QF4"]];
  matchDate = new Date("2026-07-09T15:00:00Z");

  for (const [home, away] of quarters) {
    await sql.unsafe(
      `INSERT INTO matches (home_team, away_team, match_date, stage) VALUES ($1, $2, $3, 'quarter_final')`,
      [home, away, matchDate.toISOString()]
    );
    matchDate = new Date(matchDate.getTime() + 3 * 60 * 60 * 1000);
  }

  const semis = [["SF1", "SF2"]];
  matchDate = new Date("2026-07-13T19:00:00Z");

  for (const [home, away] of semis) {
    await sql.unsafe(
      `INSERT INTO matches (home_team, away_team, match_date, stage) VALUES ($1, $2, $3, 'semi_final')`,
      [home, away, matchDate.toISOString()]
    );
  }

  await sql.unsafe(
    `INSERT INTO matches (home_team, away_team, match_date, stage) VALUES ('Platz 3', 'Platz 4', $1, 'third_place')`,
    [new Date("2026-07-17T19:00:00Z").toISOString()]
  );

  await sql.unsafe(
    `INSERT INTO matches (home_team, away_team, match_date, stage) VALUES ('Team A', 'Team B', $1, 'final')`,
    [new Date("2026-07-19T19:00:00Z").toISOString()]
  );

  console.log("Seeded matches successfully!");
}

migrate().catch(console.error);
