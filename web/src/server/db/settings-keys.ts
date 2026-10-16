/** Clés connues de la table `settings` — JSON libre, contrat dans le domaine. */
export const SETTING_KEYS = {
  trainingPreferences: "training.preferences",
  /** Plan du jour figé par « Appliquer » — voir `core/training/daily-plan.ts`. */
  dailySession: "training.daily-session",
} as const;
