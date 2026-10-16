import { Chess, type Color, type Move, type Square } from "chess.js";
import { attacksFrom } from "../attacks";

const SLIDERS = ["b", "r", "q"] as const;

/**
 * Attaque à la découverte : une pièce glissante amie *autre* que celle qui a
 * bougé attaque une cible ennemie qu'elle n'attaquait pas avant. Le coup a
 * dégagé sa ligne.
 *
 * La case d'arrivée du coup est exclue des nouvelles cibles : y arriver ne
 * démasque rien, c'est juste la pièce déplacée qui s'y trouve désormais.
 */
export function isDiscoveredAttack(
  before: Chess,
  move: Move,
  after: Chess,
  color: Color,
): boolean {
  for (const type of SLIDERS) {
    for (const square of before.findPiece({ type, color })) {
      if (square === move.from) continue;
      if (!after.get(square)) continue;

      const wasAttacking = new Set<Square>(attacksFrom(before, square));

      for (const target of attacksFrom(after, square)) {
        if (wasAttacking.has(target) || target === move.to) continue;
        const piece = after.get(target);
        if (piece && piece.color !== color) return true;
      }
    }
  }

  return false;
}
