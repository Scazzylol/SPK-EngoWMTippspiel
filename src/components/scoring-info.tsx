"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface ScoringInfoProps {
  className?: string;
  direction?: "up" | "down";
}

export function ScoringInfo({ className, direction = "down" }: ScoringInfoProps) {
  const [open, setOpen] = useState(false);

  const rules = [
    { points: 3, label: "Exaktes Ergebnis (bei klarem Sieg oder Gruppenphase)", highlight: true },
    { points: 1, label: "Richtige Tendenz", highlight: false },
    { points: 0, label: "Falscher Tipp", highlight: false },
  ];

  const positionClasses = direction === "up"
    ? "bottom-full mb-2"
    : "top-full mt-2";

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 cursor-pointer"
      >
        <Info className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Punktevergabe
        </span>
      </button>

      <div
        className={`absolute left-1/2 -translate-x-1/2 ${positionClasses} w-80 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 p-3 shadow-lg transition-all duration-200 z-50 ${
          open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Punkte pro Spiel
        </div>
        <div className="space-y-1.5">
          {rules.map((r) => (
            <div key={r.points} className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">{r.label}</span>
              <span
                className={`font-bold tabular-nums ${
                  r.highlight
                    ? "text-green-600 dark:text-green-400"
                    : r.points === 0
                      ? "text-zinc-400 dark:text-zinc-500"
                      : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {r.points > 0 ? `+${r.points}` : r.points} Pkt.
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 dark:border-white/10 mt-2 pt-2 space-y-1.5">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            KO-Spiele bei Unentschieden-Tipp (z.B. 2:2)
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Richtige Tendenz + Weiterkommen richtig</span>
            <span className="font-bold tabular-nums text-violet-600 dark:text-violet-400">+1 bis +3</span>
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700 ml-1">
            Exaktes Ergebnis + Weiterkommen richtig → 3 Pkt.
            <br />
            Falsches Ergebnis + Weiterkommen richtig → 2 Pkt.
            <br />
            Weiterkommen falsch → nur 1 Pkt. (Tendenz)
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-white/10 mt-2 pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Richtiger Weltmeister-Tipp</span>
            <span className="font-bold tabular-nums text-yellow-600 dark:text-yellow-400">+15 Pkt.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
