import { Info } from "lucide-react";

export function ScoringInfo({ className }: { className?: string }) {
  const rules = [
    { points: 3, label: "Exaktes Ergebnis" },
    { points: 1, label: "Richtige Tendenz (Sieger / Unentschieden)" },
    { points: 0, label: "Falscher Tipp" },
  ];

  return (
    <div
      className={`group relative inline-flex items-center gap-1.5 ${className ?? ""}`}
    >
      <Info className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 cursor-help" />
      <span className="text-xs text-zinc-400 dark:text-zinc-500 cursor-help">
        Punktevergabe
      </span>

      <div className="absolute left-0 top-full mt-2 w-64 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Punktevergabe
        </div>
        <div className="space-y-1.5">
          {rules.map((r) => (
            <div key={r.points} className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">{r.label}</span>
              <span
                className={`font-bold tabular-nums ${
                  r.points === 3
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
      </div>
    </div>
  );
}
