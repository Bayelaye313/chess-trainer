import { Chess } from "chess.js";

/**
 * Case du roi du camp au trait dans `fen`, seulement s'il est en échec (échec
 * simple ou échec et mat) — `null` sinon.
 *
 * Retour utilisateur direct : sur certains puzzles, le roi du joueur est déjà
 * en échec (voire maté) dès le chargement, et rien ne le signalait avant
 * qu'il ne cherche à comprendre pourquoi tous ses coups semblaient illégaux.
 * `PuzzleBoard` s'en sert pour surligner le roi menacé automatiquement, sans
 * attendre que le joueur lise le texte de statut.
 */
export function kingInCheckSquare(fen: string): string | null {
  const board = new Chess(fen);
  if (!board.inCheck()) return null;
  const [square] = board.findPiece({ type: "k", color: board.turn() });
  return square ?? null;
}
