import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type TrapVictimSide = "white" | "black";
export type TrapDifficultyLevel = "beginner" | "intermediate" | "expert";

/**
 * Pièges importés en masse depuis des fichiers PGN locaux
 * (`data/import/traps/*.pgn`, voir `scripts/seed-from-pgn.ts` et
 * `core/curriculum/traps-parser.ts`) — vient COMPLÉTER, jamais remplacer, le
 * petit socle statique et vérifié à la main de `core/curriculum/traps.ts`
 * (voir `server/queries/traps.ts#listAllTraps`, qui fusionne les deux : le
 * socle statique reste la référence en cas de collision d'id).
 *
 * Réamorçable sans duplication : le script purge toutes les lignes d'un
 * `sourceFile` donné avant de réinjecter son contenu, donc rejouer le seed
 * sur un fichier PGN mis à jour ne duplique jamais rien (voir le docstring de
 * `scripts/seed-from-pgn.ts`).
 */
export const importedTraps = sqliteTable(
  "imported_traps",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** Ouverture — NIVEAU 1 du filtre `/pieges`, voir `core/curriculum/traps.ts`. */
    family: text("family").notNull(),
    /** Série de gambit — NIVEAU 2 du filtre `/pieges`. */
    gambit: text("gambit").notNull(),
    eco: text("eco").notNull(),
    victimSide: text("victim_side").$type<TrapVictimSide>().notNull(),
    difficulty: text("difficulty").$type<TrapDifficultyLevel>().notNull(),
    summary: text("summary").notNull(),
    setupMoves: text("setup_moves", { mode: "json" }).$type<string[]>().notNull(),
    trapMove: text("trap_move").notNull(),
    trapExplanation: text("trap_explanation").notNull(),
    hint: text("hint").notNull(),
    refutationMoves: text("refutation_moves", { mode: "json" }).$type<string[]>().notNull(),
    outcome: text("outcome").notNull(),
    commentary: text("commentary").notNull(),
    /** Fichier PGN d'origine, relatif à `data/import/traps/` — clé de purge idempotente du seed. */
    sourceFile: text("source_file").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("imported_traps_source_idx").on(table.sourceFile), index("imported_traps_family_idx").on(table.family)],
);

/**
 * Lignes d'ouverture importées en masse (`data/import/openings/*.pgn`, dont
 * les ~3810 lignes lichess-org/chess-openings) — branchée sur `/ouvertures`
 * via `server/curriculum/imported-openings-index.ts` : chaque chapitre curaté
 * (`core/curriculum/openings.ts`) est enrichi de toute la profondeur que ces
 * lignes lui connaissent, et les familles sans chapitre curaté dédié
 * deviennent des entrées de catalogue à part entière (voir le docstring de ce
 * module).
 */
export const importedOpeningLines = sqliteTable(
  "imported_opening_lines",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    family: text("family").notNull(),
    eco: text("eco").notNull(),
    moves: text("moves", { mode: "json" }).$type<string[]>().notNull(),
    sourceFile: text("source_file").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("imported_opening_lines_source_idx").on(table.sourceFile)],
);

export type ImportedTrap = typeof importedTraps.$inferSelect;
export type NewImportedTrap = typeof importedTraps.$inferInsert;
export type ImportedOpeningLine = typeof importedOpeningLines.$inferSelect;
export type NewImportedOpeningLine = typeof importedOpeningLines.$inferInsert;
