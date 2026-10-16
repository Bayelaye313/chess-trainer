"use server";

/**
 * Mutations de la partie en cours contre le moteur.
 *
 * L'évaluation elle-même tourne côté client (le worker Stockfish y vit) ; ces
 * actions ne font que persister ce que le client a déjà calculé. Seuls les
 * coups du JOUEUR sont enregistrés dans `moves` — comme le faisait le
 * prototype Python, qui n'analysait jamais les coups de l'adversaire. Le PGN
 * complet sur `games.pgn` suffit à reconstituer la partie entière.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { evaluatedMoveToRow } from "@/server/db/mappers";
import { botGameResults, games, moves } from "@/server/db/schema";
import type { BotProfileId } from "@/core/chess/bot-profiles";
import type { GameOutcome } from "@/core/chess/termination";
import type { EvaluatedMove } from "@/core/analysis/evaluate-move";

export interface CreateGameInput {
  playerColor: "w" | "b";
  engineElo: number;
  initialFen: string;
  /** Étiquette du profil de bot affronté (voir `core/chess/bot-profiles.ts`), pour `games.opponentName`. */
  opponentName: string;
}

export async function createGame(input: CreateGameInput): Promise<{ gameId: string }> {
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(games).values({
    id,
    source: "local",
    initialFen: input.initialFen,
    playerColor: input.playerColor,
    engineElo: input.engineElo,
    opponentName: input.opponentName,
    playedAt: now,
    createdAt: now,
  });

  return { gameId: id };
}

export interface RecordPlayerMoveInput {
  gameId: string;
  ply: number;
  side: "w" | "b";
  evaluated: EvaluatedMove;
}

export async function recordPlayerMove(input: RecordPlayerMoveInput): Promise<void> {
  await db.insert(moves).values(
    evaluatedMoveToRow(input.gameId, input.ply, input.side, input.evaluated),
  );
}

export interface DeletePlayerMoveInput {
  gameId: string;
  ply: number;
}

/**
 * Retire le coup enregistré à ce ply — pendant de `recordPlayerMove` pour le
 * bouton Takeback (`use-play-game.ts#handleTakeback`) : annuler le coup sur
 * `chess.js` sans nettoyer la ligne correspondante laisserait une analyse
 * fantôme (précision, decks de révision) pour un coup que la partie affichée
 * ne contient plus.
 */
export async function deletePlayerMove(input: DeletePlayerMoveInput): Promise<void> {
  await db.delete(moves).where(and(eq(moves.gameId, input.gameId), eq(moves.ply, input.ply)));
}

export interface FinishGameInput {
  gameId: string;
  finalFen: string;
  pgn: string;
  outcome: GameOutcome | null;
}

export async function finishGame(input: FinishGameInput): Promise<void> {
  await db
    .update(games)
    .set({
      finalFen: input.finalFen,
      pgn: input.pgn,
      result: input.outcome?.result,
      termination: input.outcome?.termination,
    })
    .where(eq(games.id, input.gameId));
}

export interface SaveBotGameResultInput {
  gameId: string;
  botProfile: BotProfileId;
  botElo: number;
  /** `null` si la partie s'est terminée avant le premier coup du joueur. */
  accuracy: number | null;
  performanceElo: number;
  outcome: GameOutcome | null;
}

/**
 * Persiste le bilan de fin de partie du Sparring Local (voir
 * `use-play-game.ts#finalize`) — appelé juste après `finishGame`, jamais à sa
 * place : `games`/`moves` restent la source de vérité de la partie elle-même,
 * `bot_game_results` n'en est qu'un résumé pré-calculé pour l'écran de bilan.
 */
export async function saveBotGameResult(input: SaveBotGameResultInput): Promise<void> {
  await db.insert(botGameResults).values({
    id: crypto.randomUUID(),
    gameId: input.gameId,
    botProfile: input.botProfile,
    botElo: input.botElo,
    accuracy: input.accuracy,
    performanceElo: input.performanceElo,
    result: input.outcome?.result ?? null,
    termination: input.outcome?.termination ?? null,
    createdAt: new Date(),
  });
}
