/**
 * Le pont entre un cours d'ouverture commenté (`opening-course-trees.ts`) et
 * les parties réelles du joueur — sert la page « Rapport › ouverture »
 * (`app/rapport/ouvertures/[slug]`), la Revue de partie (`?course=`) et
 * l'encart « Dans tes parties » du lecteur de cours.
 *
 * Tout se juge par POSITION, jamais par numéro de coup : chaque nœud de tous
 * les chapitres est indexé par sa clé de position (`positionKey`), si bien
 * qu'une partie qui transpose vers une ligne du cours y est reconnue. Fonctions
 * pures, sans DB : les coups arrivent déjà chargés (`CourseGameMove`).
 */
import { Chess } from "chess.js";
import { collectNodes } from "@/core/chess/move-tree";
import type { MoveQuality } from "@/core/chess/types";
import { isReviewable } from "@/core/chess/types";
import type { CourseTree } from "./course-tree";

/** Placement, trait et roques : deux FEN qui ne diffèrent que par les compteurs ou la case en passant désignent la même position du cours. */
export function positionKey(fen: string): string {
  return fen.split(" ").slice(0, 3).join(" ");
}

export interface CourseMoveOption {
  san: string;
  uci: string;
}

/** Une position du cours : ses coups prévus (ligne principale en tête) et le nœud où l'ouvrir dans le lecteur. */
export interface CoursePosition {
  chapterIndex: number;
  nodeId: string;
  /** Coups prévus par le cours depuis cette position, tous chapitres confondus — `[]` : le cours s'arrête ici. */
  moves: readonly CourseMoveOption[];
}

export type CourseIndex = ReadonlyMap<string, CoursePosition>;

/**
 * Indexe toutes les positions de tous les chapitres. Une position présente
 * dans plusieurs chapitres garde la PREMIÈRE occurrence pour la navigation et
 * réunit les coups prévus par chacun (sans doublon).
 */
export function buildCourseIndex(tree: CourseTree): CourseIndex {
  const index = new Map<string, { chapterIndex: number; nodeId: string; moves: CourseMoveOption[] }>();
  tree.chapters.forEach((chapter, chapterIndex) => {
    for (const node of collectNodes(chapter.root)) {
      const key = positionKey(node.fen);
      let entry = index.get(key);
      if (!entry) {
        entry = { chapterIndex, nodeId: node.id, moves: [] };
        index.set(key, entry);
      }
      for (const child of node.children) {
        if (child.uci && child.san && !entry.moves.some((m) => m.uci === child.uci)) entry.moves.push({ san: child.san, uci: child.uci });
      }
    }
  });
  return index;
}

/** Position atteinte après la ligne caractéristique de l'ouverture (`OpeningLine.moves`) — `null` si la ligne est illégale. */
export function signatureKeyOf(signatureSan: readonly string[]): string | null {
  const board = new Chess();
  try {
    for (const san of signatureSan) board.move(san);
  } catch {
    return null;
  }
  return positionKey(board.fen());
}

/** Le strict nécessaire d'un demi-coup importé (`moves`) pour le confronter au cours. */
export interface CourseGameMove {
  ply: number;
  uci: string;
  san: string;
  fenBefore: string;
  byPlayer: boolean;
  quality: MoveQuality;
  cpLoss: number | null;
}

/** Où la partie a quitté le cours pour la première fois. */
export interface CourseExit {
  /** `player` : tu as joué un coup que le cours ne prévoit pas ; `opponent` : c'est l'adversaire ; `end` : la partie a suivi le cours jusqu'à son dernier coup. */
  by: "player" | "opponent" | "end";
  /** Demi-coup (1 = premier coup) du coup hors cours — pour `end`, le premier demi-coup après la fin du cours. */
  ply: number;
  playedSan: string | null;
  /** Coups prévus par le cours à cette position (vide pour `end`). */
  expected: readonly CourseMoveOption[];
}

/** Un coup du joueur, dans une position couverte par le cours, différent de tous les coups prévus. */
export interface CourseDeviation {
  ply: number;
  positionKey: string;
  fenBefore: string;
  playedSan: string;
  playedUci: string;
  quality: MoveQuality;
  cpLoss: number | null;
  expected: readonly CourseMoveOption[];
  chapterIndex: number;
  nodeId: string;
}

export interface CourseGameMatch {
  /** Nombre de demi-coups consécutifs, depuis le premier, joués exactement dans le cours. */
  followedPlies: number;
  /** Demi-coups joués quand la position caractéristique est apparue (par n'importe quel ordre de coups) — `null` : jamais atteinte, la partie est reconnue parce qu'elle suit le cours assez loin. */
  signaturePly: number | null;
  exit: CourseExit | null;
  /** TA première sortie du cours — y compris après une transposition revenue dans le cours. `null` : tu n'as jamais quitté le cours quand il avait une réponse. */
  deviation: CourseDeviation | null;
}

