import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db-singleton";
import AdminPanel from "./admin-panel";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [row] = await sql<{ is_admin: boolean }[]>`
    SELECT is_admin FROM better_auth_user WHERE id = ${session.user.id}
  `;

  if (!row?.is_admin) {
    return (
      <div className="relative min-h-[calc(100vh-3.5rem)]">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950" />
        <div className="relative z-10 flex items-center justify-center py-20">
          <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 backdrop-blur-sm px-8 py-12 text-center">
            <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Kein Zugriff</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Du hast keine Admin-Rechte.</p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}
