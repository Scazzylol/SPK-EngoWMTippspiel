"use server";

import { calculateKnockoutStage, advanceToNextRound } from "@/lib/knockout";
import { getSession } from "@/lib/session";

export async function triggerKnockoutCalculation() {
  const session = await getSession();
  if (!session?.user) return { error: "Nicht eingeloggt" };

  return await calculateKnockoutStage();
}

export async function triggerAdvanceRound() {
  const session = await getSession();
  if (!session?.user) return { error: "Nicht eingeloggt" };

  return await advanceToNextRound();
}
