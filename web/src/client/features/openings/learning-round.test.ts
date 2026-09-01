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

  it("une Manche 2 où rien n'a été joué (attempted: 0) compte comme un échec, pas un sans-faute", () => {
    const outcome = nextLearningRoundOutcome(2, { correct: 0, attempted: 0 });
    expect(outcome).toEqual({ shouldRestart: true, nextRound: 2 });
  });
});
