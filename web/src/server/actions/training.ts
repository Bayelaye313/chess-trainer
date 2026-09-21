"use server";

import {
  listTrainingRecommendations,
  recordTrainingEvent,
  type RecordTrainingEventInput,
  type TrainingRecommendationDto,
} from "@/server/queries/training";
import { getTrainingPreferences, saveTrainingPreferences } from "@/server/queries/settings";
import type { TrainingPreferences } from "@/core/training/preferences";

export async function logTrainingEvent(input: RecordTrainingEventInput): Promise<void> {
  await recordTrainingEvent(input);
}

export async function getTrainingRecommendations(): Promise<TrainingRecommendationDto[]> {
  return listTrainingRecommendations();
}

export async function loadTrainingPreferences(): Promise<TrainingPreferences> {
  return getTrainingPreferences();
}

export async function updateTrainingPreferences(raw: unknown): Promise<TrainingPreferences> {
  const saved = await saveTrainingPreferences(raw);
  return saved;
}
