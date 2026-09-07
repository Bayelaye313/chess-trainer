import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { BotProfileId } from "@/core/chess/bot-profiles";
import type { GameResult } from "@/core/chess/types";
import type { Termination } from "@/core/chess/termination";
import { games } from "./games";

/**
 * Bilan de fin de partie du Sparring Humain Local (`client/features/play`,
 * `use-play-game.ts#finalize`) : une ligne par partie contre un bot,
 * distincte de `games`/`moves` (qui portent la partie et ses coups analysés)
 * — ici seulement le résumé affiché à l'écran de bilan (précision, ELO de
 * performance estimé), pour ne pas recalculer `computeAccuracy` +
 * `estimatePerformanceElo` à chaque lecture ultérieure.
 */
export const botGameResults = sqliteTable(
  "bot_game_results",
  {
    id: text("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),

    botProfile: text("bot_profile").$type<BotProfileId>().notNull(),
    /** `BotProfile.nominalElo` au moment de la partie — voir son docstring (`core/chess/bot-profiles.ts`). */
    botElo: integer("bot_elo").notNull(),

    /** `computeAccuracy` sur les coups du joueur, `null` si la partie s'est terminée avant le premier coup. */
    accuracy: integer("accuracy"),
    /** `estimatePerformanceElo` — voir `core/analysis/performance-rating.ts`. */
    performanceElo: integer("performance_elo").notNull(),

    result: text("result").$type<GameResult>(),
    termination: text("termination").$type<Termination>(),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    // Une partie du Sparring Local produit au plus un bilan.
    uniqueIndex("bot_game_results_game_idx").on(table.gameId),
    index("bot_game_results_created_idx").on(table.createdAt),
  ],
);

export type BotGameResult = typeof botGameResults.$inferSelect;
export type NewBotGameResult = typeof botGameResults.$inferInsert;
