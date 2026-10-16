"use server";

/**
 * Pont client/serveur pour le suivi de révision du journal « Mes erreurs
 * d'ouverture » — voir `server/queries/opening-mistake-review.ts`. Appelé par
 * `OpeningMistakeExercise` (marquer) et `OpeningMistakesHub` (lister, pour le
 * badge persistant « ✅ Vue / Révisée »).
 */
import {
  listReviewedMistakeKeys,
  markOpeningMistakeReviewed as markOpeningMistakeReviewedQuery,
} from "@/server/queries/opening-mistake-review";

export async function markOpeningMistakeReviewed(fenBefore: string, actualUci: string): Promise<void> {
  await markOpeningMistakeReviewedQuery(fenBefore, actualUci);
}

/**
 * Un tableau plutôt qu'un `Set` : seul ce dernier ne traverse pas la
 * frontière RSC proprement. Reconstruit côté client au format
 * `${fenBefore}|${actualUci}` — un module `"use server"` ne peut exporter que
 * des fonctions async (contrainte Next.js), `mistakeReviewKey` n'est donc pas
 * réexportée ici ; voir `mistakeReviewKeyOf` côté client
 * (`opening-mistakes-hub.tsx`), qui applique le même format.
 */
export async function getReviewedMistakeKeys(): Promise<string[]> {
  return Array.from(await listReviewedMistakeKeys());
}
