"use server";

import {
  listTrainingRecommendations,
  recordTrainingEvent,
  type RecordTrainingEventInput,
  type TrainingRecommendationDto,
} from "@/server/queries/training";

export async function logTrainingEvent(input: RecordTrainingEventInput): Promise<void> {
  await recordTrainingEvent(input);
}

export async function getTrainingRecommendations(): Promise<TrainingRecommendationDto[]> {
  return listTrainingRecommendations();
}