import { describe, expect, it } from "vitest";
import { scheduleOpeningReview } from "./opening-repetition";

const NOW = new Date("2026-08-28T10:00:00Z");
const NEW_STATE = { attemptsCount: 0, streak: 0 };

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

describe("scheduleOpeningReview", () => {
  it("premier sans-faute : streak 1, prochaine révision dans 3 jours", () => {
    const result = scheduleOpeningReview(NEW_STATE, { correct: 8, attempted: 8 }, NOW);
    expect(result.streak).toBe(1);
    expect(result.attemptsCount).toBe(1);
    expect(result.lastAccuracy).toBe(100);
    expect(daysBetween(NOW, result.nextReviewDate)).toBe(3);
  });

  it("échec sur une carte neuve (au moins une faute) : streak reste à 0, révision demain", () => {
    const result = scheduleOpeningReview(NEW_STATE, { correct: 5, attempted: 7 }, NOW);
    expect(result.streak).toBe(0);
    expect(result.lastAccuracy).toBe(71); // 5/7 arrondi
    expect(daysBetween(NOW, result.nextReviewDate)).toBe(1);
  });

  it("enchaîne les paliers 1 → 3 → 7 → 14 → 30 jours sur des sans-faute consécutifs", () => {
    let state = { attemptsCount: 0, streak: 0 };
    const expectedDays = [3, 7, 14, 30, 30]; // streak 1..5, le dernier palier ne progresse plus au-delà de 30j
    for (const days of expectedDays) {
      const result = scheduleOpeningReview(state, { correct: 1, attempted: 1 }, NOW);
      expect(daysBetween(NOW, result.nextReviewDate)).toBe(days);
      state = { attemptsCount: result.attemptsCount, streak: result.streak };
    }
  });

  it("une faute remet le streak à 0 même après une longue série de sans-faute", () => {
    const seasoned = { attemptsCount: 12, streak: 4 };
    const result = scheduleOpeningReview(seasoned, { correct: 6, attempted: 8 }, NOW);
    expect(result.streak).toBe(0);
    expect(result.attemptsCount).toBe(13);
    expect(daysBetween(NOW, result.nextReviewDate)).toBe(1);
  });

  it("aucun coup joué (attempted 0) compte comme un échec, sans diviser par zéro", () => {
    const result = scheduleOpeningReview(NEW_STATE, { correct: 0, attempted: 0 }, NOW);
    expect(result.streak).toBe(0);
    expect(result.lastAccuracy).toBe(0);
    expect(daysBetween(NOW, result.nextReviewDate)).toBe(1);
  });

  it("incrémente toujours attemptsCount, y compris sur un échec", () => {
    const result = scheduleOpeningReview({ attemptsCount: 3, streak: 2 }, { correct: 2, attempted: 5 }, NOW);
    expect(result.attemptsCount).toBe(4);
  });
});
