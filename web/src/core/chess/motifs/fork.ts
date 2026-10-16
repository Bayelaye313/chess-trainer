import { Chess, type Color, type Square } from "chess.js";
import { attacksFrom } from "../attacks";
import { MINOR_PIECE_VALUE, valueOf } from "../pieces";

/**
 * Fourchette : la pièce qui vient d'arriver sur `square` attaque simultanément
 * au moins deux cibles ennemies qui comptent — le roi, ou une pièce d'au moins
 * la valeur d'un cavalier. Les pions attaqués ne créent pas une fourchette.
 */
export function isFork(after: Chess, square: Square, color: Color): boolean {
  if (!after.get(square)) return false;

  let valuableTargets = 0;
  for (const target of attacksFrom(after, square)) {
    const piece = after.get(target);
    if (!piece || piece.color === color) continue;
    if (piece.type === "k" || valueOf(piece) >= MINOR_PIECE_VALUE) {
      valuableTargets += 1;
      if (valuableTargets >= 2) return true;
    }
  }

  return false;
}
