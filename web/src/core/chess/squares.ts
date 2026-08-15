/**
 * Géométrie de l'échiquier sur les cases algébriques de chess.js ("e4").
 *
 * chess.js n'expose pas d'API géométrique (pas d'équivalent aux `attacks` /
 * rayons de python-chess) : on la reconstruit ici, une fois, proprement.
 *
 * Convention : file 0 = colonne a, rank 0 = rangée 1.
 */
import type { Square } from "chess.js";

/** Déplacement élémentaire `[colonnes, rangées]`. */
export type Direction = readonly [file: number, rank: number];

export const ROOK_DIRECTIONS: readonly Direction[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const BISHOP_DIRECTIONS: readonly Direction[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export const QUEEN_DIRECTIONS: readonly Direction[] = [
  ...ROOK_DIRECTIONS,
  ...BISHOP_DIRECTIONS,
];

export const KNIGHT_OFFSETS: readonly Direction[] = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

export const KING_OFFSETS: readonly Direction[] = QUEEN_DIRECTIONS;

const FILE_A = "a".charCodeAt(0);
const RANK_1 = "1".charCodeAt(0);

/** Colonne de la case, 0 (a) à 7 (h). */
export function fileOf(square: Square): number {
  return square.charCodeAt(0) - FILE_A;
}

/** Rangée de la case, 0 (rangée 1) à 7 (rangée 8). */
export function rankOf(square: Square): number {
  return square.charCodeAt(1) - RANK_1;
}

/** Case aux coordonnées données, ou `null` si hors échiquier. */
export function squareAt(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return (String.fromCharCode(FILE_A + file) + String.fromCharCode(RANK_1 + rank)) as Square;
}

/** Case atteinte depuis `from` en appliquant `direction` une fois. */
export function step(from: Square, [df, dr]: Direction): Square | null {
  return squareAt(fileOf(from) + df, rankOf(from) + dr);
}

/**
 * Toutes les cases depuis `from` dans `direction` jusqu'au bord, exclue `from`.
 * Ne tient pas compte des pièces — au consommateur de s'arrêter sur un obstacle.
 */
export function rayFrom(from: Square, direction: Direction): Square[] {
  const squares: Square[] = [];
  let current = step(from, direction);
  while (current !== null) {
    squares.push(current);
    current = step(current, direction);
  }
  return squares;
}

/** Direction unitaire de `from` vers `to`, ou `null` si non alignées. */
export function directionBetween(from: Square, to: Square): Direction | null {
  const df = fileOf(to) - fileOf(from);
  const dr = rankOf(to) - rankOf(from);
  if (df === 0 && dr === 0) return null;
  if (df !== 0 && dr !== 0 && Math.abs(df) !== Math.abs(dr)) return null;
  return [Math.sign(df), Math.sign(dr)];
}
