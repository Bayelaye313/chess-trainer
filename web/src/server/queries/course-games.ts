import "server-only";

/**
 * Tes parties confrontées aux cours d'ouverture commentés — voir
 * `core/curriculum/course-game-match.ts` pour la règle de correspondance.
 * Sert la carte « Mes ouvertures face au cours » et la page
 * `/rapport/ouvertures/[slug]` du Rapport, la Revue de partie (`?course=`) et
 * l'encart « Dans tes parties » du lecteur de cours.
 *
 * Tout l'historique est relu à chaque appel : quelques centaines de parties,
 * une seule requête par table, et des chiffres toujours à jour après un import.
 */
import { asc, inArray, isNotNull } from "drizzle-orm";
import type { GameResult } from "@/core/chess/types";
import { MOVE_TREE_START_FEN } from "@/core/chess/move-tree";
import { didPlayerWin } from "@/core/analysis/progress-insights";
import {
  attributeGameToCourse,
  buildCourseIndex,
  positionKey,
  signatureKeyOf,
  tallyDeviations,
  tallyMistakes,
  type AttributableCourse,
  type CourseAttribution,
  type CourseGameMatch,
  type CourseGameMove,
  type CoursePositionNote,
  type RecurringMove,
} from "@/core/curriculum/course-game-match";
import { OPENING_COURSE_TREES } from "@/core/curriculum/opening-course-trees";
import { findOpening, type OpeningLine } from "@/core/curriculum/openings";
import { db } from "@/server/db";
import { games, moves } from "@/server/db/schema";

interface PreparedCourse extends AttributableCourse {
  opening: OpeningLine;
}

// Les cours sont statiques : un index par cours, construit une seule fois.
let preparedCourses: Map<string, PreparedCourse> | null = null;

function prepareCourses(): Map<string, PreparedCourse> {
  if (preparedCourses) return preparedCourses;
  preparedCourses = new Map();
  for (const [id, tree] of Object.entries(OPENING_COURSE_TREES)) {
    const opening = findOpening(id);
    if (!opening) continue;
    preparedCourses.set(id, {
      id,
      opening,
      color: opening.side === "white" ? "w" : "b",
      index: buildCourseIndex(tree),
      signatureKey: signatureKeyOf(opening.moves),
      signatureLength: opening.moves.length,
    });
  }
  return preparedCourses;
}

type StoredMove = CourseGameMove & { bestSan: string | null };

interface StoredGame {
  id: string;
  playerColor: "w" | "b";
  opponentName: string | null;
  opponentRating: number | null;
  playerRating: number | null;
  result: GameResult | null;
  timeControl: string | null;
  openingName: string | null;
  playedAt: Date;
  moves: StoredMove[];
}

/** Parties jouées depuis la position initiale, avec leurs coups analysés, plus récentes d'abord. */
async function loadGames(gameIds?: readonly string[]): Promise<StoredGame[]> {
  const gameRows = await db
    .select({
      id: games.id,
      playerColor: games.playerColor,
      opponentName: games.opponentName,
      opponentRating: games.opponentRating,
      playerRating: games.playerRating,
      result: games.result,
      timeControl: games.timeControl,
      openingName: games.openingName,
      playedAt: games.playedAt,
      initialFen: games.initialFen,
    })
    .from(games)
    .where(gameIds ? inArray(games.id, [...gameIds]) : isNotNull(games.pgn));
  const standard = gameRows.filter((g) => positionKey(g.initialFen) === positionKey(MOVE_TREE_START_FEN));
  if (standard.length === 0) return [];

  const moveRows = await db
    .select({
      gameId: moves.gameId,
      ply: moves.ply,
      uci: moves.uci,
      san: moves.san,
      fenBefore: moves.fenBefore,
      byPlayer: moves.byPlayer,
      quality: moves.quality,
      cpLoss: moves.cpLoss,
      bestSan: moves.bestSan,
    })
    .from(moves)
    .where(gameIds ? inArray(moves.gameId, [...gameIds]) : undefined)
    .orderBy(asc(moves.gameId), asc(moves.ply));
  const movesByGame = new Map<string, StoredMove[]>();
  for (const { gameId, ...move } of moveRows) {
    const list = movesByGame.get(gameId);
    if (list) list.push(move);
    else movesByGame.set(gameId, [move]);
  }

  return standard
    .map(({ initialFen: _initialFen, ...game }) => ({ ...game, moves: movesByGame.get(game.id) ?? [] }))
    .filter((game) => game.moves.length > 0)
    .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
}

