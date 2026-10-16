/**
 * Endurance « Sans Guide » : une session = UNE Manche 2 terminée (ligne
 * principale ou variante) du drill d'ouverture (`use-opening-drill.ts`).
 * Écrite par le hook via `server/actions/opening-endurance.ts`, relue par
 * `server/queries/opening-endurance.ts`, affichée par
 * `OpeningEnduranceHistory`. Le type vit ici, dans `core/`, parce que le
 * serveur et le client le partagent et que `server/` n'importe jamais
 * `client/`.
 *
 * Ce qu'est une « faute » ici : un coup REFUSÉ par le drill (hors script et
 * hors théorie connue) ou un piège documenté joué (`triggerTrapPunishment`).
 * Le drill ne consulte aucun moteur : il n'existe pas de perte en centipions
 * à mesurer, un coup accepté est par construction un coup théorique.
 */

/** Une session « Sans Guide » terminée, telle que l'écran d'historique la consomme. */
export interface OpeningSessionHistory {
  /** Identifiant stable de la session (clé React). */
  sessionId: string;
  /** Id du catalogue `OPENINGS`, ex. « sicilian-alapin » — clé de regroupement du comparateur. */
  openingId: string;
  /** Nom affiché, ex. « Alapine ». */
  openingName: string;
  /**
   * Ligne jouée, format `opening-variation-key.ts` : « main_line » ou
   * `${eco}|${name}` pour une variante nommée (une déviation de l'adversaire
   * par rapport à la ligne principale). Sert à l'« Instinct de Punition » du
   * radar de performance (`opening-performance-radar.ts`).
   */
  variationKey: string;
  /** Date de fin de session, ISO 8601. */
  playedAt: string;
  /** Ply absolu de la PREMIÈRE erreur, `null` si la ligne a été jouée sans faute. */
  firstMistakePly: number | null;
  /** Dernier ply de la ligne atteint pendant la session : borne de l'endurance quand il n'y a aucune erreur. */
  lastPly: number;
  /** Précision de la session en % (0-100). */
  accuracy: number;
}

export interface EnduranceSessionMetrics {
  firstMistakePly: number | null;
  lastPly: number;
  accuracy: number;
}

/**
 * Métriques d'une Manche 2 terminée. `null` quand la manche ne contient aucun
 * coup du joueur (`attempted === 0`) : rien à mesurer, rien à enregistrer.
 * La précision suit EXACTEMENT la règle de `lastAccuracy`
 * (`server/srs/opening-repetition.ts`) : coups trouvés / coups tentés,
 * fautes comprises, arrondi à l'entier.
 */
export function buildEnduranceSessionMetrics(input: {
  firstMistakePly: number | null;
  lastPly: number;
  correct: number;
  attempted: number;
}): EnduranceSessionMetrics | null {
  if (input.attempted <= 0) return null;
  const accuracy = Math.round((input.correct / input.attempted) * 100);
  return {
    // Une manche à 100 % ne peut pas porter de faute : on ne propage jamais un ply incohérent.
    firstMistakePly: accuracy === 100 ? null : input.firstMistakePly,
    lastPly: Math.max(input.lastPly, 0),
    accuracy,
  };
}
