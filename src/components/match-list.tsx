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
    }
    setSavingId(null);
  };

  const getStageBadge = (stage: string) => {
    const label = getStageLabel(stage);
    if (stage === "final") {
      return <Badge className="bg-yellow-500 text-black">{label}</Badge>;
    }
    if (stage === "group") {
      return <Badge variant="secondary">{label}</Badge>;
    }
    return <Badge>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-zinc-500">Lade Spiele...</div>
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
    <div className="space-y-8">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
        <div key={groupName}>
          <h2 className="text-xl font-semibold mb-3">{getStageLabel(groupName)}</h2>
          <div className="space-y-2">
            {groupMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-white dark:bg-zinc-900"
              >
                <div className="flex-shrink-0 w-32 text-sm text-zinc-500">
                  {new Date(match.matchDate).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <span className="font-medium text-right w-28 truncate flex items-center justify-end gap-1.5">
                    <span>{match.homeTeam}</span>
                    {match.homeTeamCode && (
                      <img src={getFlagUrl(match.homeTeamCode)} alt="" className="w-5 h-3.5 object-contain inline-block" />
                    )}
                  </span>

                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="99"
                      className="w-14 h-10 text-center"
                      value={predictions[match.id]?.home ?? ""}
                      placeholder="-"
                      onChange={(e) => handlePredictionChange(match.id, "home", e.target.value)}
                    />
                    <span className="text-zinc-400 font-bold">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="99"
                      className="w-14 h-10 text-center"
                      value={predictions[match.id]?.away ?? ""}
                      placeholder="-"
                      onChange={(e) => handlePredictionChange(match.id, "away", e.target.value)}
                    />
                  </div>

                  <span className="font-medium w-28 truncate flex items-center gap-1.5">
                    {match.awayTeamCode && (
                      <img src={getFlagUrl(match.awayTeamCode)} alt="" className="w-5 h-3.5 object-contain inline-block" />
                    )}
                    <span>{match.awayTeam}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStageBadge(match.stage)}
                  <Button
                    size="sm"
                    onClick={() => handleSave(match.id)}
                    disabled={savingId === match.id || !predictions[match.id]?.home || !predictions[match.id]?.away}
                  >
                    {savingId === match.id ? "..." : savedIds.has(match.id) ? "Aktualisieren" : "Tipp speichern"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {matches.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          Noch keine Spiele verfügbar. Die WM startet bald!
        </div>
      )}
    </div>
  );
}
