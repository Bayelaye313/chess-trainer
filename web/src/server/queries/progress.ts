import "server-only";

/**
 * Lecture pour l'onglet « Rapport » — traduit les tables `games`/`moves` vers
 * `PlayerGameRecord`/`PlayerMoveRecord` (voir `core/analysis/types.ts`) et
 * délègue tout le calcul à `aggregatePlayerProgress`, exactement comme
 * `server/queries/games.ts` le fait déjà pour `AnalysedPly`.
 *
 * Pas de pagination ici : les quatre axes (précision par phase, motifs
 * tactiques, ouvertures, pièces en prise) n'ont de sens qu'agrégés sur
 * l'historique complet — une page de parties fausserait le classement des
 * ouvertures et les moyennes de précision.
 */
import { eq, isNotNull } from "drizzle-orm";
import { db } from "@/server/db";
import { games, moves } from "@/server/db/schema";
import { aggregatePlayerProgress, didPlayerWin } from "@/core/analysis/progress-insights";
import { computeAccuracy, tallyQualities, type QualityTally } from "@/core/analysis/timeline";
import type { PlayerGameRecord, PlayerMoveRecord, PlayerProgressInsights } from "@/core/analysis/types";

export interface PlayerProgressOverview extends PlayerProgressInsights {
  /** Parties avec au moins un coup analysé — pas juste importées/en attente. */
  gamesAnalysed: number;
  /** Précision moyenne, toutes phases et toutes parties confondues. */
  overallAccuracy: number | null;
}

export async function getPlayerProgress(): Promise<PlayerProgressOverview> {
  const gameRows = await db
    .select({
      id: games.id,
      eco: games.eco,
      openingName: games.openingName,
      result: games.result,
      playerColor: games.playerColor,
    })
    .from(games)
    .where(isNotNull(games.pgn));

  // Seuls les coups DU JOUEUR alimentent les quatre axes (voir
  // `progress-insights.ts`) : inutile de charger ceux de l'adversaire.
  const moveRows = await db
    .select({
      gameId: moves.gameId,
      fenBefore: moves.fenBefore,
      uci: moves.uci,
      quality: moves.quality,
      phase: moves.phase,
      motifs: moves.motifs,
      motifFound: moves.motifFound,
    })
    .from(moves)
    .where(eq(moves.byPlayer, true));

  const movesByGame = new Map<string, PlayerMoveRecord[]>();
  for (const row of moveRows) {
    const list = movesByGame.get(row.gameId) ?? [];
    list.push({ ...row, byPlayer: true });
    movesByGame.set(row.gameId, list);
  }

  const gamesData: PlayerGameRecord[] = gameRows.map((game) => ({
    eco: game.eco,
    openingName: game.openingName,
    result: game.result,
    playerColor: game.playerColor,
    moves: movesByGame.get(game.id) ?? [],
  }));

  const insights = aggregatePlayerProgress(gamesData);
  const allPlayerMoves = gamesData.flatMap((game) => game.moves);

  return {
    ...insights,
    gamesAnalysed: gamesData.filter((game) => game.moves.length > 0).length,
    overallAccuracy: computeAccuracy(allPlayerMoves),
  };
}

export interface ReportSummary {
  gamesAnalysed: number;
  overallAccuracy: number | null;
  /** Part de parties gagnées, sur celles qui ont un résultat connu — `null` si aucune. */
  winRate: number | null;
  totalBlunders: number;
  totalBrilliant: number;
}

/**
 * Version allégée de `getPlayerProgress`, pour la carte "Synthèse du Rapport
 * Récent" de l'accueil : pas de répartition par phase/motif/ouverture, juste
 * les quatre chiffres d'aperçu — évite de payer le coût des quatre axes
 * complets sur une page consultée à chaque visite.
 */
export async function getReportSummary(): Promise<ReportSummary> {
  const gameRows = await db
    .select({ id: games.id, result: games.result, playerColor: games.playerColor })
    .from(games)
    .where(isNotNull(games.pgn));

  const playerMoveRows = await db
    .select({ quality: moves.quality })
    .from(moves)
    .where(eq(moves.byPlayer, true));

  const tally: QualityTally = tallyQualities(playerMoveRows);
  const gamesWithResult = gameRows.filter((g) => g.result !== null);
  const wins = gamesWithResult.filter(didPlayerWin).length;

  return {
    gamesAnalysed: gameRows.length,
    overallAccuracy: computeAccuracy(playerMoveRows),
    winRate: gamesWithResult.length > 0 ? Math.round((wins / gamesWithResult.length) * 100) : null,
    totalBlunders: tally.blunder,
    totalBrilliant: tally.brilliant,
  };
}
