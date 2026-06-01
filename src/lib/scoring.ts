export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number | null,
  actualAway: number | null
): number {
  if (actualHome === null || actualAway === null) return 0;

  // Exact result → 3 points
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 3;
  }

  const predictedWinner =
    predictedHome > predictedAway ? "home" : predictedHome < predictedAway ? "away" : "draw";
  const actualWinner =
    actualHome > actualAway ? "home" : actualHome < actualAway ? "away" : "draw";

  // Correct tendency (winner/draw) → 1 point
  if (predictedWinner === actualWinner) {
    return 1;
  }

  return 0;
}
