import { Chess } from "chess.js";
import { fileOf, rankOf, squareAt } from "../squares";

/**
 * Mat du couloir : le roi maté est sur sa rangée de départ et ses trois cases
 * de fuite vers l'avant sont bouchées par ses propres pièces.
 *
 * À appeler sur une position déjà matée — le camp au trait est le camp maté.
 */
export function isBackRankMate(mated: Chess): boolean {
  const color = mated.turn();
  const [kingSquare] = mated.findPiece({ type: "k", color });
  if (!kingSquare) return false;

  const homeRank = color === "w" ? 0 : 7;
  if (rankOf(kingSquare) !== homeRank) return false;

  const forward = color === "w" ? 1 : -1;
  const file = fileOf(kingSquare);

  const escapes = [file - 1, file, file + 1]
    .map((f) => squareAt(f, homeRank + forward))
    .filter((square) => square !== null);

  if (escapes.length === 0) return false;

  return escapes.every((square) => mated.get(square)?.color === color);
}
