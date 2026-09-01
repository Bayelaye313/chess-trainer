import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Répétition espacée pour l'onglet « Ouvertures » (Mode Entraînement) — le
 * pendant de `reviews.ts` (FSRS, puzzles) mais volontairement plus simple :
 * un calendrier à intervalles fixes indexé sur un `streak` (façon Anki
 * débutant/Chessable), pas FSRS — voir `server/srs/opening-repetition.ts`.
 *
 * La granularité n'est PAS l'ouverture entière mais la VARIANTE (ligne
 * principale, ou une variante nommée précise du sélecteur Mode Entraînement)
 * — `variationKey` suit le format de `core/curriculum/opening-variation-key.ts`,
 * partagé avec le hook client qui écrit ici (`use-opening-drill.ts`). Le mode
 * Aléatoire/Surprise n'a par nature aucun script fixe à « maîtriser » et
 * n'est jamais persisté dans cette table.
 *
 * `userId` suit la même convention que `userThemeProgress` (`curriculum.ts`) :
 * une seule valeur possible aujourd'hui (`LOCAL_USER_ID`), la colonne existe
 * pour ne pas re-modéliser le jour où un compte existe.
 */
export const openingProgress = sqliteTable(
  "opening_progress",
  {
    userId: text("user_id").notNull(),
    /** `OpeningLine.id` (`core/curriculum/openings.ts`) — pas de FK, ce catalogue est statique, pas une table. */
    openingId: text("opening_id").notNull(),
    variationKey: text("variation_key").notNull(),
    /** Libellé affichable, dénormalisé pour le tableau de bord sans recalculer `listOpeningVariations`. */
    variationLabel: text("variation_label").notNull(),

    attemptsCount: integer("attempts_count").notNull().default(0),
    /** Réussites consécutives sans coup faux — remis à 0 au moindre coup faux du drill. */
    streak: integer("streak").notNull().default(0),
    /** Dernier score en pourcentage (coups théoriques trouvés / coups tentés, fautes comprises). */
    lastAccuracy: real("last_accuracy").notNull().default(0),
    nextReviewDate: integer("next_review_date", { mode: "timestamp" }).notNull(),
    lastPracticedAt: integer("last_practiced_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.openingId, table.variationKey] }),
    // Le tableau de bord et "Lancer les révisions du jour" filtrent tous deux sur l'échéance.
    index("opening_progress_due_idx").on(table.nextReviewDate),
    index("opening_progress_opening_idx").on(table.openingId),
  ],
);

export type OpeningProgress = typeof openingProgress.$inferSelect;
export type NewOpeningProgress = typeof openingProgress.$inferInsert;
