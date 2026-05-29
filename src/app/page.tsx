import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-zinc-50 dark:bg-black px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            ⚽ WM Tippspiel 2026
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Tipp die Ergebnisse der Fußball-Weltmeisterschaft und werde Meister!
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Willkommen, <span className="font-semibold">{user.name}</span>!
            </p>
            <Link href="/matches">
              <Button size="lg" className="text-lg px-8">
                Zu den Spielen →
              </Button>
            </Link>
          </div>
        ) : (
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Jetzt starten
            </Button>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-left">
          <div className="rounded-lg border p-4 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold mb-2">🎯 Tipps abgeben</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Tipp das Ergebnis jedes Spiels vor dem Anpfiff.
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold mb-2">🏆 Punkte sammeln</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Richtige Tipps bringen dich in der Rangliste nach oben.
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold mb-2">📊 Live Standings</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Verfolge live wer in Führung liegt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
