import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Historique d'endurance « Sans Guide » — une ligne par Manche 2 terminée
 * (ligne principale ou variante), voir `core/curriculum/opening-endurance.ts`.
 * Journal en AJOUT SEUL, contrairement à `opening_progress` (un upsert par
 * variante) : l'écran d'historique a besoin de chaque session, pas du seul
 * dernier état. Vit dans le fichier SQLite unique, donc dans la sauvegarde
 * habituelle (copie de `data/chess-trainer.db`).
 *
 * `userId` : même convention que `opening_progress` (`LOCAL_USER_ID`).
 */
export const openingEnduranceSessions = sqliteTable(
  "opening_endurance_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    /** `OpeningLine.id` — pas de FK, le catalogue est statique. */
    openingId: text("opening_id").notNull(),
    /** Nom de l'ouverture dénormalisé : l'historique se lit sans recharger le catalogue. */
    openingName: text("opening_name").notNull(),
    /** Format `core/curriculum/opening-variation-key.ts`, comme `opening_progress.variation_key`. */
    variationKey: text("variation_key").notNull(),
    variationLabel: text("variation_label").notNull(),
    /** Ply absolu de la première faute, `null` pour une manche sans faute. */
    firstMistakePly: integer("first_mistake_ply"),
    lastPly: integer("last_ply").notNull(),
    /** Précision en % (0-100). */
    accuracy: real("accuracy").notNull(),
    playedAt: integer("played_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    // L'historique se lit toujours « un utilisateur, plus récent d'abord ».
    index("opening_endurance_user_time_idx").on(table.userId, table.playedAt),
  ],
);

export type OpeningEnduranceSession = typeof openingEnduranceSessions.$inferSelect;
export type NewOpeningEnduranceSession = typeof openingEnduranceSessions.$inferInsert;
