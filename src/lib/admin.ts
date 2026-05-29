import { sql } from "@/lib/db-singleton";
import { getSession } from "@/lib/session";

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const [row] = await sql<{ is_admin: boolean }[]>`
    SELECT is_admin FROM better_auth_user WHERE id = ${session.user.id}
  `;
  return row?.is_admin ?? false;
}
