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
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { evaluatedMoveToRow } from "@/server/db/mappers";
import { games, moves } from "@/server/db/schema";
import type { GameOutcome } from "@/core/chess/termination";
import type { EvaluatedMove } from "@/core/analysis/evaluate-move";

export interface CreateGameInput {
  playerColor: "w" | "b";
  engineElo: number;
  initialFen: string;
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
    opponentName: `Stockfish (${input.engineElo})`,
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
