import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { evaluatedMoveToRow } from "@/server/db/mappers";
import type { GameSource } from "@/server/db/schema";
import { games, moves, userScope } from "@/server/db/user-scope";
import { isReviewable } from "@/core/chess/types";
import type { ImportedGameResult } from "./analyse-game";

/** Vrai si CET utilisateur a déjà importé cette partie — évite de la ré-analyser. */
export async function gameAlreadyImported(userId: string, source: GameSource, externalId: string): Promise<boolean> {
  const s = userScope(userId);
  const existing = await db
    .select({ id: games.id })
    .from(games)
    .where(s.where(games, eq(games.source, source), eq(games.externalId, externalId)))
    .limit(1);
  return existing.length > 0;
}

/** Insère une partie importée et ses coups analysés. Renvoie le nombre d'erreurs (mistake/blunder). */
export async function persistImportedGame(
  userId: string,
  source: GameSource,
  result: ImportedGameResult,
): Promise<{ gameId: string; mistakesFound: number }> {
  const s = userScope(userId);
  const gameId = crypto.randomUUID();
  const now = new Date();

  await db.insert(games).values(
    s.own({
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
      timeControl: result.timeControl,
      eco: result.eco,
      openingName: result.openingName,
      playedAt: result.playedAt,
      createdAt: now,
      analysedAt: now,
    }),
  );

  if (result.moves.length > 0) {
    await db
      .insert(moves)
      .values(s.ownAll(result.moves.map((m) => evaluatedMoveToRow(gameId, m.ply, m.side, m.evaluated, m.byPlayer))));
  }

  // Le compteur affiché à l'import ("erreurs trouvées") ne parle que du
  // joueur — les gaffes de l'adversaire sont visibles sur l'échiquier mais ne
  // sont pas « les siennes » à corriger.
  const mistakesFound = result.moves.filter(
    (m) => m.byPlayer && isReviewable(m.evaluated.quality),
  ).length;
  return { gameId, mistakesFound };
}