type AttributedGame = { game: StoredGame } & CourseAttribution;

/**
 * Chaque partie comptée pour UN seul cours (`attributeGameToCourse`) : celui
 * de ton camp dont elle atteint la position caractéristique la plus avancée
 * (transpositions comprises), ou à défaut un cours du camp adverse qui sert
 * alors de référence théorique (`withCourseSide: false`).
 */
function attributeGames(allGames: readonly StoredGame[]): AttributedGame[] {
  const courses = Array.from(prepareCourses().values());
  const attributed: AttributedGame[] = [];
  for (const game of allGames) {
    const attribution = attributeGameToCourse(courses, game.playerColor, game.moves);
    if (attribution) attributed.push({ game, ...attribution });
  }
  return attributed;
}

/** Les parties attribuées au cours, plus récentes d'abord. */
function matchCourse(course: PreparedCourse, allGames: readonly StoredGame[]): AttributedGame[] {
  return attributeGames(allGames).filter(({ courseId }) => courseId === course.id);
}

function winRateOf(list: readonly { game: StoredGame }[]): number | null {
  const withResult = list.filter(({ game }) => game.result !== null);
  if (withResult.length === 0) return null;
  return Math.round((withResult.filter(({ game }) => didPlayerWin(game)).length / withResult.length) * 100);
}

export interface CourseGamesOverviewRow {
  openingId: string;
  openingName: string;
  side: "white" | "black";
  gamesPlayed: number;
  /** Dont parties jouées avec le camp pour lequel le cours est écrit. */
  gamesWithCourseSide: number;
  /** Parties où tu as quitté le cours alors qu'il avait une réponse. */
  gamesWithDeviation: number;
  winRate: number | null;
  /** Ta sortie du cours la plus répétée, si elle revient dans au moins deux parties. */
  topDeviation: RecurringMove | null;
}

/** Une ligne par cours d'ouverture, même ceux sans partie — la carte du Rapport n'affiche que ceux joués. */
export async function getCourseGamesOverview(): Promise<CourseGamesOverviewRow[]> {
  const attributed = attributeGames(await loadGames());
  const rows: CourseGamesOverviewRow[] = [];
  for (const [openingId, course] of prepareCourses()) {
    const matched = attributed.filter(({ courseId }) => courseId === openingId);
    const deviations = tallyDeviations(matched.map(({ game, match }) => ({ gameId: game.id, deviation: match.deviation })));
    rows.push({
      openingId,
      openingName: course.opening.name,
      side: course.opening.side,
      gamesPlayed: matched.length,
      gamesWithCourseSide: matched.filter(({ withCourseSide }) => withCourseSide).length,
      gamesWithDeviation: matched.filter(({ match }) => match.deviation !== null).length,
      winRate: winRateOf(matched),
      topDeviation: deviations[0] && deviations[0].count >= 2 ? deviations[0] : null,
    });
  }
  return rows.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}

export interface CourseGameRow {
  gameId: string;
  playerColor: "w" | "b";
  /** `true` : tu jouais le camp pour lequel le cours est écrit (ton répertoire) ; `false` : le cours te sert de référence théorique côté adverse. */
  withCourseSide: boolean;
  opponentName: string | null;
  opponentRating: number | null;
  playerRating: number | null;
  result: GameResult | null;
  won: boolean | null;
  timeControl: string | null;
  openingName: string | null;
  playedAt: Date;
  match: CourseGameMatch;
  /** Ta première gaffe/imprécision de la partie (toutes phases), pour situer la déviation par rapport à elle. */
  firstMistake: { ply: number; san: string; quality: "blunder" | "inaccuracy" } | null;
}

