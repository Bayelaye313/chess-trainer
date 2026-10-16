/**
 * Décision pure du protocole d'apprentissage en 2 manches façon Listudy — voir
 * le docstring de `use-opening-drill.ts` pour le déroulé complet (`LearningRound`) :
 *  - Manche 1 (indice autorisé) débouche TOUJOURS, à la fin du script, sur une
 *    Manche 2 qui rejoue le même chapitre depuis le début, indice désactivé ;
 *  - Manche 2 ne termine vraiment le drill (et donc ne déclenche la
 *    sauvegarde de la progression) que si elle a été parcourue sans AUCUNE
 *    faute — la moindre faute la fait recommencer, en boucle, jusqu'à un
 *    sans-faute complet.
 *
 * Module pur, sans dépendance React : testable indépendamment du hook, même
 * parti pris que `build-final-test.ts`.
 */

export type LearningRound = 1 | 2;

/** Score brut d'une manche — mêmes champs que `score` dans `use-opening-drill.ts`. */
export interface LearningRoundScore {
  /** Coups théoriques trouvés (un coup faux ne compte jamais ici). */
  correct: number;
  /** Coups tentés, fautes comprises. */
  attempted: number;
}

export interface LearningRoundOutcome {
  /**
   * `true` : le chapitre doit se réinitialiser automatiquement (retour au
   * début du même script) et repartir en `nextRound` — le drill NE se termine
   * PAS. `false` : la Manche 2 est passée sans faute, le drill peut
   * réellement se terminer (`finish`, sauvegarde de la progression).
   */
  shouldRestart: boolean;
  /** Manche à afficher après ce restart — sans effet quand `shouldRestart` est `false`. */
  nextRound: LearningRound;
}

/**
 * "Sans faute" au sens du protocole : au moins une tentative, et aucun coup
 * faux (`correct === attempted`). Une manche 2 interrompue sans qu'aucun coup
 * n'ait été joué (`attempted === 0`) ne prouve rien — elle compte comme un
 * échec, donc une nouvelle Manche 2. Même règle que `isPerfect` côté serveur
 * (`server/srs/opening-repetition.ts`), dupliquée ici volontairement : ce
 * module reste indépendant du serveur, comme `build-final-test.ts`.
 */
function isFaultless(score: LearningRoundScore): boolean {
  return score.attempted > 0 && score.correct === score.attempted;
}

/**
 * Que faire quand un chapitre (ligne principale/variante) atteint la fin de
 * son script, sous le protocole en 2 manches ? Appelée UNIQUEMENT pour ces
 * deux sélections (voir `usesLearningRounds` dans `use-opening-drill.ts`) —
 * Aléatoire/Test Final/Correction ciblée n'y passent jamais.
 */
export function nextLearningRoundOutcome(
  currentRound: LearningRound,
  score: LearningRoundScore,
  playerMovesExpected = true,
): LearningRoundOutcome {
  if (currentRound === 1) {
    // Fin de la Manche 1 (indice autorisé, fautes tolérées) : toujours un
    // enchaînement automatique vers la Manche 2, quel que soit le score.
    return { shouldRestart: true, nextRound: 2 };
  }
  // Certaines ouvertures importées commencent par un coup adverse et
  // s'arrêtent avant le premier coup du joueur (par ex. Zukertort Defense
  // côté Noir, script d'un seul ply). Il n'y a alors aucune réponse possible
  // à mémoriser : relancer la Manche 2 indéfiniment ferait rejouer le même
  // cavalier sans jamais atteindre `finished`.
  if (!playerMovesExpected) return { shouldRestart: false, nextRound: 2 };
  // Manche 2 : seul un sans-faute complet termine vraiment le drill.
  return isFaultless(score) ? { shouldRestart: false, nextRound: 2 } : { shouldRestart: true, nextRound: 2 };
}
