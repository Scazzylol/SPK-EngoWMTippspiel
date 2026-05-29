import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDirectUrl: !!process.env.DIRECT_URL,
    hasBetterAuthUrl: !!process.env.BETTER_AUTH_URL,
    hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
    hasNextPublicAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    betterAuthUrl: process.env.BETTER_AUTH_URL?.slice(0, 30),
    nodeEnv: process.env.NODE_ENV,
  };

  let dbOk = false;
  let dbError = "";
  try {
    const { default: postgres } = await import("postgres");
    const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL!, { prepare: false });
    const result = await sql`SELECT 1 AS ok`;
    dbOk = result[0]?.ok === 1;
    await sql.end();
  } catch (e: any) {
    dbError = e?.message?.slice(0, 200) || String(e);
  }

  return NextResponse.json({ env: envCheck, dbOk, dbError });
}