export interface CourseGameReport {
  openingId: string;
  openingName: string;
  side: "white" | "black";
  games: CourseGameRow[];
  deviations: RecurringMove[];
  mistakes: RecurringMove[];
  winRate: number | null;
  /** Taux de victoire séparé : parties où tu es resté dans le cours / parties où tu l'as quitté. */
  winRateInCourse: number | null;
  winRateOffCourse: number | null;
}

export async function getCourseGameReport(openingId: string): Promise<CourseGameReport | null> {
  const course = prepareCourses().get(openingId);
  if (!course) return null;
  const matched = matchCourse(course, await loadGames());

  const rows: CourseGameRow[] = matched.map(({ game, match, withCourseSide }) => {
    const mistake = game.moves.find((m) => m.byPlayer && (m.quality === "blunder" || m.quality === "inaccuracy"));
    return {
      gameId: game.id,
      playerColor: game.playerColor,
      withCourseSide,
      opponentName: game.opponentName,
      opponentRating: game.opponentRating,
      playerRating: game.playerRating,
      result: game.result,
      won: game.result === null ? null : didPlayerWin(game),
      timeControl: game.timeControl,
      openingName: game.openingName,
      playedAt: game.playedAt,
      match,
      firstMistake: mistake ? { ply: mistake.ply, san: mistake.san, quality: mistake.quality as "blunder" | "inaccuracy" } : null,
    };
  });

  return {
    openingId,
    openingName: course.opening.name,
    side: course.opening.side,
    games: rows,
    deviations: tallyDeviations(matched.map(({ game, match }) => ({ gameId: game.id, deviation: match.deviation }))),
    mistakes: tallyMistakes(
      course.index,
      matched.map(({ game }) => ({ gameId: game.id, moves: game.moves })),
    ),
    winRate: winRateOf(matched),
    winRateInCourse: winRateOf(matched.filter(({ match }) => match.deviation === null)),
    winRateOffCourse: winRateOf(matched.filter(({ match }) => match.deviation !== null)),
  };
}

export async function listCoursePositionNotes(openingId: string): Promise<CoursePositionNote[]> {
  const report = await getCourseGameReport(openingId);
  if (!report) return [];
  return report.deviations
    .filter((d) => d.chapterIndex !== null && d.nodeId !== null)
    .map((d) => ({
      openingId,
      positionKey: d.positionKey,
      chapterIndex: d.chapterIndex!,
      nodeId: d.nodeId!,
      ply: d.ply,
      playedSan: d.playedSan,
      quality: d.quality,
      count: d.count,
      gameIds: d.gameIds,
      expectedSan: d.expected.map((m) => m.san),
    }));
}

export interface CourseGameContext {
  openingName: string;
  /** Ta déviation dans CETTE partie, si tu as quitté le cours. */
  deviation: { ply: number; expectedSan: string; expectedUci: string } | null;
  /** Voisines dans la liste des parties de cette ouverture (plus récente / plus ancienne). */
  previousGameId: string | null;
  nextGameId: string | null;
}

/**
 * La Revue de partie ouverte depuis le Rapport (`/analyse/[id]?course=`) :
 * la déviation est recalculée ici, jamais lue dans l'URL, et ◀ ▶ restent dans
 * les parties de cette ouverture. `null` si la partie ne relève pas du cours.
 */
export async function getCourseGameContext(openingId: string, gameId: string): Promise<CourseGameContext | null> {
  const course = prepareCourses().get(openingId);
  if (!course) return null;
  const matched = matchCourse(course, await loadGames());
  const position = matched.findIndex(({ game }) => game.id === gameId);
  if (position === -1) return null;
  const { deviation } = matched[position].match;
  return {
    openingName: `Cours : ${course.opening.name}`,
    deviation: deviation ? { ply: deviation.ply, expectedSan: deviation.expected[0].san, expectedUci: deviation.expected[0].uci } : null,
    previousGameId: matched[position - 1]?.game.id ?? null,
    nextGameId: matched[position + 1]?.game.id ?? null,
  };
}
