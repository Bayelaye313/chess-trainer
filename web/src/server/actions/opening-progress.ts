"use server";

/**
 * Pont client/serveur pour la répétition espacée des ouvertures — appelé par
 * `use-opening-drill.ts` à la fin d'un drill « Ligne principale »/« Variante »
 * (jamais en mode Aléatoire, voir le docstring de `opening-progress.ts`).
 *
 * Contrairement à `server/actions/openings.ts`, PAS un simple pont 1:1 vers
 * la query : `recordOpeningDrillResultQuery` renvoie des `Date` (voir
 * `OpeningProgressRow`), et une Server Action ne doit faire traverser au
 * client que des valeurs sérialisables au sens RSC — même règle que
 * `DeckOverview`/`DeckPuzzle` (`server/queries/reviews.ts`), qui exposent
 * `dueCount: number` plutôt qu'une échéance brute. `nextReviewInDays` est
 * calculé ICI (encore côté serveur, avec la vraie horloge) plutôt que
 * délégué au client.
 *
 * `getOpeningReviewSummaries`/`getDueOpeningReviews` n'ont pas d'équivalent
 * ici : `app/ouvertures/page.tsx`, un Server Component, appelle directement
 * `server/queries/opening-progress.ts` — comme `getOpeningDetail` pour
 * `/ouvertures/[slug]` (voir `server/actions/openings.ts`).
 */
import { recordOpeningDrillResult as recordOpeningDrillResultQuery, type RecordOpeningDrillInput } from "@/server/queries/opening-progress";

export interface OpeningDrillProgressSummary {
  attemptsCount: number;
  streak: number;
  lastAccuracy: number;
  /** Jours avant la prochaine révision, arrondi — jamais négatif même si l'horloge a un peu dérivé. */
  nextReviewInDays: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function recordOpeningDrillResult(input: RecordOpeningDrillInput): Promise<OpeningDrillProgressSummary> {
  const row = await recordOpeningDrillResultQuery(input);
  return {
    attemptsCount: row.attemptsCount,
    streak: row.streak,
    lastAccuracy: row.lastAccuracy,
    nextReviewInDays: Math.max(0, Math.round((row.nextReviewDate.getTime() - Date.now()) / DAY_MS)),
  };
}
