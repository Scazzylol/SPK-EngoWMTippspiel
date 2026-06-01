import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import MatchList from "@/components/match-list";
import WorldChampionPicker from "@/components/world-champion-picker";
import { ScoringInfo } from "@/components/scoring-info";

export default async function MatchesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D40000]/5 via-transparent to-transparent dark:from-[#D40000]/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#D40000]/3 via-transparent to-transparent dark:from-[#D40000]/5" />

      <div className="relative z-10 container mx-auto py-10 px-4">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            Spiele &{" "}
            <span className="bg-gradient-to-r from-red-300 via-[#D40000] to-red-700 bg-clip-text text-transparent">
              Tipps
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Tipp die Ergebnisse der WM 2026 – von der Gruppenphase bis zum Finale.
          </p>
          <ScoringInfo className="mt-3" />
        </div>
        <WorldChampionPicker userId={session.user.id} />
        <MatchList userId={session.user.id} />
      </div>
    </div>
  );
}
