import "server-only";

import { eq } from "drizzle-orm";
import {
  DEFAULT_TRAINING_PREFERENCES,
  normalizeTrainingPreferences,
  type TrainingPreferences,
} from "@/core/training/preferences";
import { db } from "@/server/db";
import { settings, userScope } from "@/server/db/user-scope";
import { SETTING_KEYS } from "@/server/db/settings-keys";

export async function getTrainingPreferences(userId: string): Promise<TrainingPreferences> {
  const s = userScope(userId);
  const [row] = await db
    .select()
    .from(settings)
    .where(s.where(settings, eq(settings.key, SETTING_KEYS.trainingPreferences)))
    .limit(1);
  return row ? normalizeTrainingPreferences(row.value) : { ...DEFAULT_TRAINING_PREFERENCES, goals: [...DEFAULT_TRAINING_PREFERENCES.goals] };
}

export async function saveTrainingPreferences(userId: string, raw: unknown): Promise<TrainingPreferences> {
  const s = userScope(userId);
  const value = normalizeTrainingPreferences(raw);
  const updatedAt = new Date();
  await db
    .insert(settings)
    .values(
      s.own({
        key: SETTING_KEYS.trainingPreferences,
        value,
        updatedAt,
      }),
    )
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value, updatedAt },
    });
  return value;
}
