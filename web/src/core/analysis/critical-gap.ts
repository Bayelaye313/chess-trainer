import { winPercentFromWhitePov } from "./win-percent";

/** Évaluation brute d'un coup, POV Blancs — le sous-ensemble utile ici de `PositionEvaluation`. */
export interface ScoreLike {
  cp: number | null;
  mate: number | null;
}

/**
 * Delta d'évaluation (%) entre le meilleur coup et le second choix du moteur,
 * point de vue du joueur au trait.
 *
 * C'est le signal qui distingue « Meilleur coup » de « Critique » (voir
 * `chess/classify.ts` et CLAUDE.md « The Elite Move Triad ») : un grand écart
 * signifie que toute autre réponse que le meilleur coup faisait déjà chuter
 * l'évaluation — la position n'offrait qu'une seule bonne option.
 *
 * Exprimé en probabilité de gain plutôt qu'en centipions bruts : un même écart
 * de centipions ne pèse pas pareil près de l'égalité qu'en position déjà
 * décidée (voir `win-percent.ts`). `null` si le moteur n'a pas exposé de
 * second choix (MultiPV indisponible, ou pas de second coup légal distinct).
 */
export function computeSecondBestGap(
  best: ScoreLike,
  secondBest: ScoreLike | null,
  moverIsWhite: boolean,
): number | null {
  if (!secondBest) return null;
  const winBestMover = winPercentFromWhitePov(best.cp, best.mate, moverIsWhite);
  const winSecondMover = winPercentFromWhitePov(secondBest.cp, secondBest.mate, moverIsWhite);
  return Math.max(0, winBestMover - winSecondMover);
}

/**
 * Probabilité de gain (%) du second choix moteur LUI-MÊME, POV du joueur au
 * trait — le pendant absolu de `computeSecondBestGap` ci-dessus, qui ne
 * mesure qu'un écart RELATIF au meilleur coup. Sert à vérifier que
 * l'alternative écartée restait elle-même défendable avant de qualifier une
 * position de « Critique » (voir `chess/classify.ts#CRITICAL_SECOND_BEST_MAX_WIN`) :
 * un gros écart avec le meilleur coup ne suffit pas si l'alternative, dans
 * l'absolu, restait tout à fait jouable — c'est alors le meilleur coup qui
 * était exceptionnel (typiquement un sacrifice « Brillant »), pas la position
 * qui était critique. `null` si aucun second choix n'a été exposé.
 */
export function secondBestWinPercent(
  secondBest: ScoreLike | null,
  moverIsWhite: boolean,
): number | null {
  if (!secondBest) return null;
  return winPercentFromWhitePov(secondBest.cp, secondBest.mate, moverIsWhite);
}
