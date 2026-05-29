export const STAGE_LABELS: Record<string, string> = {
  group: "Gruppenphase",
  round_of_32: "Sechzehntelfinale",
  round_of_16: "Achtelfinale",
  quarter_finals: "Viertelfinale",
  semi_finals: "Halbfinale",
  third_place: "Spiel um Platz 3",
  final: "Finale",
};

export function getStageLabel(stage: string): string {
  return STAGE_LABELS[stage] || stage;
}
