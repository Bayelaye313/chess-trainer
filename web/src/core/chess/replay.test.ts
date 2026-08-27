import { describe, expect, it } from "vitest";
import { replayPlies, uciSequenceToSan } from "./replay";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("uciSequenceToSan", () => {
  it("rejoue une suite UCI et renvoie le SAN de chaque coup", () => {
    expect(uciSequenceToSan(START_FEN, ["e2e4", "e7e5", "g1f3"])).toEqual(["e4", "e5", "Nf3"]);
  });
});

describe("replayPlies", () => {
  it("renvoie SAN et FEN avant/après pour chaque pli", () => {
    const plies = replayPlies(START_FEN, ["e2e4", "e7e5"]);
    expect(plies).toHaveLength(2);

    expect(plies[0].uci).toBe("e2e4");
    expect(plies[0].san).toBe("e4");
    expect(plies[0].fenBefore).toBe(START_FEN);
    expect(plies[0].fenAfter).toContain(" b ");

    // Le "après" d'un pli EST le "avant" du suivant — pas de trou ni de saut.
    expect(plies[1].fenBefore).toBe(plies[0].fenAfter);
    expect(plies[1].uci).toBe("e7e5");
    expect(plies[1].san).toBe("e5");
  });

  it("suite vide → aucun pli", () => {
    expect(replayPlies(START_FEN, [])).toEqual([]);
  });

  it("gère la promotion (UCI à 5 caractères)", () => {
    // Pion blanc en g7, prêt à promouvoir en dame sur g8 (roi noir écarté en a8).
    const fen = "k7/6P1/8/8/8/8/8/6K1 w - - 0 1";
    const [ply] = replayPlies(fen, ["g7g8q"]);
    expect(ply.san).toBe("g8=Q+");
  });
});
