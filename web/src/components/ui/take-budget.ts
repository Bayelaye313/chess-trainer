/**
 * Découpe des groupes ordonnés pour n'afficher que les `limit` premiers
 * éléments au total (« 10 premiers + Voir tout »). Pur : utilisable en rendu.
 */
export function takeBudget<G, T>(groups: readonly G[], itemsOf: (group: G) => readonly T[], limit: number): { group: G; shown: readonly T[] }[] {
  const result: { group: G; shown: readonly T[] }[] = [];
  let remaining = limit;
  for (const group of groups) {
    if (remaining <= 0) break;
    const shown = itemsOf(group).slice(0, remaining);
    remaining -= shown.length;
    result.push({ group, shown });
  }
  return result;
}
