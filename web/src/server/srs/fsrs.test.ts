import { describe, expect, it } from "vitest";
import type { Review } from "@/server/db/schema/reviews";
import { initialReviewFields, scheduleReview } from "./fsrs";

const NOW = new Date("2026-08-14T10:00:00Z");

function reviewFrom(fields: ReturnType<typeof initialReviewFields>): Review {
  return { puzzleId: "p1", ...fields };
}

describe("initialReviewFields", () => {
  it("crée une carte neuve à l'état New, due immédiatement", () => {
    const fields = initialReviewFields(NOW);
    expect(fields.state).toBe(0); // New
    expect(fields.reps).toBe(0);
    expect(fields.lapses).toBe(0);
    expect(fields.lastReview).toBeNull();
    expect(fields.due.getTime()).toBeLessThanOrEqual(NOW.getTime());
  });
});

describe("scheduleReview", () => {
  it("répond « Facile » sur une carte neuve : passe en révision, échéance repoussée", () => {
    const review = reviewFrom(initialReviewFields(NOW));
    const { card, log } = scheduleReview(review, "easy", NOW);

    expect(card.state).toBe(2); // Review — Easy saute l'apprentissage
    expect(card.reps).toBe(1);
    expect(card.lapses).toBe(0);
    expect(card.due.getTime()).toBeGreaterThan(NOW.getTime());
    expect(card.lastReview?.getTime()).toBe(NOW.getTime());
    expect(log.rating).toBe(4); // Rating.Easy
    expect(log.reviewedAt.getTime()).toBe(NOW.getTime());
  });

  it("répond « Encore » : incrémente les lapses dès qu'une carte déjà apprise est oubliée", () => {
    const learned = reviewFrom(initialReviewFields(NOW));
    const afterEasy = scheduleReview(learned, "easy", NOW).card;
    const reviewed = reviewFrom(afterEasy);

    const later = new Date(afterEasy.due.getTime() + 24 * 60 * 60 * 1000);
    const { card } = scheduleReview(reviewed, "again", later);

    expect(card.lapses).toBe(1);
    expect(card.state).toBe(3); // Relearning
  });

  it("conserve le nombre de répétitions déjà accumulé sur la carte", () => {
    const review: Review = {
      puzzleId: "p1",
      due: NOW,
      stability: 5,
      difficulty: 4,
      scheduledDays: 3,
      learningSteps: 0,
      reps: 7,
      lapses: 1,
      state: 2, // Review
      lastReview: new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000),
    };

    const { card } = scheduleReview(review, "good", NOW);
    expect(card.reps).toBe(8);
    expect(card.lapses).toBe(1);
  });
});
