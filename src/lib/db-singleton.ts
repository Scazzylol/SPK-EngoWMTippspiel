import postgres from "postgres";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof postgres> | undefined;
};

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;
export const sql = globalForDb.db ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = sql;
}
