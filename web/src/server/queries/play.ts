import "server-only";

/**
 * Mutations de la partie en cours contre le moteur.
 *
 * L'évaluation elle-même tourne côté client (le worker Stockfish y vit) ; ces
 * actions ne font que persister ce que le client a déjà calculé. Seuls les
 * coups du JOUEUR sont enregistrés dans `moves` — comme le faisait le
 * prototype Python, qui n'analysait jamais les coups de l'adversaire. Le PGN
 * complet sur `games.pgn` suffit à reconstituer la partie entière.
 */
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { evaluatedMoveToRow } from "@/server/db/mappers";
import { botGameResults, games, moves, userScope } from "@/server/db/user-scope";
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

export async function createGame(userId: string, input: CreateGameInput): Promise<{ gameId: string }> {
  const s = userScope(userId);
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(games).values(s.own({
    id,
    source: "local",
    initialFen: input.initialFen,
    playerColor: input.playerColor,
    engineElo: input.engineElo,
    opponentName: input.opponentName,
    playedAt: now,
    createdAt: now,
  }));

  return { gameId: id };
}

export interface RecordPlayerMoveInput {
  gameId: string;
  ply: number;
  side: "w" | "b";
  evaluated: EvaluatedMove;
}

/** Vrai si la partie existe ET appartient à cet utilisateur : les `gameId` viennent du client. */
async function ownsGame(userId: string, gameId: string): Promise<boolean> {
  const s = userScope(userId);
  const [row] = await db.select({ id: games.id }).from(games).where(s.where(games, eq(games.id, gameId))).limit(1);
  return row !== undefined;
}

export async function recordPlayerMove(userId: string, input: RecordPlayerMoveInput): Promise<boolean> {
  if (!(await ownsGame(userId, input.gameId))) return false;
  await db.insert(moves).values(
    userScope(userId).own(evaluatedMoveToRow(input.gameId, input.ply, input.side, input.evaluated)),
  );
  return true;
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
export async function deletePlayerMove(userId: string, input: DeletePlayerMoveInput): Promise<void> {
  const s = userScope(userId);
  await db.delete(moves).where(s.where(moves, eq(moves.gameId, input.gameId), eq(moves.ply, input.ply)));
}

export interface FinishGameInput {
  gameId: string;
  finalFen: string;
  pgn: string;
  outcome: GameOutcome | null;
}

export async function finishGame(userId: string, input: FinishGameInput): Promise<void> {
  const s = userScope(userId);
  await db
    .update(games)
    .set({
      finalFen: input.finalFen,
      pgn: input.pgn,
      result: input.outcome?.result,
      termination: input.outcome?.termination,
    })
    .where(s.where(games, eq(games.id, input.gameId)));
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
export async function saveBotGameResult(userId: string, input: SaveBotGameResultInput): Promise<boolean> {
  if (!(await ownsGame(userId, input.gameId))) return false;
  await db.insert(botGameResults).values(userScope(userId).own({
    id: crypto.randomUUID(),
    gameId: input.gameId,
    botProfile: input.botProfile,
    botElo: input.botElo,
    accuracy: input.accuracy,
    performanceElo: input.performanceElo,
    result: input.outcome?.result ?? null,
    termination: input.outcome?.termination ?? null,
    createdAt: new Date(),
  }));
  return true;
}
