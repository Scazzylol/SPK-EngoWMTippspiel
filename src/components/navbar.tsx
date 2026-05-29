import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/actions/auth";
import { SparkasseLogo } from "@/components/sparkasse-logo";

export default async function Navbar() {
  const [session, admin] = await Promise.all([getSession(), isAdmin()]);
  const user = session?.user ?? null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 font-bold text-lg">
          <SparkasseLogo className="h-7 w-auto" />
          <span className="hidden sm:inline text-zinc-600 font-normal">|</span>
          <span className="hidden sm:inline text-zinc-200">WM Tippspiel 2026</span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/matches"
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Spiele
              </Link>
              <Link
                href="/leaderboard"
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Rangliste
              </Link>
              {admin && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Admin
                </Link>
              )}
              <Separator orientation="vertical" className="h-5 bg-white/10" />
              <span className="text-sm text-zinc-500 px-2">
                {user.name}
              </span>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit" className="text-zinc-500 hover:text-white hover:bg-white/5">
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
