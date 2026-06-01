export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number | null,
  actualAway: number | null,
  options?: {
    predictedAdvancementWinnerId?: string | null;
    actualAdvancementWinnerId?: string | null;
  }
): number {
  if (actualHome === null || actualAway === null) return 0;

  const isExact = predictedHome === actualHome && predictedAway === actualAway;
  const predictedWinner =
    predictedHome > predictedAway ? "home" : predictedHome < predictedAway ? "away" : "draw";
  const actualWinner =
    actualHome > actualAway ? "home" : actualHome < actualAway ? "away" : "draw";
  const isTendencyCorrect = predictedWinner === actualWinner;

  const isDrawTip = predictedHome === predictedAway;
  const isActualDraw = actualHome !== null && actualAway !== null && actualHome === actualAway;
  const hasAdvancementPick = isActualDraw && options?.actualAdvancementWinnerId != null;

  if (isDrawTip && hasAdvancementPick) {
    const advancementCorrect =
      options?.predictedAdvancementWinnerId === options?.actualAdvancementWinnerId;

    if (isExact) {
      return 1 + (advancementCorrect ? 2 : 0);
    }
    if (isTendencyCorrect) {
      return 1 + (advancementCorrect ? 1 : 0);
    }
    return 0;
  }

  if (isExact) return 3;
  if (isTendencyCorrect) return 1;
  return 0;
}

export function getMatchWinner(match: {
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  advancementWinnerId?: string | null;
}): string | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  if (!match.homeTeamId || !match.awayTeamId) return null;

  if (match.homeScore > match.awayScore) return match.homeTeamId;
  if (match.awayScore > match.homeScore) return match.awayTeamId;

  return match.advancementWinnerId ?? null;
}
