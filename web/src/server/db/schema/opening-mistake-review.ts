import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Suivi de révision du journal « Mes erreurs d'ouverture »
 * (`client/features/reviews/opening-mistakes-hub.tsx`) : une ligne ici
 * signifie « cette déviation précise a déjà été corrigée avec succès au
 * moins une fois » — sert le badge persistant « ✅ Vue / Révisée » du Hub, à
 * travers rechargements et sessions (jamais un simple état React local, qui
 * se serait perdu à la moindre navigation).
 *
 * Clé de la déviation : `(fenBefore, actualUci)` — la même paire qui
 * identifie une déviation dans `server/queries/opening-mistakes.ts`
 * (`RepertoireDeviation`/`DeviationGameSummary`), STABLE quel que soit le
 * regroupement visuel choisi côté Hub (par famille d'ouverture, par
 * sous-variante…) — jamais `openingId`/`ply`, qui décrivent le contexte, pas
 * la déviation elle-même.
 *
 * `userId` suit la même convention que `openingProgress`/`userThemeProgress` :
 * une seule valeur possible aujourd'hui (`LOCAL_USER_ID`), la colonne existe
 * pour ne pas re-modéliser le jour où un compte existe.
 */
export const openingMistakeReview = sqliteTable(
  "opening_mistake_review",
  {
    userId: text("user_id").notNull(),
    fenBefore: text("fen_before").notNull(),
    actualUci: text("actual_uci").notNull(),
    reviewedAt: integer("reviewed_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.fenBefore, table.actualUci] })],
);

export type OpeningMistakeReview = typeof openingMistakeReview.$inferSelect;
export type NewOpeningMistakeReview = typeof openingMistakeReview.$inferInsert;
