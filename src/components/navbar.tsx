import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { MobileNav } from "@/components/mobile-nav";
import { SparkasseLogo } from "@/components/sparkasse-logo";
import { CircleDot, Trophy, Shield } from "lucide-react";

export default async function Navbar() {
  const [session, admin] = await Promise.all([getSession(), isAdmin()]);
  const user = session?.user ?? null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 w-full border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 font-bold text-lg">
          <SparkasseLogo className="h-7 w-auto" />
          <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600 font-normal">|</span>
          <span className="hidden sm:inline text-zinc-800 dark:text-zinc-200">WM Tippspiel 2026</span>
        </Link>

        <nav className="flex items-center gap-1 min-w-0">
          <ThemeToggle />
          {user ? (
            <>
              {/* Always-visible nav links (icon+text on md+, icon only on mobile) */}
              <Link
                href="/matches"
                className="flex items-center gap-1.5 px-1.5 md:px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
              >
                <CircleDot className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Spiele</span>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-1.5 px-1.5 md:px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
              >
                <Trophy className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Rangliste</span>
              </Link>
              {/* Desktop-only items */}
              <div className="hidden md:flex items-center gap-1">
                {admin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <span className="text-sm text-zinc-500 px-1">{user.name}</span>
                <LogoutButton />
              </div>
              {/* Mobile-only: hamburger with admin + username + logout */}
              <div className="md:hidden">
                <MobileNav isAdmin={admin} userName={user.name} />
              </div>
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