/**
 * Rejoue `moves` (triés par `ply`) dans le cours. `null` si la partie
 * n'appartient pas à ce cours : elle doit atteindre la position
 * caractéristique (`signatureKey`) ou suivre le cours au moins aussi loin
 * que cette ligne (`signatureLength` demi-coups). Une partie que l'adversaire
 * détourne AVANT, par un coup que le cours ne traite pas, n'est pas une
 * partie de cette ouverture (1.e4 e5 2.Nf3 d6 n'est pas une Espagnole).
 */
export function matchGameToCourse(
  index: CourseIndex,
  signatureKey: string | null,
  signatureLength: number,
  moves: readonly CourseGameMove[],
): CourseGameMatch | null {
  let followedPlies = 0;
  let exit: CourseExit | null = null;
  let deviation: CourseDeviation | null = null;
  let signaturePly: number | null = null;

  for (const move of moves) {
    const key = positionKey(move.fenBefore);
    if (key === signatureKey && signaturePly === null) signaturePly = move.ply - 1;
    const position = index.get(key);
    const inCourse = position?.moves.some((m) => m.uci === move.uci) ?? false;

    if (exit === null) {
      if (inCourse) followedPlies = move.ply;
      else if (position && position.moves.length === 0) exit = { by: "end", ply: move.ply, playedSan: move.san, expected: [] };
      else exit = { by: move.byPlayer ? "player" : "opponent", ply: move.ply, playedSan: move.san, expected: position?.moves ?? [] };
    }

    if (!deviation && position && position.moves.length > 0 && move.byPlayer && !inCourse) {
      deviation = {
        ply: move.ply,
        positionKey: key,
        fenBefore: move.fenBefore,
        playedSan: move.san,
        playedUci: move.uci,
        quality: move.quality,
        cpLoss: move.cpLoss,
        expected: position.moves,
        chapterIndex: position.chapterIndex,
        nodeId: position.nodeId,
      };
    }
  }
  return signaturePly !== null || followedPlies >= signatureLength ? { followedPlies, signaturePly, exit, deviation } : null;
}

/** Un cours candidat à l'attribution d'une partie (`attributeGameToCourse`). */
export interface AttributableCourse {
  id: string;
  /** Camp pour lequel le cours est écrit. */
  color: "w" | "b";
  index: CourseIndex;
  signatureKey: string | null;
  /** Longueur de la ligne caractéristique : plus elle est longue, plus la fiche est spécifique. */
  signatureLength: number;
}

export interface CourseAttribution {
  courseId: string;
  match: CourseGameMatch;
  /** `true` : cours écrit pour ton camp ; `false` : aucun cours de ton camp ne correspond, celui-ci sert de référence côté adverse. */
  withCourseSide: boolean;
}

/** Jusqu'où la partie est allée dans l'ouverture du cours : la position caractéristique, sinon la longueur de ligne suivie. */
function advancement(course: AttributableCourse, match: CourseGameMatch): number {
  return match.signaturePly ?? course.signatureLength;
}

/** > 0 : `a` l'emporte sur `b` (même camp). */
function compareCandidates(
  a: { course: AttributableCourse; match: CourseGameMatch },
  b: { course: AttributableCourse; match: CourseGameMatch },
): number {
  return (
    advancement(a.course, a.match) - advancement(b.course, b.match) ||
    a.course.signatureLength - b.course.signatureLength ||
    a.match.followedPlies - b.match.followedPlies
  );
}

/**
 * Le cours UNIQUE auquel une partie est comptée, pour que la somme des
 * parties par cours n'excède jamais le nombre de parties. Une partie compte
 * pour un cours dont elle atteint la position caractéristique, MÊME par un
 * autre ordre de coups (1.e4 e5 2.Bc4 Nc6 3.Nf3 Nf6 est une partie
 * Italienne, pas un Fou-c4). Départage : les cours de TON camp d'abord (ceux
 * du camp adverse ne servent que si aucun ne correspond), puis celui dont la
 * position caractéristique arrive le plus tard dans la partie (l'ouverture la
 * plus avancée), puis la fiche la plus spécifique (ligne caractéristique la
 * plus longue), puis le cours suivi le plus loin.
 */
export function attributeGameToCourse(
  courses: readonly AttributableCourse[],
  playerColor: "w" | "b",
  moves: readonly CourseGameMove[],
): CourseAttribution | null {
  const best = (withCourseSide: boolean): CourseAttribution | null => {
    let chosen: { course: AttributableCourse; match: CourseGameMatch } | null = null;
    for (const course of courses) {
      if ((course.color === playerColor) !== withCourseSide) continue;
      const match = matchGameToCourse(course.index, course.signatureKey, course.signatureLength, moves);
      if (!match) continue;
      if (!chosen || compareCandidates({ course, match }, chosen) > 0) {
        chosen = { course, match };
      }
    }
    return chosen && { courseId: chosen.course.id, match: chosen.match, withCourseSide };
  };
  return best(true) ?? best(false);
}

