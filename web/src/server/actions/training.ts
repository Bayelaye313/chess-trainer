"use server";

import { requireUser } from "@/server/auth/session";
import {
  listTrainingRecommendations,
  recordTrainingEvent,
  type RecordTrainingEventInput,
  type TrainingRecommendationDto,
} from "@/server/queries/training";
import { getTrainingPreferences, saveTrainingPreferences } from "@/server/queries/settings";
import { applyDailyPlan as applyDailyPlanQuery, clearDailySession, type DailySessionState } from "@/server/queries/daily-plan";
import type { TrainingPreferences } from "@/core/training/preferences";

export async function logTrainingEvent(input: RecordTrainingEventInput): Promise<void> {
  await recordTrainingEvent((await requireUser()).id, input);
}

export async function getTrainingRecommendations(): Promise<TrainingRecommendationDto[]> {
  return listTrainingRecommendations((await requireUser()).id);
}

export async function loadTrainingPreferences(): Promise<TrainingPreferences> {
  return getTrainingPreferences((await requireUser()).id);
}

export async function updateTrainingPreferences(raw: unknown): Promise<TrainingPreferences> {
  const saved = await saveTrainingPreferences((await requireUser()).id, raw);
  return saved;
}

export async function applyDailyPlan(
  raw: unknown,
): Promise<{ preferences: TrainingPreferences; state: DailySessionState }> {
  return applyDailyPlanQuery((await requireUser()).id, raw);
}

export async function resetDailyPlan(): Promise<void> {
  await clearDailySession((await requireUser()).id);
}
