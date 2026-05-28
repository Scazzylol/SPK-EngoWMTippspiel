require("dotenv").config({ path: "./.env" });

const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { betterAuth } = require("better-auth");
const { drizzleAdapter } = require("better-auth/adapters/drizzle");

// Import the schema - need to use ts-node or compile first
const path = require("path");
require("ts-node/register");
const schema = require("./src/lib/auth-schema.ts");

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

const auth = betterAuth({
  appId: "wmtippspiel",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
});

async function test() {
  console.log("Testing sign-up via Better-Auth API directly...");
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: "Direct Test",
        email: "direct-test@example.com",
        password: "12345678",
      },
    });
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message);
    if (err.cause) console.error("CAUSE:", err.cause);
    console.error("FULL:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
  }

  await client.end();
}

test();
