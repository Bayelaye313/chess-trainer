import { Chess, type Color, type Move } from "chess.js";
import { isPinned, isUndefended } from "../attacks";
import type { Motif } from "../types";

/**
 * Motifs portés par la capture elle-même : la pièce prise était-elle clouée
 * (elle ne pouvait pas fuir) ou simplement en prise (personne ne la défendait) ?
 *
 * Les deux s'excluent : le clouage explique mieux la prise que l'absence de
 * défenseur, il prime.
 *
 * Limite connue : en prise en passant, la case du pion capturé n'est pas la case
 * d'arrivée. On l'ignore, comme le faisait le prototype Python — un pion pris en
 * passant produit de toute façon rarement un motif intéressant.
 */
export function detectCaptureMotifs(before: Chess, move: Move, color: Color): Motif[] {
  if (!move.isCapture()) return [];

  const opponent: Color = color === "w" ? "b" : "w";
  const captured = move.to;

  if (isPinned(before, opponent, captured)) return ["pin"];
  if (isUndefended(before, captured, opponent)) return ["hanging_piece"];

  return [];
}
