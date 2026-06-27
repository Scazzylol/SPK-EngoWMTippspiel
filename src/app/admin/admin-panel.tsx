"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStageLabel, normalizeStage } from "@/lib/stage-labels";
import { getAdminMatches, updateMatchResult, toggleMatchLock, calculateKnockout } from "@/actions/admin";

interface AdminMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  groupName: string | null;
  stage: string;
  startTime: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  advancementWinnerId: string | null;
  isLocked: boolean;
}

interface ScoreFields {
  home: string;
  away: string;
  advancementWinnerId?: string;
}

function getStageBadge(stage: string) {
  const label = getStageLabel(stage);
  const s = normalizeStage(stage);
  switch (s) {
    case "final":
      return <Badge className="bg-yellow-500 text-black">{label}</Badge>;
    case "semi_finals":
      return <Badge className="border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300">{label}</Badge>;
    case "quarter_finals":
      return <Badge className="border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">{label}</Badge>;
    case "round_of_16":
      return <Badge className="border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">{label}</Badge>;
    case "round_of_32":
      return <Badge className="border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300">{label}</Badge>;
    case "third_place":
      return <Badge className="border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300">{label}</Badge>;
    case "group":
      return <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800">{label}</Badge>;
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
}

function isKoStage(stage: string) {
  return normalizeStage(stage) !== "group";
}

export default function AdminPanel() {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreFields>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [justSavedIds, setJustSavedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculatingKo, setCalculatingKo] = useState(false);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const data = await getAdminMatches();
    setMatches(data);
    const initialScores: Record<string, ScoreFields> = {};
    const initialSaved = new Set<string>();
    for (const m of data) {
      initialScores[m.id] = {
        home: m.homeScore !== null ? String(m.homeScore) : "",
        away: m.awayScore !== null ? String(m.awayScore) : "",
        advancementWinnerId: m.advancementWinnerId === m.homeTeamId ? "home" : m.advancementWinnerId === m.awayTeamId ? "away" : undefined,
      };
      if (m.homeScore !== null) initialSaved.add(m.id);
    }
    setScores(initialScores);
    setSavedIds(initialSaved);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  function getEffectiveAdvancement(match: AdminMatch): string | null {
    const s = scores[match.id];
    if (!s) return null;
    const homeNum = s.home !== "" ? parseInt(s.home) : NaN;
    const awayNum = s.away !== "" ? parseInt(s.away) : NaN;
    if (isNaN(homeNum) || isNaN(awayNum)) return null;
    if (homeNum > awayNum) return "home";
    if (awayNum > homeNum) return "away";
    return s.advancementWinnerId === "home" ? "home" : s.advancementWinnerId === "away" ? "away" : null;
  }

  const handleSave = async (matchId: string) => {
    const s = scores[matchId];
    const home = s?.home !== "" ? parseInt(s.home) : null;
    const away = s?.away !== "" ? parseInt(s.away) : null;

    if (home !== null && (isNaN(home) || home < 0 || home > 99)) return;
    if (away !== null && (isNaN(away) || away < 0 || away > 99)) return;

    setSavingId(matchId);
    setMessage(null);

    const match = matches.find((m) => m.id === matchId);
    const isKO = match && isKoStage(match.stage);
    const isDraw = home !== null && away !== null && home === away;
    // Only store advancementWinnerId for KO matches that ended in a draw
    const advancementWinnerId = isKO && isDraw && match
      ? (s.advancementWinnerId === "home" ? match.homeTeamId : s.advancementWinnerId === "away" ? match.awayTeamId : null)
      : null;

    const result = await updateMatchResult(matchId, home, away, advancementWinnerId);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Ergebnis gespeichert" });
      setSavedIds((prev) => new Set(prev).add(matchId));
      fetchMatches();
      setJustSavedIds((prev) => new Set(prev).add(matchId));
      setTimeout(() => {
        setJustSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(matchId);
          return next;
        });
      }, 2000);
    }
    setSavingId(null);
  };

  const handleToggleLock = async (matchId: string) => {
    setMessage(null);
    const result = await toggleMatchLock(matchId);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Status geändert" });
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, isLocked: !m.isLocked } : m))
      );
    }
  };

  const handleCalculateKnockout = async () => {
    setCalculatingKo(true);
    setMessage(null);
    const result = await calculateKnockout();
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "KO-Phase berechnet – Teams wurden gesetzt" });
      fetchMatches();
    }
    setCalculatingKo(false);
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-3.5rem)]">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950" />
        <div className="relative z-10 flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-zinc-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-600 dark:border-t-zinc-300" />
            Lade Admin-Panel...
          </div>
        </div>
      </div>
    );
  }

  const groupedMatches = matches.reduce(
    (acc, m) => {
      const key = m.groupName || normalizeStage(m.stage);
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {} as Record<string, AdminMatch[]>
  );

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D40000]/5 via-transparent to-transparent dark:from-[#D40000]/10" />

      <div className="relative z-10 container mx-auto py-10 px-4">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            Admin{" "}
            <span className="bg-gradient-to-r from-red-300 via-[#D40000] to-red-700 bg-clip-text text-transparent">
              Panel
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Spiele verwalten und Ergebnisse eintragen
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl border backdrop-blur-sm px-5 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300"
                : "border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-8 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">KO-Phase berechnen</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Nachdem alle Gruppenspiele Ergebnisse haben, werden hier die KO-Paarungen nach FIFA-2026-Regel berechnet
              </p>
            </div>
            <Button
              onClick={handleCalculateKnockout}
              disabled={calculatingKo}
              className="bg-zinc-900 dark:bg-white/10 hover:bg-zinc-700 dark:hover:bg-white/15 text-white w-full sm:w-auto"
            >
              {calculatingKo ? "Berechne..." : "KO-Phase berechnen"}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
            <div key={groupName}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{getStageLabel(groupName)}</h2>
                <Badge variant="outline" className="border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400">
                  {groupMatches.length} Spiele
                </Badge>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-white/5">
                      <th className="text-left px-4 py-3 font-medium text-zinc-500 w-32">Datum</th>
                      <th className="text-left px-4 py-3 font-medium text-zinc-500">Spiel</th>
                      <th className="text-center px-4 py-3 font-medium text-zinc-500 w-40">Ergebnis</th>
                      <th className="text-center px-4 py-3 font-medium text-zinc-500 w-24">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-zinc-500 w-32">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {groupMatches.map((match) => {
                      const isSaving = savingId === match.id;
                      const homeNum = scores[match.id]?.home !== "" ? parseInt(scores[match.id]?.home || "") : NaN;
                      const awayNum = scores[match.id]?.away !== "" ? parseInt(scores[match.id]?.away || "") : NaN;
                      const isDraw = !isNaN(homeNum) && !isNaN(awayNum) && homeNum === awayNum;
                      const hasClearWinner = !isNaN(homeNum) && !isNaN(awayNum) && homeNum !== awayNum;
                      const isKO = match.homeTeamId && match.awayTeamId && isKoStage(match.stage);
                      const hasScore = scores[match.id]?.home !== "" && scores[match.id]?.away !== "";

                      return (
                        <tr
                          key={match.id}
                          className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-zinc-400">
                            {new Date(match.startTime).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                            <br />
                            {new Date(match.startTime).toLocaleTimeString("de-DE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} Uhr
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">{match.homeTeam}</span>
                              <span className="text-zinc-300 dark:text-zinc-600">–</span>
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">{match.awayTeam}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="99"
                                  className="w-12 h-8 text-center text-sm px-1 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:border-[#D40000] focus:ring-[#D40000]/30"
                                  value={scores[match.id]?.home ?? ""}
                                  placeholder="-"
                                  onChange={(e) =>
                                    setScores((prev) => ({
                                      ...prev,
                                      [match.id]: { ...prev[match.id], home: e.target.value },
                                    }))
                                  }
                                />
                                <span className="text-zinc-300 dark:text-zinc-600 font-bold">:</span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="99"
                                  className="w-12 h-8 text-center text-sm px-1 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:border-[#D40000] focus:ring-[#D40000]/30"
                                  value={scores[match.id]?.away ?? ""}
                                  placeholder="-"
                                  onChange={(e) =>
                                    setScores((prev) => ({
                                      ...prev,
                                      [match.id]: { ...prev[match.id], away: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                              {/* Advancement picker – nur bei Unentschieden-Ergebnis */}
                              {isKO && !isNaN(homeNum) && !isNaN(awayNum) && isDraw && (
                                <div className="flex items-center gap-2 mt-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setScores((prev) => ({
                                        ...prev,
                                        [match.id]: { ...prev[match.id], advancementWinnerId: "home" },
                                      }))
                                    }
                                    className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                                      scores[match.id]?.advancementWinnerId === "home"
                                        ? "bg-[#D40000] text-white border-[#D40000]"
                                        : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10"
                                    }`}
                                  >
                                    {match.homeTeam} weiter
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setScores((prev) => ({
                                        ...prev,
                                        [match.id]: { ...prev[match.id], advancementWinnerId: "away" },
                                      }))
                                    }
                                    className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                                      scores[match.id]?.advancementWinnerId === "away"
                                        ? "bg-[#D40000] text-white border-[#D40000]"
                                        : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10"
                                    }`}
                                  >
                                    {match.awayTeam} weiter
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleLock(match.id)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                match.isLocked
                                  ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                                  : "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  match.isLocked ? "bg-red-500" : "bg-green-500"
                                }`}
                              />
                              {match.isLocked ? "Gesperrt" : "Offen"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleSave(match.id)}
                              disabled={isSaving || !hasScore}
                              className={
                                justSavedIds.has(match.id)
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : savedIds.has(match.id)
                                    ? "bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300"
                                    : "bg-[#D40000] hover:bg-[#B00000] text-white"
                              }
                            >
                              {isSaving ? "..." : justSavedIds.has(match.id) ? "✓ Gespeichert" : "Speichern"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
