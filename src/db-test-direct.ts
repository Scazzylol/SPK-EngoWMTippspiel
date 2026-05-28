import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/lib/auth-schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

const auth = betterAuth({
  appId: "wmtippspiel",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: { enabled: true },
});

async function test() {
  // Clean up any previous test user
  console.log("Cleaning up test users...");
  await db.delete(schema.user).where(eq(schema.user.email, "direct-test@example.com")).execute().catch(() => {});

  console.log("\nTesting sign-up via Better-Auth API directly...");
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: "Direct Test",
        email: "direct-test@example.com",
        password: "12345678",
      },
    });
    console.log("SIGN-UP SUCCESS:", JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error("SIGN-UP ERROR:", err.message);
    if (err.cause) console.error("CAUSE:", err.cause);
    await client.end();
    return;
  }

  // Test login
  console.log("\nTesting login...");
  try {
    const loginResult = await auth.api.signInEmail({
      body: {
        email: "direct-test@example.com",
        password: "12345678",
      },
    });
    console.log("LOGIN SUCCESS:", JSON.stringify(loginResult, null, 2));
  } catch (err: any) {
    console.error("LOGIN ERROR:", err.message);
  }

  // Clean up test user
  console.log("\nCleaning up test users...");
  await db.delete(schema.user).where(eq(schema.user.email, "direct-test@example.com")).execute().catch(() => {});
  console.log("Done.");

  await client.end();
}

test();
