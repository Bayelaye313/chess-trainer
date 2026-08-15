import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { GameSource } from "./games";

export type ImportJobStatus = "running" | "done" | "error" | "cancelled";

/**
 * Suivi d'un import en masse. L'analyse tourne en tâche de fond côté serveur
 * (processus Node persistant, pas de fonction serverless) : cette table est
 * ce qui permet à l'UI de suivre la progression par sondage, de survivre à un
 * rechargement de page, et de garder un historique des imports passés.
 */
export const importJobs = sqliteTable(
  "import_jobs",
  {
    id: text("id").primaryKey(),
    source: text("source").$type<Exclude<GameSource, "local">>().notNull(),
    username: text("username").notNull(),
    status: text("status").$type<ImportJobStatus>().notNull().default("running"),

    maxGames: integer("max_games").notNull(),
    /** Renseigné une fois la liste des parties récupérée depuis l'API. */
    gamesFound: integer("games_found"),
    gamesProcessed: integer("games_processed").notNull().default(0),
    /** Parties déjà en base, sautées sans ré-analyse (dédoublonnage par externalId). */
    gamesSkipped: integer("games_skipped").notNull().default(0),
    mistakesFound: integer("mistakes_found").notNull().default(0),

    errorMessage: text("error_message"),

    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp" }),
  },
  (table) => [index("import_jobs_started_at_idx").on(table.startedAt)],
);

export type ImportJob = typeof importJobs.$inferSelect;
export type NewImportJob = typeof importJobs.$inferInsert;
