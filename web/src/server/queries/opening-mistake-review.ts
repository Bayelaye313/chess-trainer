import "server-only";

/**
 * Lectures et écritures du suivi de révision du journal « Mes erreurs
 * d'ouverture » — voir `server/db/schema/opening-mistake-review.ts` pour la
 * clé et le rôle exact. Écrit par `OpeningMistakeExercise` dès qu'une
 * correction ciblée se termine (toujours un succès — méthode Listudy
 * stricte, voir son docstring) ; lu par `OpeningMistakesHub` pour le badge
 * persistant « ✅ Vue / Révisée ».
 */
import { mistakeReviewKey } from "@/core/curriculum/opening-mistake-key";
import { db } from "@/server/db";
import { openingMistakeReview, userScope } from "@/server/db/user-scope";

export { mistakeReviewKey };

/**
 * Marque une déviation comme corrigée avec succès au moins une fois —
 * idempotent (`onConflictDoNothing`) : la date retenue est celle de la
 * PREMIÈRE correction réussie, pas la plus récente, sans que ça change quoi
 * que ce soit pour l'affichage (un simple badge booléen).
 */
export async function markOpeningMistakeReviewed(
  userId: string,
  fenBefore: string,
  actualUci: string,
  now: Date = new Date(),
): Promise<void> {
  await db
    .insert(openingMistakeReview)
    .values(userScope(userId).own({ fenBefore, actualUci, reviewedAt: now }))
    .onConflictDoNothing();
}

/**
 * Toutes les déviations déjà corrigées avec succès au moins une fois, sous
 * forme de clés `mistakeReviewKey` — un `Set` pour un lookup O(1) côté Hub,
 * qui doit vérifier le statut de chaque erreur affichée.
 */
export async function listReviewedMistakeKeys(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ fenBefore: openingMistakeReview.fenBefore, actualUci: openingMistakeReview.actualUci })
    .from(openingMistakeReview)
    .where(userScope(userId).owns(openingMistakeReview));
  return new Set(rows.map((row) => mistakeReviewKey(row.fenBefore, row.actualUci)));
}
