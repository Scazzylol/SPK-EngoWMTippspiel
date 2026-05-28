require("dotenv").config({ path: "./.env" });
const postgres = require("postgres");

const sql = postgres(process.env.DATABASE_URL);

async function test() {
  console.log("Testing direct insert like Better-Auth would do...");

  // Generate UUID-like ID (Better-Auth uses nanoid)
  const userId = crypto.randomUUID();
  const hashedPassword = "$2b$10$fakehashedpassword";

  try {
    await sql`INSERT INTO better_auth_user (id, name, email, email_verified, created_at, updated_at) VALUES (${userId}, 'Test User', 'test4@example.com', false, NOW(), NOW())`;
    console.log("User insert OK:", userId);
  } catch (e) {
    console.error("User insert failed:", e.message, e.detail || "");
  }

  const accountId = crypto.randomUUID();
  try {
    await sql`INSERT INTO better_auth_account (id, user_id, provider_account_id, provider_id, password, created_at, updated_at) VALUES (${accountId}, ${userId}, ${userId}, 'credentials', ${hashedPassword}, NOW(), NOW())`;
    console.log("Account insert OK:", accountId);
  } catch (e) {
    console.error("Account insert failed:", e.message, e.detail || "");
  }

  await sql.end();
}

test().catch(console.error);
