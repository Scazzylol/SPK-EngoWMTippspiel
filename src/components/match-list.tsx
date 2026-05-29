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
  name: string;
  username: string;
}

export default function MatchList({ userId }: { userId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<{ [key: string]: { home: string; away: string } }>({});
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
        const predMap: { [key: string]: { home: string; away: string } } = {};
        const ids = new Set<string>();
        for (const p of data) {
          predMap[p.matchId] = { home: String(p.homeScore), away: String(p.awayScore) };
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

  const handlePredictionChange = (matchId: string, field: "home" | "away", value: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (matchId: string) => {
    const pred = predictions[matchId];
    if (!pred || pred.home === "" || pred.away === "") return;

    setSavingId(matchId);
    setErrorMessage(null);
    const result = await savePrediction(matchId, parseInt(pred.home), parseInt(pred.away));
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
        return <Badge className="border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300">{label}</Badge>;
      case "quarter_finals":
        return <Badge className="border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{label}</Badge>;
      case "round_of_16":
        return <Badge className="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300">{label}</Badge>;
      case "round_of_32":
        return <Badge className="border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300">{label}</Badge>;
      case "third_place":
        return <Badge className="border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300">{label}</Badge>;
      case "group":
        return <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800">{label}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
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
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 backdrop-blur-sm px-5 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
        <div key={groupName}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-white">{getStageLabel(groupName)}</h2>
            {groupMatches.length > 1 && (
              <Badge variant="outline" className="border-white/10 text-zinc-400">{groupMatches.length} Spiele</Badge>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm divide-y divide-white/5 overflow-hidden">
            {groupMatches.map((match) => {
              const isSaved = savedIds.has(match.id);
              const isJustSaved = justSavedIds.has(match.id);
              const isSaving = savingId === match.id;
              const hasInput = predictions[match.id]?.home && predictions[match.id]?.away;

              const hasResult = match.homeScore !== null && match.awayScore !== null;
              const isMatchLocked = match.isLocked || hasResult || new Date(match.matchDate) < new Date();
              const tips = matchTips[match.id];
              const isExpanded = expandedTips.has(match.id);
              const isLoadingTips = loadingTips.has(match.id);

              return (
                <div key={match.id}>
                  <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors">
                    {/* Datum */}
                    <div className="flex-shrink-0 w-24 text-xs text-zinc-500 font-medium">
                      {new Date(match.matchDate).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      <br />
                      {new Date(match.matchDate).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* Teams + Score */}
                    <div className="flex items-center gap-3 flex-1 justify-center">
                      <span className={`font-medium text-right w-32 truncate flex items-center justify-end gap-2 text-sm ${!match.hasTeams ? "text-zinc-600" : "text-zinc-200"}`}>
                        <span>{match.hasTeams ? match.homeTeam : "???"}</span>
                        {match.homeTeamCode && (
                          <img src={getFlagUrl(match.homeTeamCode)} alt="" className="w-5 h-3.5 object-contain" />
                        )}
                      </span>

                      {match.hasTeams ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min="0"
                            max="99"
                            className="w-12 h-9 text-center text-sm px-1 bg-white/5 border-white/10 text-white focus:border-[#D40000] focus:ring-[#D40000]/30"
                            value={predictions[match.id]?.home ?? ""}
                            placeholder="-"
                            onChange={(e) => handlePredictionChange(match.id, "home", e.target.value)}
                          />
                          <span className="text-zinc-600 font-bold">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="99"
                            className="w-12 h-9 text-center text-sm px-1 bg-white/5 border-white/10 text-white focus:border-[#D40000] focus:ring-[#D40000]/30"
                            value={predictions[match.id]?.away ?? ""}
                            placeholder="-"
                            onChange={(e) => handlePredictionChange(match.id, "away", e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-600 italic text-center px-2">
                          Teams noch nicht bekannt
                        </div>
                      )}

                      <span className={`font-medium w-32 truncate flex items-center gap-2 text-sm ${!match.hasTeams ? "text-zinc-600" : "text-zinc-200"}`}>
                        {match.awayTeamCode && (
                          <img src={getFlagUrl(match.awayTeamCode)} alt="" className="w-5 h-3.5 object-contain" />
                        )}
                        <span>{match.hasTeams ? match.awayTeam : "???"}</span>
                      </span>
                    </div>

                    {/* Badge + Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStageBadge(match.stage)}
                      {isMatchLocked && match.hasTeams && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleTips(match.id)}
                          className="text-xs border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                        >
                          {isLoadingTips ? "..." : isExpanded ? "Schließen" : "Tipps"}
                        </Button>
                      )}
                      {isMatchLocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-white/5 text-zinc-500 cursor-default border border-white/5">
                          🔒 Beendet
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSave(match.id)}
                          disabled={isSaving || !hasInput || !match.hasTeams}
                          className={
                            isJustSaved
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : isSaved
                                ? "bg-white/10 hover:bg-white/15 text-zinc-300"
                                : "bg-[#D40000] hover:bg-[#B00000] text-white"
                          }
                        >
                          {!match.hasTeams ? "Teams unbekannt" : isSaving ? "..." : isJustSaved ? "✓ Gespeichert" : isSaved ? "Aktualisieren" : "Tipp speichern"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Ausgeklappte Tipps-Liste */}
                  {isExpanded && tips && (
                    <div className="border-t border-white/5 bg-white/[0.02] px-4 py-3">
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
                                  : "bg-white/[0.03] border-white/5"
                              }`}
                            >
                              <span className="font-medium truncate flex-1 text-zinc-300">
                                {tip.name}
                                {isOwn && (
                                  <span className="text-[#D40000] ml-1 font-bold">(Du)</span>
                                )}
                              </span>
                              <span className="font-mono font-bold tabular-nums text-zinc-200">
                                {tip.homeScore}:{tip.awayScore}
                              </span>
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
          <p className="text-lg font-medium text-white">Noch keine Spiele verfügbar.</p>
          <p className="text-sm text-zinc-500 mt-1">Die WM startet bald!</p>
        </div>
      )}
    </div>
  );
}
