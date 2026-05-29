import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/actions/auth";
import { SparkasseLogo } from "@/components/sparkasse-logo";

export default async function Navbar() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 font-bold text-lg">
          <SparkasseLogo className="h-7 w-auto" />
          <span className="hidden sm:inline text-zinc-400 font-normal">|</span>
          <span className="hidden sm:inline">WM Tippspiel 2026</span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/matches"
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Spiele
              </Link>
              <Link
                href="/leaderboard"
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Rangliste
              </Link>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400 px-2">
                {user.name}
              </span>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                  Ausloggen
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-[#D40000] hover:bg-[#B00000] text-white">Einloggen</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