/** Un coup répété dans plusieurs parties à la même position — déviation récurrente ou gaffe récurrente. */
export interface RecurringMove {
  positionKey: string;
  fenBefore: string;
  ply: number;
  playedSan: string;
  playedUci: string;
  count: number;
  gameIds: string[];
  /** Pire qualité observée pour ce coup (les analyses peuvent varier légèrement d'une partie à l'autre). */
  quality: MoveQuality;
  /** Coups prévus par le cours à cette position (vide si le cours ne la couvre pas). */
  expected: readonly CourseMoveOption[];
  /** Meilleur coup moteur stocké à l'analyse, pour les gaffes hors cours. */
  bestSan: string | null;
  chapterIndex: number | null;
  nodeId: string | null;
}

const QUALITY_SEVERITY: Record<MoveQuality, number> = { blunder: 6, inaccuracy: 5, okay: 4, book: 3, best: 2, critical: 1, brilliant: 0 };

function worse(a: MoveQuality, b: MoveQuality): MoveQuality {
  return QUALITY_SEVERITY[a] >= QUALITY_SEVERITY[b] ? a : b;
}

/** Plus fréquent d'abord, puis le plus tôt dans la partie, puis le plus grave. */
function sortRecurring(list: RecurringMove[]): RecurringMove[] {
  return list.sort((a, b) => b.count - a.count || a.ply - b.ply || QUALITY_SEVERITY[b.quality] - QUALITY_SEVERITY[a.quality]);
}

function addOccurrence(
  tally: Map<string, RecurringMove>,
  gameId: string,
  occurrence: Omit<RecurringMove, "count" | "gameIds">,
): void {
  const key = `${occurrence.positionKey}|${occurrence.playedUci}`;
  const existing = tally.get(key);
  if (existing) {
    if (!existing.gameIds.includes(gameId)) {
      existing.gameIds.push(gameId);
      existing.count += 1;
    }
    existing.quality = worse(existing.quality, occurrence.quality);
  } else {
    tally.set(key, { ...occurrence, count: 1, gameIds: [gameId] });
  }
}

/** Tes sorties du cours, regroupées par (position, coup joué). */
export function tallyDeviations(games: readonly { gameId: string; deviation: CourseDeviation | null }[]): RecurringMove[] {
  const tally = new Map<string, RecurringMove>();
  for (const { gameId, deviation } of games) {
    if (!deviation) continue;
    addOccurrence(tally, gameId, {
      positionKey: deviation.positionKey,
      fenBefore: deviation.fenBefore,
      ply: deviation.ply,
      playedSan: deviation.playedSan,
      playedUci: deviation.playedUci,
      quality: deviation.quality,
      expected: deviation.expected,
      bestSan: null,
      chapterIndex: deviation.chapterIndex,
      nodeId: deviation.nodeId,
    });
  }
  return sortRecurring(Array.from(tally.values()));
}

/**
 * Tes gaffes et imprécisions (`isReviewable`) dans ces parties, regroupées
 * par (position, coup joué) : un même mauvais coup rejoué à la même position
 * d'une partie à l'autre est exactement l'habitude à corriger.
 */
export function tallyMistakes(
  index: CourseIndex,
  games: readonly { gameId: string; moves: readonly (CourseGameMove & { bestSan: string | null })[] }[],
): RecurringMove[] {
  const tally = new Map<string, RecurringMove>();
  for (const { gameId, moves } of games) {
    for (const move of moves) {
      if (!move.byPlayer || !isReviewable(move.quality)) continue;
      const key = positionKey(move.fenBefore);
      const position = index.get(key);
      addOccurrence(tally, gameId, {
        positionKey: key,
        fenBefore: move.fenBefore,
        ply: move.ply,
        playedSan: move.san,
        playedUci: move.uci,
        quality: move.quality,
        expected: position?.moves ?? [],
        bestSan: move.bestSan,
        chapterIndex: position?.chapterIndex ?? null,
        nodeId: position?.nodeId ?? null,
      });
    }
  }
  return sortRecurring(Array.from(tally.values()));
}

/** Une position du cours où tu t'es écarté dans tes parties — l'encart « Dans tes parties » du lecteur de cours. */
export interface CoursePositionNote {
  openingId: string;
  positionKey: string;
  chapterIndex: number;
  nodeId: string;
  ply: number;
  playedSan: string;
  quality: MoveQuality;
  count: number;
  gameIds: string[];
  expectedSan: string[];
}

/** « 12. », « 12... » — numéro de coup lisible d'un demi-coup (1 = 1.). */
export function moveNumberLabel(ply: number): string {
  const number = Math.ceil(ply / 2);
  return ply % 2 === 1 ? `${number}.` : `${number}...`;
}
