import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * L'onglet « Apprendre » : une académie d'échecs structurée en modules
 * thématiques (façon Noctie.ai / Lotus Chess), distincte d'« Entraîner »
 * (`reviews.ts`) sur un point fondamental — pas de FSRS ici. Un thème est un
 * petit cours linéaire : on avance puzzle après puzzle, dans l'ordre, jusqu'à
 * épuiser le thème. Rien n'est jamais « dû » ni reprogrammé.
 */
export type CurriculumCategory =
  | "positional_mastery"
  | "jesper_hall_course"
  | "checkmate_patterns"
  | "tactical_motifs"
  | "sparring_positions"
  | "endgame_mastery"
  // Les 6 catégories OFFICIELLES de la taxonomie de tags Lichess (voir le
  // docstring de `catalog.ts`, section « Saturation Lichess ») — un thème par
  // tag exact, jamais un module pédagogique composé à la main : ce sont des
  // réservoirs de contenu 100% alimentés par le pipeline d'import
  // (`scripts/convert-lichess-puzzles-csv.ts`, `scripts/refine-tactics-pgn.ts`),
  // pas par `MASTER_PUZZLES_DATASET`.
  | "lichess_motifs"
  | "lichess_advanced"
  | "lichess_mate_in"
  | "lichess_mate_themes"
  | "lichess_special_moves"
  | "lichess_goals_origin";

export type CurriculumLevel = "beginner" | "intermediate" | "advanced";

/**
 * Un thème du curriculum : une entrée de catalogue (métadonnées), pas le
 * contenu jouable — voir `curriculumPuzzles`. `totalPuzzles` est dénormalisé
 * (annoncé au catalogue, potentiellement avant que tout le contenu ne soit
 * importé) plutôt que recalculé par un `count()` sur `curriculum_puzzles` à
 * chaque affichage : la carte doit pouvoir annoncer "0/30" avant même que les
 * 30 puzzles existent en base.
 */
export const curriculumThemes = sqliteTable("curriculum_themes", {
  id: text("id").primaryKey(),
  category: text("category").$type<CurriculumCategory>().notNull(),
  /** Auteur/source du module, affiché en en-tête de section — null pour une catégorie sans auteur unique. */
  author: text("author"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").$type<CurriculumLevel>().notNull(),
  totalPuzzles: integer("total_puzzles").notNull(),
  /** Ordre d'affichage au sein de sa catégorie — le titre seul ne trie pas toujours dans un ordre pédagogique. */
  orderIndex: integer("order_index").notNull(),
});

/**
 * Le contenu jouable d'un thème : une position et sa suite attendue.
 *
 * Volontairement séparée de `puzzles` (voir `puzzles.ts`) : cette dernière est
 * structurellement couplée aux parties de l'utilisateur et à FSRS (`gameId`,
 * `moveId`, `reviews`). Un puzzle de curriculum n'a ni l'un ni l'autre — c'est
 * un exercice de cours, pas une gaffe personnelle rejouée.
 */
export const curriculumPuzzles = sqliteTable(
  "curriculum_puzzles",
  {
    id: text("id").primaryKey(),
    themeId: text("theme_id")
      .notNull()
      .references(() => curriculumThemes.id, { onDelete: "cascade" }),
    /** Position dans la progression linéaire du thème, 0-based — c'est aussi la valeur que `completedCount` doit atteindre pour ce puzzle. */
    orderIndex: integer("order_index").notNull(),
    fen: text("fen").notNull(),
    /** Suite attendue en UCI, coups adverses inclus aux rangs impairs — même convention que `puzzles.solution`. */
    solution: text("solution", { mode: "json" }).$type<string[]>().notNull(),
    solutionSan: text("solution_san", { mode: "json" }).$type<string[]>().notNull(),
    /** Référence libre à la source (partie, livre, tournoi) — affichée en petit, jamais indispensable à la résolution. */
    sourceRef: text("source_ref"),
    /**
     * Fichier PGN/JSON d'origine, relatif à `data/import/academy/` — `null`
     * pour le contenu de démonstration semé par `MASTER_PUZZLES_DATASET`
     * (voir `server/db/seed/curriculum-puzzles.ts`). Clé de purge idempotente
     * de `scripts/seed-academy.ts` — mêmes conventions que
     * `imported_traps.source_file`/`imported_opening_lines.source_file`.
     */
    sourceFile: text("source_file"),
  },
  (table) => [index("curriculum_puzzles_source_idx").on(table.sourceFile)],
);

/**
 * Avancement d'un thème pour un utilisateur — pas de file de révision, juste
 * un curseur linéaire. `completedCount` EST l'index (0-based) du prochain
 * puzzle à servir : puzzle d'`orderIndex >= completedCount`, le plus petit
 * d'abord. Pas de colonne séparée pour "puzzle courant" — la progression
 * étant strictement linéaire et sans retour en arrière, l'une se déduit de
 * l'autre.
 *
 * `userId` n'a aujourd'hui qu'une seule valeur possible (voir
 * `LOCAL_USER_ID` dans `server/queries/curriculum.ts`) : l'application n'a
 * pas de compte/authentification. La colonne existe pour ne pas re-modéliser
 * la table le jour où ça change.
 */
export const userThemeProgress = sqliteTable(
  "user_theme_progress",
  {
    userId: text("user_id").notNull(),
    themeId: text("theme_id")
      .notNull()
      .references(() => curriculumThemes.id, { onDelete: "cascade" }),
    completedCount: integer("completed_count").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.themeId] })],
);

export type CurriculumTheme = typeof curriculumThemes.$inferSelect;
export type NewCurriculumTheme = typeof curriculumThemes.$inferInsert;
export type CurriculumPuzzle = typeof curriculumPuzzles.$inferSelect;
export type NewCurriculumPuzzle = typeof curriculumPuzzles.$inferInsert;
export type UserThemeProgress = typeof userThemeProgress.$inferSelect;
export type NewUserThemeProgress = typeof userThemeProgress.$inferInsert;
