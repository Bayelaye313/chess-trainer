import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { GameResult } from "@/core/chess/types";

/** D'où vient la partie. */
export type GameSource = "local" | "chesscom" | "lichess";

export type { GameResult };

/**
 * Une partie, jouée localement contre le moteur ou importée d'une plateforme.
 *
 * Le prototype Flask gardait les parties dans un dictionnaire en mémoire, donc
 * les perdait à chaque redémarrage — ce qui rendait tout tableau de bord
 * impossible. Tout est persisté ici.
 */
export const games = sqliteTable(
  "games",
  {
    id: text("id").primaryKey(),
    source: text("source").$type<GameSource>().notNull(),
    /** Identifiant chez la plateforme d'origine, pour ne pas réimporter deux fois. */
    externalId: text("external_id"),

    pgn: text("pgn"),
    initialFen: text("initial_fen").notNull(),
    finalFen: text("final_fen"),

    /** Couleur du joueur (nous), 'w' ou 'b'. */
    playerColor: text("player_color").$type<"w" | "b">().notNull(),
    playerRating: integer("player_rating"),
    opponentName: text("opponent_name"),
    opponentRating: integer("opponent_rating"),
    /** ELO cible du moteur, pour les parties locales. */
    engineElo: integer("engine_elo"),

    result: text("result").$type<GameResult>(),
    /** Comment la partie s'est terminée : "checkmate", "resignation", "timeout"… */
    termination: text("termination"),
    timeControl: text("time_control"),

    /** Renseignés à l'étape « répertoire d'ouvertures ». */
    eco: text("eco"),
    openingName: text("opening_name"),

    playedAt: integer("played_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    /** Null tant que la partie n'a pas été passée au moteur. */
    analysedAt: integer("analysed_at", { mode: "timestamp" }),
  },
  (table) => [
    uniqueIndex("games_source_external_idx").on(table.source, table.externalId),
    index("games_played_at_idx").on(table.playedAt),
    index("games_eco_idx").on(table.eco),
  ],
);

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
