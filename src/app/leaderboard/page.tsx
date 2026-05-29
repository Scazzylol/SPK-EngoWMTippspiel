import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/leaderboard`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const leaderboard = await getLeaderboard();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D40000]/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#D40000]/5 via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto py-10 px-4">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
           {" "}
            <span className="bg-gradient-to-r from-red-300 via-[#D40000] to-red-700 bg-clip-text text-transparent">
              Rangliste
            </span>
          </h1>
          <p className="text-zinc-400 mt-2">
            Wer hat die besten Tipps bei der WM 2026?
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-12 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-lg font-medium text-white">Noch keine Punkte vergeben.</p>
            <p className="text-sm text-zinc-500 mt-1">
              Sobald Spiele beendet sind und Ergebnisse eingetragen wurden, erscheint hier die Rangliste.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="flex items-end justify-center gap-4 sm:gap-6 py-8">
                {/* 2nd */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 flex items-center justify-center text-2xl font-bold text-zinc-800 ring-2 ring-zinc-400/50">
                    {leaderboard[1]?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-zinc-200">{leaderboard[1]?.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{leaderboard[1]?.points} Punkte</div>
                  </div>
                  <div className="w-24 h-16 rounded-t-xl bg-gradient-to-b from-zinc-400/20 to-zinc-600/20 border border-zinc-500/20 flex items-center justify-center text-3xl backdrop-blur-sm">
                    🥈
                  </div>
                </div>
                {/* 1st */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-2xl font-bold text-yellow-900 ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-500/20">
                    {leaderboard[0]?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{leaderboard[0]?.name}</div>
                    <div className="text-xs text-yellow-500 font-medium mt-0.5">{leaderboard[0]?.points} Punkte</div>
                  </div>
                  <div className="w-28 h-20 rounded-t-xl bg-gradient-to-b from-yellow-400/20 to-yellow-600/20 border border-yellow-500/20 flex items-center justify-center text-4xl backdrop-blur-sm shadow-lg shadow-yellow-500/10">
                    🥇
                  </div>
                </div>
                {/* 3rd */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 flex items-center justify-center text-2xl font-bold text-orange-800 ring-2 ring-orange-400/50">
                    {leaderboard[2]?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-zinc-200">{leaderboard[2]?.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{leaderboard[2]?.points} Punkte</div>
                  </div>
                  <div className="w-24 h-12 rounded-t-xl bg-gradient-to-b from-orange-400/20 to-orange-600/20 border border-orange-500/20 flex items-center justify-center text-3xl backdrop-blur-sm">
                    🥉
                  </div>
                </div>
              </div>
            )}

            {/* Full Ranking */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <div className="col-span-2 text-center">#</div>
                  <div className="col-span-6">Name</div>
                  <div className="col-span-4 text-center">Punkte</div>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId === session.user.id;
                  const rankStyles: Record<number, string> = {
                    1: "text-yellow-400",
                    2: "text-zinc-300",
                    3: "text-orange-400",
                  };

                  return (
                    <div
                      key={entry.userId}
                      className={`px-6 py-3.5 transition-colors ${
                        isCurrentUser
                          ? "bg-[#D40000]/10 border-l-2 border-l-[#D40000]"
                          : "hover:bg-white/[0.02] border-l-2 border-l-transparent"
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2 text-center">
                          <span className={`font-bold text-lg ${rankStyles[entry.rank] || "text-zinc-500"}`}>
                            {entry.rank <= 3 ? (entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉") : entry.rank}
                          </span>
                        </div>
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-zinc-300">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-zinc-200">{entry.name}</span>
                          {isCurrentUser && (
                            <span className="text-xs bg-[#D40000]/20 text-[#D40000] px-2 py-0.5 rounded-full font-medium border border-[#D40000]/30">
                              Du
                            </span>
                          )}
                        </div>
                        <div className="col-span-4 text-center">
                          <span className="font-bold text-lg text-white">{entry.points}</span>
                          <span className="text-xs text-zinc-500 ml-1">Pkt.</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-600">
              <span>{leaderboard.length} Teilnehmer</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
