import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { GamePhase, Motif, MoveQuality } from "@/core/chess/types";
import { games } from "./games";

/**
 * Un demi-coup analysé.
 *
 * C'est la table qui porte les Insights : précision par phase, motifs trouvés
 * ou manqués, performance par ouverture. Tout s'agrège en SQL depuis ici, donc
 * chaque dimension utile est une colonne indexable — pas un champ JSON.
 */
export const moves = sqliteTable(
  "moves",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),

    /** Numéro de demi-coup, 1 pour le premier coup des Blancs. */
    ply: integer("ply").notNull(),
    side: text("side").$type<"w" | "b">().notNull(),
    /** Le coup est-il de nous, ou de l'adversaire ? */
    byPlayer: integer("by_player", { mode: "boolean" }).notNull(),

    uci: text("uci").notNull(),
    san: text("san").notNull(),
    fenBefore: text("fen_before").notNull(),

    /** Évaluations POV Blancs. `mate` renseigné à la place de `cp` sur un mat annoncé. */
    cpBefore: integer("cp_before"),
    mateBefore: integer("mate_before"),
    cpAfter: integer("cp_after"),
    mateAfter: integer("mate_after"),
    /** Centipions perdus par rapport au meilleur coup, du point de vue du joueur. */
    cpLoss: integer("cp_loss"),

    quality: text("quality").$type<MoveQuality>().notNull(),
    phase: text("phase").$type<GamePhase>().notNull(),

    bestUci: text("best_uci"),
    bestSan: text("best_san"),
    mateMissed: integer("mate_missed", { mode: "boolean" }).notNull().default(false),

    /**
     * Motifs que le MEILLEUR coup exploitait. Comparés au coup joué, ils
     * donnent le « fourchettes trouvées vs manquées » du tableau de bord.
     */
    motifs: text("motifs", { mode: "json" }).$type<Motif[]>().notNull().default([]),
    /** Le coup joué exploitait-il effectivement ces motifs ? */
    motifFound: integer("motif_found", { mode: "boolean" }).notNull().default(false),

    /** Temps restant à l'horloge après le coup, en millisecondes. */
    clockMs: integer("clock_ms"),
    /** Temps de réflexion sur ce coup, en secondes. */
    thinkSeconds: real("think_seconds"),
  },
  (table) => [
    index("moves_game_idx").on(table.gameId, table.ply),
    index("moves_quality_idx").on(table.byPlayer, table.quality),
    index("moves_phase_idx").on(table.byPlayer, table.phase),
  ],
);

export type MoveRow = typeof moves.$inferSelect;
export type NewMoveRow = typeof moves.$inferInsert;
