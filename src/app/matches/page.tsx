import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import MatchList from "@/components/match-list";

export default async function MatchesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Spiele & Tipps</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Tipp die Ergebnisse der WM 2026 – von der Gruppenphase bis zum Finale.
        </p>
      </div>
      <MatchList userId={session.user.id} />
    </div>
  );
}
