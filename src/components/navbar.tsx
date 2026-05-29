import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/actions/auth";

export default async function Navbar() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-black/95">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          ⚽ WM Tippspiel 2026
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/matches"
                className="text-sm font-medium transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                Spiele
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                Rangliste
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.name}
              </span>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  Ausloggen
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Einloggen</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
