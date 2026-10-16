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

/**
 * Regroupement d'AFFICHAGE : deux puzzles distincts mais à preuve identique
 * (même motif, même deck, même retard) donnaient deux cartes strictement
 * identiques. Comme toute carte puzzle lance la même séance continue, on
 * n'en garde qu'une, avec le nombre de puzzles qu'elle couvre. Les autres
 * types restent une carte par cible.
 */
export function groupRecommendationCards<T extends { entityType: TrainingRecommendationType; reasonCode: string }>(
  items: readonly T[],
): Array<{ item: T; count: number }> {
  const groups: Array<{ item: T; count: number }> = [];
  const byReason = new Map<string, { item: T; count: number }>();
  for (const item of items) {
    if (item.entityType !== "puzzle") {
      groups.push({ item, count: 1 });
      continue;
    }
    const existing = byReason.get(item.reasonCode);
    if (existing) {
      existing.count += 1;
      continue;
    }
    const group = { item, count: 1 };
    byReason.set(item.reasonCode, group);
    groups.push(group);
  }
  return groups;
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