import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { evaluatedMoveToRow } from "@/server/db/mappers";
import { games, moves, type GameSource } from "@/server/db/schema";
import { isReviewable } from "@/core/chess/types";
import type { ImportedGameResult } from "./analyse-game";

/** Vrai si cette partie a déjà été importée — évite de la ré-analyser. */
export async function gameAlreadyImported(source: GameSource, externalId: string): Promise<boolean> {
  const existing = await db
    .select({ id: games.id })
    .from(games)
    .where(and(eq(games.source, source), eq(games.externalId, externalId)))
    .limit(1);
  return existing.length > 0;
}

/** Insère une partie importée et ses coups analysés. Renvoie le nombre d'erreurs (mistake/blunder). */
export async function persistImportedGame(
  source: GameSource,
  result: ImportedGameResult,
): Promise<{ gameId: string; mistakesFound: number }> {
  const gameId = crypto.randomUUID();
  const now = new Date();

  await db.insert(games).values({
    id: gameId,
    source,
    externalId: result.externalId,
    pgn: result.pgn,
    initialFen: result.initialFen,
    finalFen: result.finalFen,
    playerColor: result.playerColor,
    playerRating: result.playerRating,
    opponentName: result.opponentName,
    opponentRating: result.opponentRating,
    result: result.result,
    termination: result.termination,
    playedAt: result.playedAt,
    createdAt: now,
    analysedAt: now,
  });

  if (result.moves.length > 0) {
    await db
      .insert(moves)
      .values(
        result.moves.map((m) => evaluatedMoveToRow(gameId, m.ply, m.side, m.evaluated, m.byPlayer)),
      );
  }

  // Le compteur affiché à l'import ("erreurs trouvées") ne parle que du
  // joueur — les gaffes de l'adversaire sont visibles sur l'échiquier mais ne
  // sont pas « les siennes » à corriger.
  const mistakesFound = result.moves.filter(
    (m) => m.byPlayer && isReviewable(m.evaluated.quality),
  ).length;
  return { gameId, mistakesFound };
}
