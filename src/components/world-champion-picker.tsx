"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFlagUrl } from "@/lib/flags";
import { saveWorldChampion } from "@/actions/world-champion";

interface Team {
  id: string;
  name: string;
  code: string;
}

export default function WorldChampionPicker({ userId }: { userId: string }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/world-champion?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setTeams(data.teams);
        setPick(data.pick);
        setIsLocked(data.isLocked);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  async function handlePick(teamId: string) {
    if (isLocked || saving) return;
    setSaving(true);
    try {
      await saveWorldChampion(teamId);
      setPick(teamId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Fehler beim Speichern");
    }
    setSaving(false);
  }

  if (loading) return null;

  const selectedTeam = teams.find((t) => t.id === pick);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden mb-8">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400/20 text-yellow-600 dark:text-yellow-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Weltmeister-Tipp</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isLocked
                ? "Gesperrt – das erste Spiel wurde bereits angepfiffen."
                : "Welches Land wird Weltmeister? Du erhältst 15 Bonuspunkte für den richtigen Tipp."}
            </p>
          </div>
        </div>

        {pick && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 px-3 py-2 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Dein Tipp:</span>
            {selectedTeam && (
              <>
                <img src={getFlagUrl(selectedTeam.code)} alt="" className="w-5 h-3.5 object-contain" />
                <span className="font-bold text-zinc-900 dark:text-white">{selectedTeam.name}</span>
              </>
            )}
            {!isLocked && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                onClick={() => { setPick(null); }}
              >
                Ändern
              </Button>
            )}
          </div>
        )}

        {!isLocked && (
          <div className="mt-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handlePick(team.id)}
                  disabled={saving}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-all ${
                    pick === team.id
                      ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 font-bold shadow-sm"
                      : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <img src={getFlagUrl(team.code)} alt="" className="w-6 h-4 object-contain" />
                  <span className="leading-tight text-center line-clamp-1">{team.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
