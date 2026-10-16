import { describe, expect, it } from "vitest";
import { solutionMoveQuality } from "./solution-quality";

describe("solutionMoveQuality", () => {
  it("marque « brilliant » un coup de solution qui sacrifie une pièce (Bxh7+, fou non défendu)", () => {
    const fen = "r1bq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB4/PPP2PPP/R1BQK1NR w KQ - 0 1";
    expect(solutionMoveQuality(fen, "d3h7")).toBe("brilliant");
  });

  it("garde « best » pour un coup sans don de matériel", () => {
    expect(solutionMoveQuality("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "e2e4")).toBe("best");
  });

  it("retombe sur « best » pour un coup illégal plutôt que de lever une erreur", () => {
    expect(solutionMoveQuality("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "e2e5")).toBe("best");
  });
});
