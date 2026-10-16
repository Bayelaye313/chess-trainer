import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { DeckId } from "@/core/chess/decks";
import type { GamePhase, Motif, MoveQuality } from "@/core/chess/types";
import { games } from "./games";
import { moves } from "./moves";

export type PuzzleSource = "local" | "chesscom" | "lichess" | "lichess_db";

/**
 * Une carte de révision : une position et la suite à trouver.
 *
 * Le puzzle est immuable — c'est un fait, issu d'une erreur réelle. Tout ce qui
 * évolue (échéance, difficulté ressentie) vit dans `reviews`.
 */
export const puzzles = sqliteTable(
  "puzzles",
  {
    id: text("id").primaryKey(),
    deck: text("deck").$type<DeckId>().notNull(),

    /** Origine, quand le puzzle vient d'une de nos parties. */
    gameId: text("game_id").references(() => games.id, { onDelete: "set null" }),
    moveId: integer("move_id").references(() => moves.id, { onDelete: "set null" }),

    fenBefore: text("fen_before").notNull(),

    /**
     * Suite attendue en UCI, coups adverses inclus aux rangs impairs.
     * Un seul élément = puzzle à un coup, comme dans le prototype.
     */
    solution: text("solution", { mode: "json" }).$type<string[]>().notNull(),
    solutionSan: text("solution_san", { mode: "json" }).$type<string[]>().notNull(),

    /** Ce que le joueur avait joué à la place. Absent pour un puzzle importé. */
    playedUci: text("played_uci"),
    playedSan: text("played_san"),

    quality: text("quality").$type<MoveQuality>(),
    phase: text("phase").$type<GamePhase>(),
    cpLoss: integer("cp_loss"),
    mateMissed: integer("mate_missed", { mode: "boolean" }).notNull().default(false),
    motifs: text("motifs", { mode: "json" }).$type<Motif[]>().notNull().default([]),

    /** Difficulté estimée, sur l'échelle ELO des puzzles Lichess. */
    rating: integer("rating"),

    source: text("source").$type<PuzzleSource>().notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("puzzles_deck_idx").on(table.deck),
    index("puzzles_game_idx").on(table.gameId),
    // Un coup ne devient jamais deux puzzles, même si l'extraction (voir
    // server/queries/spaced-repetition.ts) tourne plusieurs fois sur la même
    // partie. SQLite ne compte pas les NULL comme égaux entre eux : les
    // puzzles sans coup d'origine (import Lichess) restent libres d'être en
    // nombre quelconque.
    uniqueIndex("puzzles_move_idx").on(table.moveId),
  ],
);

export type Puzzle = typeof puzzles.$inferSelect;
export type NewPuzzle = typeof puzzles.$inferInsert;
