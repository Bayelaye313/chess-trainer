/**
 * Identifiant stable d'une déviation de répertoire — dans `core/` plutôt que
 * `server/` ou `client/` pour la même raison qu'`opening-variation-key.ts` :
 * `server/queries/opening-mistake-review.ts` (écriture/lecture en base) ET
 * `client/features/reviews/opening-mistake-groups.ts` (lookup du badge côté
 * Hub) doivent produire EXACTEMENT la même clé pour la même déviation, sans
 * dupliquer le format des deux côtés.
 *
 * `(fenBefore, actualUci)` — jamais `openingId`/`ply`/le regroupement visuel
 * choisi côté Hub : ce sont deux données qui identifient la déviation
 * elle-même (la position fautive + le coup fautif joué), voir
 * `server/db/schema/opening-mistake-review.ts`.
 */
export function mistakeReviewKey(fenBefore: string, actualUci: string): string {
  return `${fenBefore}|${actualUci}`;
}
