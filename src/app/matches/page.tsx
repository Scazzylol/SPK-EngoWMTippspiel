import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import MatchList from "@/components/match-list";

export default async function MatchesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D40000]/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#D40000]/5 via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto py-10 px-4">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Spiele &{" "}
            <span className="bg-gradient-to-r from-red-300 via-[#D40000] to-red-700 bg-clip-text text-transparent">
              Tipps
            </span>
          </h1>
          <p className="text-zinc-400 mt-2">
            Tipp die Ergebnisse der WM 2026 – von der Gruppenphase bis zum Finale.
          </p>
        </div>
        <MatchList userId={session.user.id} />
      </div>
    </div>
  );
}
