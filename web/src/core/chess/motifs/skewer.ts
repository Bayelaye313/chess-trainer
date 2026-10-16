import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { sliderDirections } from "../attacks";
import { valueOf } from "../pieces";
import { rayFrom } from "../squares";

/** Une tour vaut 5 : en dessous, la pièce de devant ne « vaut pas » d'être enfilée. */
const SKEWER_FRONT_MIN_VALUE = 5;

/**
 * Enfilade : depuis `square`, une pièce glissante aligne deux pièces ennemies,
 * la plus précieuse devant. Elle doit bouger et abandonne celle de derrière.
 *
 * C'est l'inverse du clouage, où la pièce de valeur est derrière.
 */
export function isSkewer(
  after: Chess,
  square: Square,
  pieceType: PieceSymbol,
  color: Color,
): boolean {
  const directions = sliderDirections(pieceType);
  if (!directions) return false;

  for (const direction of directions) {
    const occupied = [];
    for (const target of rayFrom(square, direction)) {
      const piece = after.get(target);
      if (piece) occupied.push(piece);
      if (occupied.length === 2) break;
    }
    if (occupied.length < 2) continue;

    const [front, behind] = occupied;
    if (front.color === color || behind.color === color) continue;

    const frontValue = valueOf(front);
    if (frontValue >= SKEWER_FRONT_MIN_VALUE && frontValue >= valueOf(behind)) {
      return true;
    }
  }

  return false;
}
