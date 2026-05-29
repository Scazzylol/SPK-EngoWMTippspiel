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
}

export default function MatchList({ userId }: { userId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<{ [key: string]: { home: string; away: string } }>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [justSavedIds, setJustSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const getStageBadge = (stage: string) => {
    const label = getStageLabel(stage);
    if (stage === "final") {
      return <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">{label}</Badge>;
    }
    if (stage === "group") {
      return <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800">{label}</Badge>;
    }
    return <Badge className="bg-[#D40000] hover:bg-[#B00000] text-white">{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
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
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
        <div key={groupName}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold">{getStageLabel(groupName)}</h2>
            {groupMatches.length > 1 && (
              <Badge variant="outline" className="text-zinc-500">{groupMatches.length} Spiele</Badge>
            )}
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
            {groupMatches.map((match) => {
              const isSaved = savedIds.has(match.id);
              const isJustSaved = justSavedIds.has(match.id);
              const isSaving = savingId === match.id;
              const hasInput = predictions[match.id]?.home && predictions[match.id]?.away;

              return (
                <div
                  key={match.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Datum */}
                  <div className="flex-shrink-0 w-28 text-xs text-zinc-400 font-medium">
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
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <span className="font-medium text-right w-28 truncate flex items-center justify-end gap-1.5 text-sm">
                      <span>{match.homeTeam}</span>
                      {match.homeTeamCode && (
                        <img src={getFlagUrl(match.homeTeamCode)} alt="" className="w-5 h-3.5 object-contain" />
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        max="99"
                        className="w-12 h-9 text-center text-sm px-1"
                        value={predictions[match.id]?.home ?? ""}
                        placeholder="-"
                        onChange={(e) => handlePredictionChange(match.id, "home", e.target.value)}
                      />
                      <span className="text-zinc-300 dark:text-zinc-600 font-bold">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="99"
                        className="w-12 h-9 text-center text-sm px-1"
                        value={predictions[match.id]?.away ?? ""}
                        placeholder="-"
                        onChange={(e) => handlePredictionChange(match.id, "away", e.target.value)}
                      />
                    </div>

                    <span className="font-medium w-28 truncate flex items-center gap-1.5 text-sm">
                      {match.awayTeamCode && (
                        <img src={getFlagUrl(match.awayTeamCode)} alt="" className="w-5 h-3.5 object-contain" />
                      )}
                      <span>{match.awayTeam}</span>
                    </span>
                  </div>

                  {/* Badge + Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStageBadge(match.stage)}
                    <Button
                      size="sm"
                      onClick={() => handleSave(match.id)}
                      disabled={isSaving || !hasInput}
                      className={
                        isJustSaved
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : isSaved
                            ? "bg-zinc-600 hover:bg-zinc-700 text-white"
                            : "bg-[#D40000] hover:bg-[#B00000] text-white"
                      }
                    >
                      {isSaving ? "..." : isJustSaved ? "✓ Gespeichert" : isSaved ? "Aktualisieren" : "Tipp speichern"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {matches.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-4xl mb-4">⚽</div>
          <p className="text-lg font-medium">Noch keine Spiele verfügbar.</p>
          <p className="text-sm mt-1">Die WM startet bald!</p>
        </div>
      )}
    </div>
  );
}
