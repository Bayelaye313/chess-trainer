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
