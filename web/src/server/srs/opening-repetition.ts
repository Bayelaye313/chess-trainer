/**
 * Calendrier de répétition espacée du Mode Entraînement des ouvertures —
 * volontairement plus simple que FSRS (`fsrs.ts`, réservé aux puzzles) :
 * intervalles fixes indexés sur un streak, façon Anki débutant/Chessable,
 * plutôt qu'un modèle stabilité/difficulté par carte. Une variante entière
 * (dizaine de coups) est un exercice bien plus grossier qu'un puzzle unique —
 * la précision de FSRS n'apporterait rien ici, et un calendrier prévisible
 * (1 / 3 / 7 / 14 / 30 jours) reste plus lisible dans le tableau de bord.
 *
 * Pur, comme `fsrs.ts` : ne lit ni n'écrit la base — voir
 * `server/queries/opening-progress.ts` pour la persistance.
 */

/**
 * Jours avant la prochaine révision, indexés par streak APRÈS mise à jour
 * (voir `scheduleOpeningReview`). Un streak >= 4 reste sur la dernière
 * valeur (30 jours) — pas de croissance sans borne, un intervalle mensuel
 * suffit à qualifier une variante de "maîtrisée" pour ce tableau de bord.
 */
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function intervalDaysForStreak(streak: number): number {
  const index = Math.min(Math.max(streak, 0), REVIEW_INTERVAL_DAYS.length - 1);
  return REVIEW_INTERVAL_DAYS[index];
}

/** Score brut d'une tentative de drill — mêmes champs que `score` dans `use-opening-drill.ts`. */
export interface OpeningDrillOutcome {
  /** Coups théoriques trouvés (corrects + hors-répertoire) — un coup faux ne compte jamais ici. */
  correct: number;
  /** Coups tentés, fautes comprises. */
  attempted: number;
}

export interface OpeningReviewState {
  attemptsCount: number;
  streak: number;
}

export interface ScheduledOpeningReview {
  attemptsCount: number;
  streak: number;
  /** Pourcentage arrondi (0-100). */
  lastAccuracy: number;
  nextReviewDate: Date;
}

/**
 * "Sans faute" au sens du spec : au moins une tentative, et aucun coup faux
 * (donc `correct === attempted` — un coup hors-répertoire reste une réussite,
 * voir le docstring de `use-opening-drill.ts`). Une session interrompue sans
 * qu'aucun coup n'ait été joué (`attempted === 0`) compte comme un échec :
 * rien ne prouve que la variante est sue.
 */
function isPerfect(outcome: OpeningDrillOutcome): boolean {
  return outcome.attempted > 0 && outcome.correct === outcome.attempted;
}

/**
 * Calcule le prochain état de révision d'une variante après un drill.
 *
 * Le streak (donc l'intervalle) reflète le résultat DE CETTE tentative, pas
 * l'ancien : un sans-faute avance le streak d'un cran et programme selon le
 * nouveau palier ; la moindre faute le remet à 0 et reprogramme à demain.
 */
export function scheduleOpeningReview(
  current: OpeningReviewState,
  outcome: OpeningDrillOutcome,
  now: Date,
): ScheduledOpeningReview {
  const streak = isPerfect(outcome) ? current.streak + 1 : 0;
  const lastAccuracy = outcome.attempted > 0 ? Math.round((outcome.correct / outcome.attempted) * 100) : 0;
  const nextReviewDate = new Date(now.getTime() + intervalDaysForStreak(streak) * DAY_MS);

  return { attemptsCount: current.attemptsCount + 1, streak, lastAccuracy, nextReviewDate };
}
