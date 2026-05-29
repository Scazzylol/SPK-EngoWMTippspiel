import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SparkasseLogo } from "@/components/sparkasse-logo";

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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Rangliste</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Wer hat die besten Tipps bei der WM 2026?
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-lg font-medium">Noch keine Punkte vergeben.</p>
          <p className="text-sm text-zinc-500 mt-1">
            Sobald Spiele beendet sind und Ergebnisse eingetragen wurden, erscheint hier die Rangliste.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="flex items-end justify-center gap-4 p-8 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-800/50 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              {/* 2nd */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-2xl">
                  {leaderboard[1]?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">{leaderboard[1]?.name}</div>
                  <div className="text-xs text-zinc-500">{leaderboard[1]?.points} Punkte</div>
                </div>
                <div className="w-20 h-16 rounded-t-lg bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-3xl">
                  🥈
                </div>
              </div>
              {/* 1st */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl ring-2 ring-yellow-400">
                  {leaderboard[0]?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold">{leaderboard[0]?.name}</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">{leaderboard[0]?.points} Punkte</div>
                </div>
                <div className="w-24 h-20 rounded-t-lg bg-yellow-400 dark:bg-yellow-600 flex items-center justify-center text-4xl">
                  🥇
                </div>
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">
                  {leaderboard[2]?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">{leaderboard[2]?.name}</div>
                  <div className="text-xs text-zinc-500">{leaderboard[2]?.points} Punkte</div>
                </div>
                <div className="w-20 h-12 rounded-t-lg bg-orange-300 dark:bg-orange-700 flex items-center justify-center text-3xl">
                  🥉
                </div>
              </div>
            </div>
          )}

          {/* Full Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 dark:bg-zinc-800/50">
                <TableHead className="w-16 text-center font-semibold">#</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="w-24 text-center font-semibold">Punkte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => {
                const isCurrentUser = entry.userId === session.user.id;
                const rankColors: Record<number, string> = {
                  1: "text-yellow-500",
                  2: "text-zinc-400",
                  3: "text-orange-400",
                };

                return (
                  <TableRow
                    key={entry.userId}
                    className={
                      isCurrentUser
                        ? "bg-[#D40000]/5 dark:bg-[#D40000]/10 font-semibold"
                        : undefined
                    }
                  >
                    <TableCell className="text-center">
                      <span className={`font-bold ${rankColors[entry.rank] || "text-zinc-500"}`}>
                        {entry.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entry.rank === 1 && <span>🥇</span>}
                        {entry.rank === 2 && <span>🥈</span>}
                        {entry.rank === 3 && <span>🥉</span>}
                        <span>{entry.name}</span>
                        {isCurrentUser && (
                          <span className="text-xs bg-[#D40000]/10 text-[#D40000] px-2 py-0.5 rounded-full font-medium">
                            Du
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">{entry.points}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <SparkasseLogo className="h-4 w-auto opacity-50" />
              <span>WM Tippspiel 2026</span>
            </div>
            <div className="text-sm text-zinc-500">
              {leaderboard.length} Teilnehmer
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
