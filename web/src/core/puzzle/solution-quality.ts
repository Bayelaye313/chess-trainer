import { Chess } from "chess.js";
import { moveInputFromUci } from "@/core/analysis/evaluate-move";
import { isSacrifice } from "@/core/chess/sacrifice";

/**
 * Qualité affichée d'un coup DE LA SOLUTION d'un puzzle, sans appel moteur :
 * la solution est par définition le meilleur coup et la position qui suit
 * reste gagnante — il ne manque au « Brillant » que le don de matériel
 * (`isSacrifice`, même critère que la revue de partie). Un sacrifice de la
 * solution est donc « brilliant », tout autre coup « best ».
 */
export function solutionMoveQuality(fenBefore: string, uci: string): "brilliant" | "best" {
  try {
    const move = new Chess(fenBefore).move(moveInputFromUci(uci));
    return isSacrifice(new Chess(fenBefore), move) ? "brilliant" : "best";
  } catch {
    return "best";
  }
}
