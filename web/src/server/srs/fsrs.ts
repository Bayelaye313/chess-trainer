import "server-only";

/**
 * Pont entre nos lignes `reviews`/`review_logs` (voir `server/db/schema/reviews.ts`)
 * et `ts-fsrs`, la référence FSRS-5 déjà choisie (docs/02-ARCHITECTURE.md).
 * Les colonnes de `reviews` suivent déjà le modèle `Card` de `ts-fsrs` — voir
 * le docstring de `reviews.ts` — donc la conversion se limite à un renommage
 * snake_case ↔ camelCase, sans logique propre.
 *
 * Aucun accès base de données ici : chaque fonction prend l'état actuel en
 * entrée et renvoie le prochain état, sur le même principe que
 * `core/analysis/progress-insights.ts` pour son domaine. La seule différence
 * est que `ts-fsrs` n'est pas `chess.js` : ce module vit sous `server/`, pas
 * `core/`, pour respecter la règle d'architecture n°1 (`core/` ne dépend que
 * de `chess.js`) — voir la discussion dans la conversation qui a précédé ce
 * fichier.
 */
import { createEmptyCard, fsrs, Rating, type Card, type Grade, type State } from "ts-fsrs";
import type { NewReviewLog, Review } from "@/server/db/schema/reviews";

/** Vocabulaire du domaine pour les quatre réponses possibles à un puzzle. */
export type ReviewGrade = "again" | "hard" | "good" | "easy";

const GRADE_TO_RATING: Record<ReviewGrade, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

/**
 * Colonnes FSRS de `reviews`, hors `puzzleId` (propre à l'appelant). Toutes
 * requises — contrairement à `NewReview`, où les colonnes `.default(...)`
 * sont optionnelles côté insertion : ici on vient de calculer une valeur
 * concrète pour chacune, jamais question de laisser SQLite y mettre son
 * défaut.
 */
export interface ReviewCardFields {
  due: Date;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: Date | null;
}

function cardToReviewFields(card: Card): ReviewCardFields {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReview: card.last_review ?? null,
  };
}

/** Notre ligne `reviews` telle que `ts-fsrs` l'attend en entrée. */
function reviewToCard(review: Review): Card {
  return {
    due: review.due,
    stability: review.stability,
    difficulty: review.difficulty,
    // Champ déprécié côté ts-fsrs (retiré en v6) : jamais lu pour calculer le
    // prochain état, seuls `last_review`/`now` comptent. Pas de colonne dédiée
    // sur `reviews`, donc aucune information perdue à le renseigner à 0 ici.
    elapsed_days: 0,
    scheduled_days: review.scheduledDays,
    learning_steps: review.learningSteps,
    reps: review.reps,
    lapses: review.lapses,
    state: review.state as State,
    last_review: review.lastReview ?? undefined,
  };
}

/** État FSRS d'une carte neuve, au moment où un puzzle vient d'être créé. */
export function initialReviewFields(now: Date): ReviewCardFields {
  return cardToReviewFields(createEmptyCard(now));
}

export interface ScheduledReview {
  /** Prochain état de la carte — à écrire sur la ligne `reviews`. */
  card: ReviewCardFields;
  /** Entrée d'historique correspondante — à insérer dans `review_logs`. */
  log: Omit<NewReviewLog, "puzzleId" | "playedUci" | "solvedMs">;
}

/**
 * Calcule le prochain état FSRS d'une carte après une réponse du joueur
 * (Encore / Difficile / Bon / Facile).
 *
 * Pure : ne lit ni n'écrit la base — l'appelant (`spaced-repetition.ts`)
 * persiste `card` et `log` séparément, `log` ayant besoin d'être complété
 * avec `puzzleId`/`playedUci`/`solvedMs`, propres à la tentative.
 */
export function scheduleReview(review: Review, grade: ReviewGrade, now: Date): ScheduledReview {
  const { card, log } = fsrs().next(reviewToCard(review), now, GRADE_TO_RATING[grade]);

  return {
    card: cardToReviewFields(card),
    log: {
      rating: log.rating,
      state: log.state,
      due: log.due,
      stability: log.stability,
      difficulty: log.difficulty,
      elapsedDays: log.elapsed_days,
      lastElapsedDays: log.last_elapsed_days,
      scheduledDays: log.scheduled_days,
      reviewedAt: log.review,
    },
  };
}
