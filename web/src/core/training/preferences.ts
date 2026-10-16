/**
 * Objectifs de séance — clés stables persistées dans `settings`.
 * Contrairement à un simple « 3 cartes », chaque objectif autorise un type
 * d'entité : le graphe reste mixte, mais jamais hors du contrat utilisateur.
 */
export const TRAINING_GOALS = ["tactics", "openings", "traps", "review"] as const;
export type TrainingGoal = (typeof TRAINING_GOALS)[number];

export const GOAL_ENTITY_TYPE = {
  tactics: "puzzle",
  openings: "opening",
  traps: "trap",
  review: "review",
} as const satisfies Record<TrainingGoal, "puzzle" | "opening" | "trap" | "review">;

export const DAILY_LIMIT_MIN = 1;
export const DAILY_LIMIT_MAX = 8;
export const DEFAULT_DAILY_LIMIT = 3;

export interface TrainingPreferences {
  goals: TrainingGoal[];
  dailyLimit: number;
}

export const DEFAULT_TRAINING_PREFERENCES: TrainingPreferences = {
  goals: [...TRAINING_GOALS],
  dailyLimit: DEFAULT_DAILY_LIMIT,
};

export function isTrainingGoal(value: unknown): value is TrainingGoal {
  return typeof value === "string" && (TRAINING_GOALS as readonly string[]).includes(value);
}

/**
 * Contrat défensif : JSON corrompu ou partiel → plan jouable, jamais un crash
 * du tableau de bord. Au moins un objectif, charge bornée.
 */
export function normalizeTrainingPreferences(raw: unknown): TrainingPreferences {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_TRAINING_PREFERENCES, goals: [...TRAINING_GOALS] };

  const record = raw as { goals?: unknown; dailyLimit?: unknown };
  const goals = Array.isArray(record.goals)
    ? uniqueGoals(record.goals.filter(isTrainingGoal))
    : [...TRAINING_GOALS];
  const dailyLimit = clampDailyLimit(record.dailyLimit);

  return {
    goals: goals.length > 0 ? goals : [...TRAINING_GOALS],
    dailyLimit,
  };
}

export function clampDailyLimit(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_DAILY_LIMIT;
  return Math.min(DAILY_LIMIT_MAX, Math.max(DAILY_LIMIT_MIN, Math.round(numeric)));
}

export function allowedEntityTypes(
  goals: readonly TrainingGoal[],
): Array<(typeof GOAL_ENTITY_TYPE)[TrainingGoal]> {
  const types = uniqueGoals(goals).map((goal) => GOAL_ENTITY_TYPE[goal]);
  return types.length > 0 ? types : TRAINING_GOALS.map((goal) => GOAL_ENTITY_TYPE[goal]);
}

function uniqueGoals(goals: readonly TrainingGoal[]): TrainingGoal[] {
  const seen = new Set<TrainingGoal>();
  const ordered: TrainingGoal[] = [];
  for (const goal of goals) {
    if (seen.has(goal)) continue;
    seen.add(goal);
    ordered.push(goal);
  }
  return ordered;
}
