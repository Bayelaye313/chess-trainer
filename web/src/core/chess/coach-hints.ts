/**
 * Qualifie un coup hors-solution joué pendant un puzzle (`solve-state.ts`,
 * branche `!matchesSolution` de `applyWhileSolving`) — au lieu du seul
 * compteur d'essais, un indice textuel nommant la nature de l'erreur, sur le
 * modèle « Humanized Coaching » de CLAUDE.md (« Left piece en prise »,
 * « Weak King Safety »).
 *
 * Pur (chess.js uniquement), aucune dépendance moteur : les deux heuristiques
 * ci-dessous sont volontairement bon marché (pas d'appel Stockfish) pour
 * rester instantanées à chaque coup faux, contrairement à la jauge live qui,
 * elle, interroge le moteur.
 */
import { Chess, type Color } from "chess.js";
import { hasHangingPiece } from "./attacks";
import { WRONG_MOVE_HINTS, type WrongMoveHint } from "./types";

export { WRONG_MOVE_HINTS, type WrongMoveHint };

/**
 * `before`/`after` encadrent le coup hors-solution : `after` est la position
 * une fois ce coup joué (avant que l'appelant ne l'annule, voir le docstring
 * de `use-puzzle-solver.ts#onPieceDrop`). `mover` est le camp qui vient de
 * jouer — jamais déduit du trait de `after`, qui a déjà tourné.
 */
export function classifyWrongMove(before: Chess, after: Chess, mover: Color): WrongMoveHint {
  // Pièce en prise : seulement si CE coup en est la cause — un matériel déjà
  // perdu avant le coup ne doit pas être reproché à celui-ci.
  if (hasHangingPiece(after, mover) && !hasHangingPiece(before, mover)) return "hangs_piece";

  if (exposesKingToCheck(after)) return "exposes_king";

  return "generic";
}

/**
 * L'adversaire (au trait dans `after`) a-t-il un coup légal qui donne échec ?
 * Proxy bon marché de « sécurité du roi » : le coup joué vient d'ouvrir une
 * menace d'échec immédiate, qu'elle soit ou non le prélude d'une vraie
 * combinaison. `after.moves()` reste petit (au plus une quarantaine de coups
 * légaux) : un clone par coup candidat est largement assez rapide ici.
 */
function exposesKingToCheck(after: Chess): boolean {
  for (const san of after.moves()) {
    const probe = new Chess(after.fen());
    probe.move(san);
    if (probe.isCheck()) return true;
  }
  return false;
}
