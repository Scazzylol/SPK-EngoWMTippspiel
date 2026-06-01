"use client";

import { useState, useEffect } from "react";
import { Trophy, Check } from "lucide-react";
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
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetch(`/api/world-champion?userId=${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error("API-Fehler");
        return r.json();
      })
      .then((data) => {
        setTeams(data.teams || []);
        setPick(data.pick);
        setIsLocked(data.isLocked);
        setApiError(false);
        setLoading(false);
      })
      .catch(() => {
        setApiError(true);
        setLoading(false);
      });
  }, [userId]);

  async function handlePick(teamId: string) {
    if (isLocked || saving || !teamId) return;
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

  if (apiError) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden mb-8 p-5 sm:p-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Weltmeister-Tipp konnte nicht geladen werden.</p>
      </div>
    );
  }

  const selectedTeam = teams.find((t) => t.id === pick);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden mb-8">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400/20 text-yellow-600 dark:text-yellow-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Weltmeister-Tipp</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isLocked
                ? "Gesperrt – das erste Spiel wurde beendet."
                : "Welches Land wird Weltmeister? Du erhältst 15 Bonuspunkte für den richtigen Tipp."}
            </p>
          </div>
        </div>

        {isLocked ? (
          <div className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 px-3 py-2.5 text-sm">
            {selectedTeam ? (
              <>
                <img src={getFlagUrl(selectedTeam.code)} alt="" className="w-5 h-3.5 object-contain" />
                <span className="font-bold text-zinc-900 dark:text-white">{selectedTeam.name}</span>
              </>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400">Kein Tipp abgegeben</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <select
                value={pick ?? ""}
                onChange={(e) => {
                  if (e.target.value) handlePick(e.target.value);
                }}
                disabled={saving}
                className="w-full appearance-none rounded-lg border border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5 pr-8 text-sm text-zinc-900 dark:text-white focus:border-[#D40000] focus:ring-1 focus:ring-[#D40000]/30 disabled:opacity-50 cursor-pointer"
              >
                <option value="">{saving ? "Wird gespeichert..." : "– Bitte auswählen –"}</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {pick && selectedTeam && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 px-3 py-2.5 text-sm flex-shrink-0">
                <img src={getFlagUrl(selectedTeam.code)} alt="" className="w-5 h-3.5 object-contain" />
                <span className="font-bold text-zinc-900 dark:text-white">{selectedTeam.name}</span>
                <Check className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
