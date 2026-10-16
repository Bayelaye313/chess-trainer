import type { GameResult } from "../chess/types";

/**
 * Estimation de performance Élo d'une partie contre un bot local (Sparring
 * Humain Local, `client/features/play`) — le pendant, pour une partie contre
 * le moteur, de `timeline.ts#computeAccuracy` : une heuristique transparente,
 * présentée comme telle à l'écran (« Performance démontrée », jamais
 * « Nouveau classement »), pas une formule de classement officielle (pas
 * d'historique de parties, un seul point de mesure).
 *
 * Principe : partir de la force RÉELLE du bot affronté (`BotProfile.nominalElo`,
 * voir `chess/bot-profiles.ts`) et la corriger de deux façons — la précision du
 * joueur sur la partie (au-dessus de 50 % ça monte, en dessous ça descend) et
 * l'issue de la partie (gagner face à ce niveau vaut plus qu'une précision
 * identique dans une partie perdue).
 */

/** Points de performance par point de précision (%) au-dessus/en dessous de 50 %. */
const ACCURACY_ELO_SCALE = 12;

/** Bonus/malus selon l'issue de la partie, appliqué après l'ajustement par précision. */
const RESULT_ELO_BONUS = 100;

/** Plancher de l'estimation — au-delà, le chiffre perd tout sens pédagogique. */
const MIN_PERFORMANCE_ELO = 400;

export function estimatePerformanceElo(
  botNominalElo: number,
  accuracy: number | null,
  result: GameResult | null,
  playerColor: "w" | "b",
): number {
  // Aucun coup analysé (partie abandonnée avant le premier coup) : le niveau
  // du bot affronté reste la meilleure estimation disponible.
  if (accuracy === null) return Math.round(botNominalElo);

  const fromAccuracy = botNominalElo + (accuracy - 50) * ACCURACY_ELO_SCALE;

  let resultBonus = 0;
  if (result === "1-0" || result === "0-1") {
    const playerWon = (result === "1-0") === (playerColor === "w");
    resultBonus = playerWon ? RESULT_ELO_BONUS : -RESULT_ELO_BONUS;
  }

  return Math.max(MIN_PERFORMANCE_ELO, Math.round(fromAccuracy + resultBonus));
}
