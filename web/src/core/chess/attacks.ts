/**
 * Primitives d'attaque absentes de chess.js.
 *
 * chess.js fournit `attackers(case, couleur)` (qui attaque cette case) mais pas
 * la relation inverse `attacks(case)` (que menace la pièce sur cette case), ni
 * la notion de clouage absolu. Les deux sont indispensables à la détection de
 * motifs, on les implémente ici.
 */
import { Chess, type Color, type Square } from "chess.js";
import {
  BISHOP_DIRECTIONS,
  directionBetween,
  KING_OFFSETS,
  KNIGHT_OFFSETS,
  QUEEN_DIRECTIONS,
  rayFrom,
  ROOK_DIRECTIONS,
  step,
  type Direction,
} from "./squares";

const SLIDER_DIRECTIONS: Record<string, readonly Direction[]> = {
  r: ROOK_DIRECTIONS,
  b: BISHOP_DIRECTIONS,
  q: QUEEN_DIRECTIONS,
};

/** Directions de déplacement d'une pièce glissante, `null` si elle ne glisse pas. */
export function sliderDirections(pieceType: string): readonly Direction[] | null {
  return SLIDER_DIRECTIONS[pieceType] ?? null;
}

/**
 * Cases contrôlées par la pièce présente sur `square`.
 *
 * Sémantique alignée sur `python-chess.attacks` : les cases occupées par une
 * pièce amie sont incluses (elles sont défendues), et les captures de pion sont
 * comptées même si la case est vide. Un pion n'« attaque » que ses diagonales,
 * jamais sa poussée.
 */
export function attacksFrom(board: Chess, square: Square): Square[] {
  const piece = board.get(square);
  if (!piece) return [];

  const attacked: Square[] = [];

  if (piece.type === "p") {
    const forward = piece.color === "w" ? 1 : -1;
    for (const df of [-1, 1] as const) {
      const target = step(square, [df, forward]);
      if (target) attacked.push(target);
    }
    return attacked;
  }

  const jumps = piece.type === "n" ? KNIGHT_OFFSETS : piece.type === "k" ? KING_OFFSETS : null;
  if (jumps) {
    for (const offset of jumps) {
      const target = step(square, offset);
      if (target) attacked.push(target);
    }
    return attacked;
  }

  for (const direction of sliderDirections(piece.type) ?? []) {
    for (const target of rayFrom(square, direction)) {
      attacked.push(target);
      // Le rayon s'arrête sur la première pièce rencontrée, incluse.
      if (board.get(target)) break;
    }
  }

  return attacked;
}

/**
 * La pièce de `color` sur `square` est-elle clouée absolument, c'est-à-dire
 * alignée entre son propre roi et une pièce glissante ennemie ?
 *
 * Équivalent de `python-chess.is_pinned`. Un roi n'est jamais cloué.
 */
export function isPinned(board: Chess, color: Color, square: Square): boolean {
  const piece = board.get(square);
  if (!piece || piece.color !== color || piece.type === "k") return false;

  const [kingSquare] = board.findPiece({ type: "k", color });
  if (!kingSquare) return false;

  const direction = directionBetween(kingSquare, square);
  if (!direction) return false;

  // Le chemin roi → pièce doit être dégagé, sinon la pièce n'écrante rien.
  for (const between of rayFrom(kingSquare, direction)) {
    if (between === square) break;
    if (board.get(between)) return false;
  }

  // Derrière la pièce, la première occupée doit être une glissante ennemie
  // capable d'attaquer dans cette direction.
  for (const behind of rayFrom(square, direction)) {
    const occupant = board.get(behind);
    if (!occupant) continue;
    if (occupant.color === color) return false;
    const directions = sliderDirections(occupant.type);
    if (!directions) return false;
    return directions.some(([df, dr]) => df === direction[0] && dr === direction[1]);
  }

  return false;
}

/** La pièce sur `square` est-elle sans aucun défenseur ? */
export function isUndefended(board: Chess, square: Square, owner: Color): boolean {
  return board.attackers(square, owner).length === 0;
}

/**
 * Le camp `color` a-t-il, quelque part sur l'échiquier, une pièce (le roi
 * excepté) attaquée sans reprise légale possible ?
 *
 * Ne se contente pas de `isUndefended` seule : une pièce dont l'unique
 * « défenseur » est clouée sur son propre roi ne peut pas légalement
 * reprendre — même angle mort que celui corrigé dans `chess/sacrifice.ts`
 * (`attackers()` de chess.js est purement géométrique, il ignore les
 * clouages). Sert à repérer, après coup, une pièce laissée en prise — voir
 * `core/analysis/progress-insights.ts`, axe « pièces en prise ».
 */
export function hasHangingPiece(board: Chess, color: Color): boolean {
  const opponent: Color = color === "w" ? "b" : "w";
  for (const row of board.board()) {
    for (const piece of row) {
      if (!piece || piece.color !== color || piece.type === "k") continue;
      if (board.attackers(piece.square, opponent).length === 0) continue; // rien ne l'attaque
      const defenders = board.attackers(piece.square, color);
      const hasLegalDefender = defenders.some((square) => !isPinned(board, color, square));
      if (!hasLegalDefender) return true;
    }
  }
  return false;
}
