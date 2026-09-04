import "server-only";

/**
 * Lectures pour les pages de revue de partie — de simples fonctions async,
 * pas des Server Actions : ces pages sont des Server Components qui lisent
 * directement, sans passer par le pont client/serveur des actions (réservé
 * aux mutations déclenchées depuis un composant client).
 */
import { Chess } from "chess.js";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/server/db";
import { moveRowToAnalysedPly } from "@/server/db/mappers";
import { games, moves, type Game, type GameResult, type MoveRow } from "@/server/db/schema";
import {
  buildGameTimeline,
  computeAccuracy,
  tallyQualities,
  type QualityTally,
  type TimelinePly,
} from "@/core/analysis/timeline";

export interface GameSummary {
  id: string;
  source: Game["source"];
  opponentName: string | null;
  opponentRating: number | null;
  playerColor: "w" | "b";
  result: Game["result"];
  timeControl: string | null;
  playedAt: Date;
  movesAnalysed: number;
  accuracy: number | null;
}

export const GAMES_PAGE_SIZE = 25;

export async function listGamesSummary(
  page = 1,
): Promise<{ games: GameSummary[]; hasMore: boolean }> {
  const offset = (page - 1) * GAMES_PAGE_SIZE;

  const gameRows = await db
    .select()
    .from(games)
    .where(isNotNull(games.pgn))
    .orderBy(desc(games.playedAt))
    .limit(GAMES_PAGE_SIZE + 1)
    .offset(offset);

  const hasMore = gameRows.length > GAMES_PAGE_SIZE;
  const pageRows = gameRows.slice(0, GAMES_PAGE_SIZE);
  if (pageRows.length === 0) return { games: [], hasMore: false };

  const moveRows = await db
    .select({ gameId: moves.gameId, quality: moves.quality, byPlayer: moves.byPlayer })
    .from(moves)
    .where(
      inArray(
        moves.gameId,
        pageRows.map((g) => g.id),
      ),
    );

  // Compte et précision ne portent que sur le joueur — l'adversaire est
  // analysé aussi (voir analyse-game.ts) mais ce n'est pas sa précision à lui.
  const qualitiesByGame = new Map<string, MoveRow["quality"][]>();
  for (const row of moveRows) {
    if (!row.byPlayer) continue;
    const list = qualitiesByGame.get(row.gameId) ?? [];
    list.push(row.quality);
    qualitiesByGame.set(row.gameId, list);
  }

  const summaries: GameSummary[] = pageRows.map((g) => {
    const qualities = qualitiesByGame.get(g.id) ?? [];
    return {
      id: g.id,
      source: g.source,
      opponentName: g.opponentName,
      opponentRating: g.opponentRating,
      playerColor: g.playerColor,
      result: g.result,
      timeControl: g.timeControl,
      playedAt: g.playedAt,
      movesAnalysed: qualities.length,
      accuracy: computeAccuracy(qualities.map((quality) => ({ quality }))),
    };
  });

  return { games: summaries, hasMore };
}

export interface SideOverview {
  name: string;
  accuracy: number | null;
  tally: QualityTally;
}

export interface GameOverview {
  player: SideOverview;
  opponent: SideOverview;
}

export interface GameDetail {
  game: Game;
  timeline: TimelinePly[];
  accuracy: number | null;
  overview: GameOverview;
}

export async function getGameDetail(gameId: string): Promise<GameDetail | null> {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game || !game.pgn) return null;

  const moveRows = await db.select().from(moves).where(eq(moves.gameId, gameId));
  const analysed = moveRows.map(moveRowToAnalysedPly);
  const playerMoves = analysed.filter((a) => a.byPlayer);
  const opponentMoves = analysed.filter((a) => !a.byPlayer);

  return {
    game,
    timeline: buildGameTimeline(game.pgn, analysed),
    accuracy: computeAccuracy(playerMoves),
    overview: {
      player: {
        name: "Toi",
        accuracy: computeAccuracy(playerMoves),
        tally: tallyQualities(playerMoves),
      },
      opponent: {
        name: game.opponentName ?? "Adversaire",
        accuracy: computeAccuracy(opponentMoves),
        tally: tallyQualities(opponentMoves),
      },
    },
  };
}

/** Un coup `!! Brillant` ou `! Critique` joué par le joueur — la matière première du Hall of Fame « Mes Chefs-d'œuvre » (`rapport`, voir `client/features/reports/hall-of-fame.tsx`). */
export interface MasterpieceEntry {
  gameId: string;
  ply: number;
  san: string;
  uci: string;
  fenBefore: string;
  /** Position juste après le coup — rejouée ici (chess.js) : `moves` ne stocke que `fenBefore`, voir son docstring. */
  fenAfter: string;
  quality: "brilliant" | "critical";
  opponentName: string | null;
  playedAt: Date;
  result: GameResult | null;
  playerColor: "w" | "b";
}

/**
 * Scanne l'historique complet des parties importées pour en extraire les
 * coups classés `!! Brillant` ou `! Critique` par `classify.ts` — le
 * « Hall of Fame » de l'onglet Rapport. Les plus récents d'abord : ce sont
 * les sacrifices/trouvailles les plus proches de la mémoire du joueur.
 */
export async function listMasterpieces(limit = 30): Promise<MasterpieceEntry[]> {
  const rows = await db
    .select({
      gameId: moves.gameId,
      ply: moves.ply,
      san: moves.san,
      uci: moves.uci,
      fenBefore: moves.fenBefore,
      quality: moves.quality,
      opponentName: games.opponentName,
      playedAt: games.playedAt,
      result: games.result,
      playerColor: games.playerColor,
    })
    .from(moves)
    .innerJoin(games, eq(games.id, moves.gameId))
    .where(and(eq(moves.byPlayer, true), inArray(moves.quality, ["brilliant", "critical"])))
    .orderBy(desc(games.playedAt))
    .limit(limit);

  const entries: MasterpieceEntry[] = [];
  for (const row of rows) {
    const board = new Chess(row.fenBefore);
    try {
      board.move({ from: row.uci.slice(0, 2), to: row.uci.slice(2, 4), promotion: row.uci.slice(4, 5) || undefined });
    } catch {
      continue; // ne devrait pas arriver (coup déjà validé à l'import), mais une ligne illisible ne doit pas planter tout le Hall of Fame.
    }
    entries.push({
      gameId: row.gameId,
      ply: row.ply,
      san: row.san,
      uci: row.uci,
      fenBefore: row.fenBefore,
      fenAfter: board.fen(),
      quality: row.quality as "brilliant" | "critical",
      opponentName: row.opponentName,
      playedAt: row.playedAt,
      result: row.result,
      playerColor: row.playerColor,
    });
  }
  return entries;
}
