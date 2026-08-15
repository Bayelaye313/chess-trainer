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
 */
export const CRITICAL_GAP_THRESHOLD = 10;

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
}: ClassifyMoveInput): MoveQuality {
  if (foundBest) {
    const isCritical = onlyLegalMove || (secondBestGap !== null && secondBestGap >= CRITICAL_GAP_THRESHOLD);
    return isCritical ? "critical" : "best";
  }
  if (winPercentLoss < OKAY_MAX_LOSS) return "okay";
  if (winPercentLoss < BLUNDER_MIN_LOSS) return "inaccuracy";
  return "blunder";
}
