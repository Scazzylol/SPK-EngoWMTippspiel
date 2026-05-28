"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  group?: string;
  stage: string;
}

export default function MatchList({ userId }: { userId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<{ [key: string]: { home: string; away: string } }>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
    fetchPredictions();
  }, []);

  const fetchMatches = async () => {
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
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`/api/predictions?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const predMap: { [key: string]: { home: string; away: string } } = {};
        for (const p of data) {
          predMap[p.matchId] = { home: String(p.homeScore), away: String(p.awayScore) };
          savedIds.add(p.matchId);
        }
        setPredictions(predMap);
        setSavedIds(new Set(savedIds));
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    }
  };

  const handlePredictionChange = (matchId: string, field: "home" | "away", value: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const savePrediction = async (matchId: string) => {
    const pred = predictions[matchId];
    if (!pred || pred.home === "" || pred.away === "") return;

    setSavingId(matchId);
    try {
      await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          matchId,
          homeScore: parseInt(pred.home),
          awayScore: parseInt(pred.away),
        }),
      });
    } catch (error) {
      console.error("Failed to save prediction:", error);
    } finally {
      setSavedIds((prev) => new Set(prev).add(matchId));
      setSavingId(null);
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "group":
        return <Badge variant="secondary">Gruppenphase</Badge>;
      case "round_of_32":
        return <Badge variant="outline">Achtelfinale (32)</Badge>;
      case "round_of_16":
        return <Badge>Achtelfinale</Badge>;
      case "quarter_finals":
        return <Badge>Viertelfinale</Badge>;
      case "semi_finals":
        return <Badge>Halbfinale</Badge>;
      case "third_place":
        return <Badge>Spiel um Platz 3</Badge>;
      case "final":
        return <Badge className="bg-yellow-500 text-black">Finale</Badge>;
      default:
        return <Badge>{stage}</Badge>;
    }
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
      {Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
        <div key={groupName}>
          <h2 className="text-xl font-semibold mb-3">{groupName}</h2>
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
                  <span className="font-medium text-right w-28">{match.homeTeam}</span>

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

                  <span className="font-medium w-28">{match.awayTeam}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStageBadge(match.stage)}
                  <Button
                    size="sm"
                    onClick={() => savePrediction(match.id)}
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
