"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CircleDot, Trophy, Shield, Menu, X } from "lucide-react";
import { logout } from "@/actions/auth";

interface MobileNavProps {
  isAdmin: boolean;
  userName: string;
}

export function MobileNav({ isAdmin, userName }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
        aria-label="Menü öffnen"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-zinc-900 shadow-xl border-l border-zinc-200 dark:border-white/10 overflow-y-auto">
            <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-100 dark:border-white/5">
              <span className="font-semibold text-sm text-zinc-900 dark:text-white">{userName}</span>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
                aria-label="Menü schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <Link
                href="/matches"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
              >
                <CircleDot className="h-4 w-4" />
                Spiele
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                Rangliste
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <hr className="my-3 border-zinc-200 dark:border-white/10" />
              <button
                onClick={() => {
                  startTransition(async () => {
                    await logout();
                    window.location.href = "/login";
                  });
                }}
                disabled={pending}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors w-full text-left disabled:opacity-50"
              >
                {pending ? "Wird ausgeloggt..." : "Abmelden"}
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
