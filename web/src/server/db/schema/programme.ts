import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

/**
 * Programme 1000 Heures : l'état de progression et l'historique des séances.
 *
 * Le CONTENU (jours, cours, puzzles vérifiés) ne vit pas en base : c'est le
 * JSON versionné `core/programme/content/phase-<n>.json`, régénérable par
 * `scripts/programme/generate-phase.mts`. La base ne garde que ce que fait
 * l'utilisateur — d'où des `puzzle_id` en texte libre, sans clé étrangère.
 */

/** Curseur de l'utilisateur dans le programme (une ligne par utilisateur). */
export const programmeState = sqliteTable("programme_state", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  semaine: integer("semaine").notNull(),
  jour: integer("jour").notNull(),
  /** Nombre de fois que la semaine courante a été rejouée (échec au test J+7). */
  repetition: integer("repetition").notNull().default(0),
  /** Décalage de la fenêtre de rating, ±200 par pas de 50 (`core/programme/adaptive.ts`). */
  ratingOffset: integer("rating_offset").notNull().default(0),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type ProgrammeSessionStatus = "in_progress" | "completed";

/** Une séance = un jour du programme joué (une semaine rejouée crée de nouvelles séances). */
export const programmeSessions = sqliteTable(
  "programme_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    dayKey: text("day_key").notNull(),
    semaine: integer("semaine").notNull(),
    jour: integer("jour").notNull(),
    repetition: integer("repetition").notNull().default(0),
    /** Décalage appliqué à cette séance, figé au démarrage. */
    ratingOffset: integer("rating_offset").notNull(),
    /** Identifiants des puzzles servis, par rôle — rejouer la page ne retire pas d'autres puzzles. */
    plan: text("plan", { mode: "json" }).$type<Record<string, string[]>>().notNull(),
    status: text("status").$type<ProgrammeSessionStatus>().notNull(),
    attempted: integer("attempted").notNull().default(0),
    succeeded: integer("succeeded").notNull().default(0),
    /** Jour 7 seulement : résultat du test de rétention. */
    retentionPassed: integer("retention_passed", { mode: "boolean" }),
    checklist: text("checklist", { mode: "json" }).$type<string[]>(),
    /** Auto-évaluation de la reconsolidation (dessin, récitation…). */
    reconsolidation: text("reconsolidation", { mode: "json" }).$type<{ note: string; selfRating: "reussi" | "partiel" | "rate" | null }>(),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (table) => [index("programme_sessions_user_idx").on(table.userId, table.startedAt)],
);

export type ProgrammePuzzleRole = "puzzle" | "echauffement" | "blindfold" | "retention" | "entrelace";

/** Un puzzle tenté dans une séance : squelette puis solution. */
export const programmePuzzleResults = sqliteTable(
  "programme_puzzle_results",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => programmeSessions.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    puzzleId: text("puzzle_id").notNull(),
    /** Jour d'origine du puzzle (diffère du jour de la séance pour la rétention et l'entrelacement). */
    sourceDayKey: text("source_day_key").notNull(),
    role: text("role").$type<ProgrammePuzzleRole>().notNull(),
    skeletonOk: integer("skeleton_ok", { mode: "boolean" }).notNull(),
    solved: integer("solved", { mode: "boolean" }).notNull(),
    markedSquares: text("marked_squares", { mode: "json" }).$type<string[]>(),
    seconds: real("seconds"),
    occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("programme_results_session_idx").on(table.sessionId),
    index("programme_results_user_puzzle_idx").on(table.userId, table.puzzleId),
  ],
);

export type ProgrammeStateRow = typeof programmeState.$inferSelect;
export type ProgrammeSessionRow = typeof programmeSessions.$inferSelect;
export type ProgrammePuzzleResultRow = typeof programmePuzzleResults.$inferSelect;
