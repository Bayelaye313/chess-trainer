import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { puzzles } from "./puzzles";

/**
 * État de répétition espacée d'un puzzle, au format FSRS.
 *
 * Le prototype utilisait Leitner (5 boîtes, intervalles fixes). FSRS modélise
 * stabilité et difficulté par carte et place la révision au moment où l'oubli
 * devient probable — nettement plus efficace à volume égal.
 *
 * Les noms de colonnes suivent le modèle `Card` de ts-fsrs pour que la
 * conversion reste triviale.
 */
export const reviews = sqliteTable(
  "reviews",
  {
    puzzleId: text("puzzle_id")
      .primaryKey()
      .references(() => puzzles.id, { onDelete: "cascade" }),

    due: integer("due", { mode: "timestamp" }).notNull(),
    stability: real("stability").notNull(),
    difficulty: real("difficulty").notNull(),
    scheduledDays: integer("scheduled_days").notNull(),
    learningSteps: integer("learning_steps").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    /** FSRS State : 0 New, 1 Learning, 2 Review, 3 Relearning. */
    state: integer("state").notNull().default(0),
    lastReview: integer("last_review", { mode: "timestamp" }),
  },
  (table) => [index("reviews_due_idx").on(table.due)],
);

/**
 * Historique des réponses.
 *
 * FSRS sait ré-optimiser ses paramètres sur l'historique réel d'un utilisateur :
 * sans ce journal, cette optimisation est impossible. Il sert aussi aux
 * statistiques de progression.
 */
export const reviewLogs = sqliteTable(
  "review_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    puzzleId: text("puzzle_id")
      .notNull()
      .references(() => puzzles.id, { onDelete: "cascade" }),

    /** FSRS Rating : 1 Again, 2 Hard, 3 Good, 4 Easy. */
    rating: integer("rating").notNull(),
    state: integer("state").notNull(),
    due: integer("due", { mode: "timestamp" }).notNull(),
    stability: real("stability").notNull(),
    difficulty: real("difficulty").notNull(),
    elapsedDays: integer("elapsed_days").notNull(),
    lastElapsedDays: integer("last_elapsed_days").notNull(),
    scheduledDays: integer("scheduled_days").notNull(),

    /** Ce que le joueur a réellement joué, pour rejouer la session. */
    playedUci: text("played_uci"),
    solvedMs: integer("solved_ms"),

    reviewedAt: integer("reviewed_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("review_logs_puzzle_idx").on(table.puzzleId),
    index("review_logs_date_idx").on(table.reviewedAt),
  ],
);

/** Sélection figée des puzzles du jour, pour ne jamais reproposer les mêmes. */
export const dailySets = sqliteTable("daily_sets", {
  /** Jour au format ISO "AAAA-MM-JJ". */
  day: text("day").primaryKey(),
  puzzleIds: text("puzzle_ids", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewLog = typeof reviewLogs.$inferSelect;
export type NewReviewLog = typeof reviewLogs.$inferInsert;
export type DailySet = typeof dailySets.$inferSelect;
