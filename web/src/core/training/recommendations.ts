import { DAILY_LIMIT_MAX, DAILY_LIMIT_MIN } from "./preferences";

export type TrainingRecommendationType = "puzzle" | "opening" | "trap" | "review";

export type { TrainingGoal, TrainingPreferences } from "./preferences";
export { allowedEntityTypes, normalizeTrainingPreferences } from "./preferences";
export { encodeTrainingReason, parseTrainingReason } from "./reasons";
export type { TrainingEvidence, TrainingReasonCode } from "./reasons";

export interface RecommendationCandidate {
  entityType: TrainingRecommendationType;
  entityId: string;
  reasonCode: string;
  priority: number;
  dueAt: Date;
}

/** Une candidate par cible et raison : les agrégations SQL ne doivent pas créer de doublons d'affichage. */
export function deduplicateCandidates(candidates: readonly RecommendationCandidate[]): RecommendationCandidate[] {
  const best = new Map<string, RecommendationCandidate>();
  for (const candidate of candidates) {
    const key = `${candidate.entityType}:${candidate.entityId}:${candidate.reasonCode}`;
    const current = best.get(key);
    if (!current || candidate.priority > current.priority) best.set(key, candidate);
  }
  return [...best.values()].sort(
    (left, right) => right.priority - left.priority || left.dueAt.getTime() - right.dueAt.getTime(),
  );
}

export function recommendationId(candidate: RecommendationCandidate): string {
  return `${candidate.entityType}:${candidate.entityId}:${candidate.reasonCode}`;
}

/**
 * Réserve une place aux domaines autorisés (objectifs utilisateur) avant de
 * remplir par impact. Filtrer ici, pas en SQL : le même pool reste testable
 * sans Drizzle, et un objectif vide ne peut pas vider la séance (voir
 * `allowedEntityTypes`).
 */
export function selectSessionCandidates(
  candidates: readonly RecommendationCandidate[],
  limit: number,
  allowedTypes?: readonly TrainingRecommendationType[],
): RecommendationCandidate[] {
  const scoped =
    allowedTypes && allowedTypes.length > 0
      ? candidates.filter((candidate) => allowedTypes.includes(candidate.entityType))
      : candidates;
  const capped = Math.max(DAILY_LIMIT_MIN, Math.min(DAILY_LIMIT_MAX, Math.round(limit)));
  const ordered = deduplicateCandidates(scoped);
  const selected: RecommendationCandidate[] = [];
  const selectedKeys = new Set<string>();
  for (const candidate of ordered) {
    if (selected.length >= capped) break;
    if (selected.some((item) => item.entityType === candidate.entityType)) continue;
    selected.push(candidate);
    selectedKeys.add(recommendationId(candidate));
  }
  for (const candidate of ordered) {
    if (selected.length >= capped) break;
    if (selectedKeys.has(recommendationId(candidate))) continue;
    selected.push(candidate);
  }
  return selected;
}