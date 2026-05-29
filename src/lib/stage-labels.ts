export const STAGE_LABELS: Record<string, string> = {
  group: "Gruppenphase",
  round_of_32: "Sechzehntelfinale",
  round_of_16: "Achtelfinale",
  quarter_finals: "Viertelfinale",
  semi_finals: "Halbfinale",
  third_place: "Spiel um Platz 3",
  final: "Finale",
};

export function normalizeStage(stage: string): string {
  const map: Record<string, string> = {
    GROUP: "group",
    ROUND_OF_32: "round_of_32",
    ROUND_OF_16: "round_of_16",
    QUARTER_FINALS: "quarter_finals",
    SEMI_FINALS: "semi_finals",
    THIRD_PLACE: "third_place",
    FINAL: "final",
  };
  return map[stage] || stage.toLowerCase();
}

export function getStageLabel(stage: string): string {
  return STAGE_LABELS[normalizeStage(stage)] || stage;
}
