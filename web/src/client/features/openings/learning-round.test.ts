import { describe, expect, it } from "vitest";
import { nextLearningRoundOutcome } from "./learning-round";

describe("nextLearningRoundOutcome", () => {
  it("la Manche 1 débouche TOUJOURS sur la Manche 2, même sans aucune faute", () => {
    const outcome = nextLearningRoundOutcome(1, { correct: 10, attempted: 10 });
    expect(outcome).toEqual({ shouldRestart: true, nextRound: 2 });
  });

  it("la Manche 1 débouche sur la Manche 2 même avec des fautes", () => {
    const outcome = nextLearningRoundOutcome(1, { correct: 7, attempted: 10 });
    expect(outcome).toEqual({ shouldRestart: true, nextRound: 2 });
  });

  it("une Manche 2 sans AUCUNE faute termine vraiment le drill", () => {
    const outcome = nextLearningRoundOutcome(2, { correct: 8, attempted: 8 });
    expect(outcome).toEqual({ shouldRestart: false, nextRound: 2 });
  });

  it("la moindre faute en Manche 2 la fait recommencer, jamais ne termine le drill", () => {
    const outcome = nextLearningRoundOutcome(2, { correct: 7, attempted: 8 });
    expect(outcome).toEqual({ shouldRestart: true, nextRound: 2 });
  });

  it("relance une Manche 2 vide quand un coup joueur était attendu", () => {
    const outcome = nextLearningRoundOutcome(2, { correct: 0, attempted: 0 }, true);
    expect(outcome).toEqual({ shouldRestart: true, nextRound: 2 });
  });

  it("termine une Manche 2 sans coup joueur à jouer au lieu de boucler", () => {
    const outcome = nextLearningRoundOutcome(2, { correct: 0, attempted: 0 }, false);
    expect(outcome).toEqual({ shouldRestart: false, nextRound: 2 });
  });
});
