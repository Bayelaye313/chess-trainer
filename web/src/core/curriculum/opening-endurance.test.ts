import { describe, expect, it } from "vitest";
import { buildEnduranceSessionMetrics } from "./opening-endurance";

describe("buildEnduranceSessionMetrics", () => {
  it("garde le ply de la première faute et calcule la précision comme lastAccuracy", () => {
    expect(buildEnduranceSessionMetrics({ firstMistakePly: 17, lastPly: 24, correct: 11, attempted: 13 })).toEqual({
      firstMistakePly: 17,
      lastPly: 24,
      accuracy: 85,
    });
  });

  it("une manche parfaite n'a jamais de ply de faute", () => {
    expect(buildEnduranceSessionMetrics({ firstMistakePly: null, lastPly: 20, correct: 10, attempted: 10 })).toEqual({
      firstMistakePly: null,
      lastPly: 20,
      accuracy: 100,
    });
    expect(buildEnduranceSessionMetrics({ firstMistakePly: 9, lastPly: 20, correct: 10, attempted: 10 })?.firstMistakePly).toBeNull();
  });

  it("une manche sans coup du joueur ne produit aucune session", () => {
    expect(buildEnduranceSessionMetrics({ firstMistakePly: null, lastPly: 0, correct: 0, attempted: 0 })).toBeNull();
  });
});
