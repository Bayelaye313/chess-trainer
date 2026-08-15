import type { PieceSymbol } from "chess.js";

/**
 * Le roi n'a pas de valeur d'échange : on lui donne une valeur sentinelle très
 * haute pour qu'il domine toute comparaison de valeur.
 */
export const KING_VALUE = 99;

/** Valeur d'échange classique, en pions. */
export const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: KING_VALUE,
};

/** Seuil « pièce de valeur » : cavalier ou mieux. */
export const MINOR_PIECE_VALUE = 3;

/**
 * Matériel compté pour déterminer la phase : pièces seules, pions et roi exclus.
 * 62 au départ (2×(9+2×5+2×3+2×3)).
 */
export const PHASE_MATERIAL_VALUE: Partial<Record<PieceSymbol, number>> = {
  q: 9,
  r: 5,
  b: 3,
  n: 3,
};

/** Total du matériel de départ pris en compte pour la phase. */
export const PHASE_MATERIAL_AT_START = 62;

/**
 * Valeur d'une pièce **en tant que repreneuse**.
 *
 * Échelle distincte de `PIECE_VALUE`, et c'est volontaire : comme cible, le roi
 * est ce qu'il y a de plus précieux ; comme repreneur, il ne coûte rien. Un fou
 * donné en h7 et repris par le roi reste un sacrifice — c'est même le motif
 * classique du gambit grec.
 */
export const RECAPTURE_VALUE: Record<PieceSymbol, number> = {
  ...PIECE_VALUE,
  k: 1,
};

export function valueOf(piece: { type: PieceSymbol } | undefined | null): number {
  if (!piece) return 0;
  return PIECE_VALUE[piece.type];
}

export function recaptureValueOf(piece: { type: PieceSymbol } | undefined | null): number {
  if (!piece) return 0;
  return RECAPTURE_VALUE[piece.type];
}
