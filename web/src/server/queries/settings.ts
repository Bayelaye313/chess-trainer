import "server-only";

import { eq } from "drizzle-orm";
import {
  DEFAULT_TRAINING_PREFERENCES,
  normalizeTrainingPreferences,
  type TrainingPreferences,
} from "@/core/training/preferences";
import { db } from "@/server/db";
import { settings } from "@/server/db/schema";
import { SETTING_KEYS } from "@/server/db/settings-keys";

export async function getTrainingPreferences(): Promise<TrainingPreferences> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, SETTING_KEYS.trainingPreferences))
    .limit(1);
  return row ? normalizeTrainingPreferences(row.value) : { ...DEFAULT_TRAINING_PREFERENCES, goals: [...DEFAULT_TRAINING_PREFERENCES.goals] };
}

export async function saveTrainingPreferences(raw: unknown): Promise<TrainingPreferences> {
  const value = normalizeTrainingPreferences(raw);
  const updatedAt = new Date();
  await db
    .insert(settings)
    .values({
      key: SETTING_KEYS.trainingPreferences,
      value,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt },
    });
  return value;
}
