export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number | null,
  actualAway: number | null
): number {
  if (actualHome === null || actualAway === null) return 0;

  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 5;
  }

  const predictedWinner = predictedHome > predictedAway ? "home" : predictedHome < predictedAway ? "away" : "draw";
  const actualWinner = actualHome > actualAway ? "home" : actualHome < actualAway ? "away" : "draw";

  if (predictedWinner === actualWinner) {
    const predictedDiff = Math.abs(predictedHome - predictedAway);
    const actualDiff = Math.abs(actualHome - actualAway);
    if (predictedDiff === actualDiff && predictedWinner !== "draw") {
      return 3;
    }
    return 2;
  }

  return 0;
}
