import type { MoveQuality } from "./types";

/**
 * En dessous, une perte de probabilité de gain (%) reste sans conséquence
 * pratique — c'est le seuil à partir duquel Lichess commence lui-même à
 * signaler quelque chose (leur « Imprécision »).
 */
export const OKAY_MAX_LOSS = 10;

/** Au-delà, le coup est classé Gaffe — sous ce seuil mais au-dessus du précédent, Imprécision. */
export const BLUNDER_MIN_LOSS = 20;

/**
 * Écart minimal (%) entre le meilleur coup et le second, dans la position
 * *avant* le coup, pour qu'on la dise « critique » : jouer autre chose que le
 * meilleur coup y coûtait déjà au moins une imprécision. En dessous, plusieurs
 * coups se valaient — le trouver n'avait rien d'exceptionnel.
 *
 * À lui seul, insuffisant pour qualifier « Critique » — voir
 * `CRITICAL_SECOND_BEST_MAX_WIN` juste en dessous : un gros écart ne veut pas
 * forcément dire que l'alternative était mauvaise, seulement que le meilleur
 * coup était exceptionnellement fort (typiquement un sacrifice « Brillant »).
 */
export const CRITICAL_GAP_THRESHOLD = 10;

/**
 * Seuil (% de probabilité de gain) sous lequel le SECOND choix moteur est
 * lui-même perdant/en difficulté pour le joueur au trait — condition requise,
 * en plus de `CRITICAL_GAP_THRESHOLD`, pour qualifier une position de
 * « Critique ».
 *
 * Bug corrigé ici (« aucun coup Brillant ne sort plus, tout est absorbé par
 * Critique ») : un vrai sacrifice Brillant est presque toujours nettement
 * meilleur que l'alternative sage qui ne sacrifie rien — ce qui produisait
 * systématiquement un gros `secondBestGap`, et donc systématiquement
 * `critical`, avant même qu'`isBrilliantSacrifice` (`sacrifice.ts`) ait pu se
 * prononcer (elle refuse tout coup déjà `critical`, CLAUDE.md : « Critique »
 * et « Brillant » sont mutuellement exclusifs). Le vrai test du Critique
 * (CLAUDE.md : « la SEULE façon de sauver la position ») porte sur
 * l'alternative ELLE-MÊME : est-elle perdante dans l'absolu, pas seulement
 * moins bonne que le sommet du classement ? 50 = égalité stricte, même
 * convention que `sacrifice.ts#BRILLIANT_MIN_WIN_PERCENT_AFTER`.
 */
export const CRITICAL_SECOND_BEST_MAX_WIN = 50;

export interface ClassifyMoveInput {
  /** Le coup joué est-il exactement celui recommandé par le moteur ? */
  foundBest: boolean;
  /** Un seul coup légal existait — la position ne pouvait pas ne pas être critique. */
  onlyLegalMove: boolean;
  /** Perte de probabilité de gain (%) par rapport au meilleur coup ; 0 si `foundBest`. */
  winPercentLoss: number;
  /**
   * Écart (%) entre le meilleur coup et le second, POV du joueur. `null` si
   * non mesuré (MultiPV indisponible, ou pas de second coup légal distinct).
   */
  secondBestGap: number | null;
  /**
   * Probabilité de gain (%) du second choix moteur lui-même, POV du joueur.
   * Distinct de `secondBestGap` (qui ne mesure qu'un écart RELATIF au
   * meilleur coup) : ici on juge l'alternative dans l'absolu. `null` si non
   * mesurée. Voir `CRITICAL_SECOND_BEST_MAX_WIN`.
   */
  secondBestWinPercent: number | null;
}

/**
 * Qualité d'un coup à partir de ce qu'il a coûté en probabilité de gain (voir
 * `analysis/win-percent.ts`) et de ce que la position exigeait.
 *
 * Ne tranche jamais lui-même le cas « Brillant » (sacrifice + meilleur coup) :
 * c'est `evaluate-move.ts` qui surclasse `best`/`critical` après coup, une
 * fois `isSacrifice` connu — cette fonction reste pure, sans dépendance à
 * `chess.js`.
 */
export function classifyMove({
  foundBest,
  onlyLegalMove,
  winPercentLoss,
  secondBestGap,
  secondBestWinPercent,
}: ClassifyMoveInput): MoveQuality {
  if (foundBest) {
    // Les DEUX conditions comptent : un gros écart à lui seul ne suffit pas
    // (voir CRITICAL_SECOND_BEST_MAX_WIN) — il faut aussi que l'alternative
    // laissée de côté soit elle-même mauvaise pour le joueur.
    const alternativeCollapses =
      secondBestGap !== null &&
      secondBestGap >= CRITICAL_GAP_THRESHOLD &&
      secondBestWinPercent !== null &&
      secondBestWinPercent < CRITICAL_SECOND_BEST_MAX_WIN;
    const isCritical = onlyLegalMove || alternativeCollapses;
    return isCritical ? "critical" : "best";
  }
  if (winPercentLoss < OKAY_MAX_LOSS) return "okay";
  if (winPercentLoss < BLUNDER_MIN_LOSS) return "inaccuracy";
  return "blunder";
}
