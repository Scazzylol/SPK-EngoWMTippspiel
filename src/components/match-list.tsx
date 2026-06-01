"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStageLabel } from "@/lib/stage-labels";
import { getFlagUrl } from "@/lib/flags";
import { savePrediction } from "@/actions/predictions";

interface Match {
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeam: string;
  homeTeamCode: string | null;
  homeTeamFlag: string | null;
  awayTeam: string;
  awayTeamCode: string | null;
  awayTeamFlag: string | null;
  matchDate: string;
  groupName?: string;
  stage: string;
  hasTeams: boolean;
  isLocked: boolean;
  homeScore: number | null;
  awayScore: number | null;
}

interface MatchTip {
  userId: string;
  homeScore: number;
  awayScore: number;
  advancementWinnerId: string | null;
  name: string;
  username: string;
}

function isKoStage(stage: string) {
  return stage !== "group" && !stage.startsWith("Gruppe");
}

type PredictionFields = { home: string; away: string; advancementWinnerId?: string };

export default function MatchList({ userId }: { userId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, PredictionFields>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [justSavedIds, setJustSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
  const [matchTips, setMatchTips] = useState<Record<string, MatchTip[]>>({});
  const [loadingTips, setLoadingTips] = useState<Set<string>>(new Set());

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await fetch(`/api/predictions?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const predMap: Record<string, PredictionFields> = {};
        const ids = new Set<string>();
        for (const p of data) {
          predMap[p.matchId] = { home: String(p.homeScore), away: String(p.awayScore), advancementWinnerId: p.advancementWinnerId ?? undefined };
          ids.add(p.matchId);
        }
        setPredictions(predMap);
        setSavedIds(ids);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchMatches();
    fetchPredictions();
  }, [fetchMatches, fetchPredictions]);

  const handlePredictionChange = (matchId: string, field: "home" | "away" | "advancementWinnerId", value: string) => {
    setPredictions((prev) => {
      const current = prev[matchId] || { home: "", away: "" };
      const newHome = field === "home" ? value : current.home;
      const newAway = field === "away" ? value : current.away;
      const isDrawNow = newHome !== "" && newAway !== "" && newHome === newAway;

      let advancementWinnerId = current.advancementWinnerId;
      if (field === "advancementWinnerId") {
        advancementWinnerId = value;
      } else if (!isDrawNow) {
        advancementWinnerId = undefined;
      }

      return {
        ...prev,
        [matchId]: { home: newHome, away: newAway, advancementWinnerId },
      };
    });
  };

  const handleSave = async (matchId: string) => {
    const pred = predictions[matchId];
    if (!pred || pred.home === "" || pred.away === "") return;

    setSavingId(matchId);
    setErrorMessage(null);
    const homeNum = parseInt(pred.home);
    const awayNum = parseInt(pred.away);
    const m = matches.find((x) => x.id === matchId);
    const isDraw = homeNum === awayNum;
    const isKO = m && m.homeTeamId && m.awayTeamId && isKoStage(m.stage);
    // Only pass advancementWinnerId when user tipped a draw in KO stage
    const advancementId = isKO && isDraw ? (pred.advancementWinnerId || null) : null;
    const result = await savePrediction(matchId, homeNum, awayNum, advancementId);
    if (result?.error) {
      setErrorMessage(result.error);
    } else {
      setSavedIds((prev) => new Set(prev).add(matchId));
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

  const handleToggleTips = async (matchId: string) => {
    if (expandedTips.has(matchId)) {
      setExpandedTips((prev) => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });
      return;
    }

    if (!matchTips[matchId]) {
      setLoadingTips((prev) => new Set(prev).add(matchId));
      try {
        const res = await fetch(`/api/predictions?matchId=${matchId}`);
        if (res.ok) {
          const data = await res.json();
          setMatchTips((prev) => ({ ...prev, [matchId]: data }));
        }
      } catch (e) {
        console.error("Failed to fetch tips:", e);
      }
      setLoadingTips((prev) => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });
    }

    setExpandedTips((prev) => new Set(prev).add(matchId));
  };

  const getStageBadge = (stage: string) => {
    const label = getStageLabel(stage);
    switch (stage) {
      case "final":
        return <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">{label}</Badge>;
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-600 dark:border-t-zinc-300" />
          Lade Spiele...
        </div>
      </div>
    );
  }

  const groupedMatches = matches.reduce((acc, match) => {
    const key = match.groupName || match.stage;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="space-y-10">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-5 py-3 text-sm text-red-600 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {Object.entries(groupedMatches).sort(([a], [b]) => {
        const stageOrder: Record<string, number> = {
          round_of_32: 1, round_of_16: 2, quarter_finals: 3,
          semi_finals: 4, third_place: 5, final: 6,
        };
        const aIsGroup = a.startsWith("Gruppe");
        const bIsGroup = b.startsWith("Gruppe");
        if (aIsGroup && bIsGroup) return a.localeCompare(b, "de");
        if (aIsGroup) return -1;
        if (bIsGroup) return 1;
        return (stageOrder[a] ?? 99) - (stageOrder[b] ?? 99);
      }).map(([groupName, groupMatches]) => (
        <div key={groupName}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{getStageLabel(groupName)}</h2>
            {groupMatches.length > 1 && (
              <Badge variant="outline" className="border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400">{groupMatches.length} Spiele</Badge>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-sm divide-y divide-zinc-100 dark:divide-white/5 overflow-hidden">
            {groupMatches.map((match) => {
              const isSaved = savedIds.has(match.id);
              const isJustSaved = justSavedIds.has(match.id);
              const isSaving = savingId === match.id;
              const isKO = match.homeTeamId && match.awayTeamId && isKoStage(match.stage);
              const pred = predictions[match.id];
              const homeNum = pred?.home !== "" && pred?.home !== undefined ? parseInt(pred.home) : NaN;
              const awayNum = pred?.away !== "" && pred?.away !== undefined ? parseInt(pred.away) : NaN;
              const isDraw = !isNaN(homeNum) && !isNaN(awayNum) && homeNum === awayNum;
              const hasClearWinner = !isNaN(homeNum) && !isNaN(awayNum) && homeNum !== awayNum;
              // Advancement required only when tipping a draw in KO stage
              const needsAdvancement = isKO && isDraw;
              const hasAdvancement = !needsAdvancement || pred?.advancementWinnerId !== undefined;
              const hasInput = pred?.home && pred?.away && hasAdvancement;

              const hasResult = match.homeScore !== null && match.awayScore !== null;
              const isMatchLocked = match.isLocked || hasResult || new Date(match.matchDate) < new Date();
              const tips = matchTips[match.id];
              const isExpanded = expandedTips.has(match.id);
              const isLoadingTips = loadingTips.has(match.id);

              return (
                <div key={match.id}>
                  {/* Mobile layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
                    {/* Top row: Date + Stage badge (mobile) */}
                    <div className="flex items-center justify-between sm:hidden mb-1">
                      <div className="text-xs text-zinc-400 font-medium">
                        {new Date(match.matchDate).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                        })}{" "}
                        {new Date(match.matchDate).toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}Uhr
                      </div>
                      <div className="flex items-center gap-2">
                        {getStageBadge(match.stage)}
                      </div>
                    </div>

                    {/* Desktop date (hidden on mobile) */}
                    <div className="hidden sm:block flex-shrink-0 w-24 text-xs text-zinc-400 font-medium">
                      {new Date(match.matchDate).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      <br />
                      {new Date(match.matchDate).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} Uhr
                    </div>

                    {/* Teams + Score */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center flex-wrap sm:flex-nowrap">
                      <span className={`font-medium text-right w-auto sm:w-32 truncate flex items-center justify-end gap-1.5 text-sm ${!match.hasTeams ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-200"}`}>
                        <span className="truncate max-w-[100px] sm:max-w-none">{match.hasTeams ? match.homeTeam : "???"}</span>
                        {match.homeTeamCode && (
                          <img src={getFlagUrl(match.homeTeamCode)} alt="" className="w-5 h-3.5 object-contain flex-shrink-0" />
                        )}
                      </span>

                      {match.hasTeams ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max="99"
                            className="w-10 sm:w-12 h-8 sm:h-9 text-center text-sm px-0.5 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:border-[#D40000] focus:ring-[#D40000]/30"
                            value={predictions[match.id]?.home ?? ""}
                            placeholder="-"
                            onChange={(e) => handlePredictionChange(match.id, "home", e.target.value)}
                          />
                          <span className="text-zinc-300 dark:text-zinc-600 font-bold">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="99"
                            className="w-10 sm:w-12 h-8 sm:h-9 text-center text-sm px-0.5 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:border-[#D40000] focus:ring-[#D40000]/30"
                            value={predictions[match.id]?.away ?? ""}
                            placeholder="-"
                            onChange={(e) => handlePredictionChange(match.id, "away", e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-400 dark:text-zinc-600 italic text-center px-2">
                          Teams noch nicht bekannt
                        </div>
                      )}

                      {/* Advancement picker – nur bei Unentschieden-Tipp */}
                      {needsAdvancement && !isMatchLocked && (
                        <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start mt-1 sm:mt-0">
                          <button
                            type="button"
                            onClick={() => handlePredictionChange(match.id, "advancementWinnerId", match.homeTeamId!)}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                              pred?.advancementWinnerId === match.homeTeamId
                                ? "bg-[#D40000] text-white border-[#D40000]"
                                : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-[#D40000]/50"
                            }`}
                          >
                            {match.homeTeam} weiter
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePredictionChange(match.id, "advancementWinnerId", match.awayTeamId!)}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                              pred?.advancementWinnerId === match.awayTeamId
                                ? "bg-[#D40000] text-white border-[#D40000]"
                                : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-[#D40000]/50"
                            }`}
                          >
                            {match.awayTeam} weiter
                          </button>
                        </div>
                      )}

                      <span className={`font-medium w-auto sm:w-32 truncate flex items-center gap-1.5 text-sm ${!match.hasTeams ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-200"}`}>
                        {match.awayTeamCode && (
                          <img src={getFlagUrl(match.awayTeamCode)} alt="" className="w-5 h-3.5 object-contain flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[100px] sm:max-w-none">{match.hasTeams ? match.awayTeam : "???"}</span>
                      </span>
                    </div>

                    {/* Badge + Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 justify-end sm:justify-start">
                      {/* Desktop stage badge (hidden on mobile, shown in top row) */}
                      <span className="hidden sm:inline">{getStageBadge(match.stage)}</span>
                      {isMatchLocked && match.hasTeams && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleTips(match.id)}
                          className="text-xs border-zinc-200 dark:border-white/10 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 dark:text-zinc-400 dark:hover:text-white"
                        >
                          {isLoadingTips ? "..." : isExpanded ? "Schließen" : "Tipps"}
                        </Button>
                      )}
                      {isMatchLocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 cursor-default border border-zinc-200 dark:border-white/5">
                          🔒 Beendet
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSave(match.id)}
                          disabled={isSaving || !hasInput || !match.hasTeams}
                          className={
                            isJustSaved
                              ? "bg-green-600 hover:bg-green-700 text-white text-xs"
                              : isSaved
                                ? "bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs"
                                : "bg-[#D40000] hover:bg-[#B00000] text-white text-xs"
                          }
                        >
                          {!match.hasTeams ? "Teams unbekannt" : isSaving ? "..." : isJustSaved ? "✓" : isSaved ? "Akt." : "Speichern"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Ausgeklappte Tipps-Liste */}
                  {isExpanded && tips && (
                    <div className="border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] px-4 py-3">
                      <div className="text-xs font-medium text-zinc-500 mb-2">Tipps aller Teilnehmer</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                        {tips.map((tip) => {
                          const isOwn = tip.userId === userId;
                          return (
                            <div
                              key={tip.userId}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs border ${
                                isOwn
                                  ? "bg-[#D40000]/10 border-[#D40000]/30"
                                  : "bg-white dark:bg-white/[0.03] border-zinc-200 dark:border-white/5"
                              }`}
                            >
                              <span className="font-medium truncate flex-1 text-zinc-700 dark:text-zinc-300">
                                {tip.name}
                                {isOwn && (
                                  <span className="text-[#D40000] ml-1 font-bold">(Du)</span>
                                )}
                              </span>
                              <div className="flex flex-col items-end">
                                <span className="font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-200">
                                  {tip.homeScore}:{tip.awayScore}
                                </span>
                                {tip.advancementWinnerId && isKoStage(match.stage) && (
                                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                    Weiter: {tip.advancementWinnerId === match.homeTeamId ? match.homeTeam : match.awayTeam}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {matches.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚽</div>
          <p className="text-lg font-medium text-zinc-900 dark:text-white">Noch keine Spiele verfügbar.</p>
          <p className="text-sm text-zinc-500 mt-1">Die WM startet bald!</p>
        </div>
      )}
    </div>
  );
}
