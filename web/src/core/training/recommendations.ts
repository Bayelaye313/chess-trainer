export type TrainingRecommendationType = "puzzle" | "opening" | "trap" | "review";

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

/** Reserve une place aux domaines disponibles avant de remplir les places restantes par priorité. */
export function selectSessionCandidates(
  candidates: readonly RecommendationCandidate[],
  limit: number,
): RecommendationCandidate[] {
  const ordered = deduplicateCandidates(candidates);
  const selected: RecommendationCandidate[] = [];
  const selectedKeys = new Set<string>();
  for (const candidate of ordered) {
    if (selected.length >= limit) break;
    if (selected.some((item) => item.entityType === candidate.entityType)) continue;
    selected.push(candidate);
    selectedKeys.add(recommendationId(candidate));
  }
  for (const candidate of ordered) {
    if (selected.length >= limit) break;
    if (selectedKeys.has(recommendationId(candidate))) continue;
    selected.push(candidate);
  }
  return selected;
}