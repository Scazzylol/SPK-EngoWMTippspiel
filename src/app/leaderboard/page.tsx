import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      <h1 className="text-3xl font-bold mb-6">Rangliste</h1>

      {leaderboard.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-2">Noch keine Punkte vergeben.</p>
          <p className="text-sm">Sobald Spiele beendet sind und Ergebnisse eingetragen wurden, erscheint hier die Rangliste.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-24 text-center">Punkte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow
                  key={entry.userId}
                  className={entry.userId === session.user.id ? "bg-primary/5 font-semibold" : undefined}
                >
                  <TableCell className="text-center text-lg">{entry.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.rank === 1 && <span className="text-xl">🥇</span>}
                      {entry.rank === 2 && <span className="text-xl">🥈</span>}
                      {entry.rank === 3 && <span className="text-xl">🥉</span>}
                      <span>{entry.name}</span>
                      {entry.userId === session.user.id && (
                        <span className="text-xs text-muted-foreground">(du)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-lg font-bold">{entry.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
