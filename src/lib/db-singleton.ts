import postgres from "postgres";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof postgres> | undefined;
};

export const sql = globalForDb.db ?? postgres(process.env.DATABASE_URL!, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = sql;
}
