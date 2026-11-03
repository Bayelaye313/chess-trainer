import { describe, expect, it } from "vitest";
import { analyseSkeleton, scoreSkeleton } from "./skeleton";

describe("squelette du pattern", () => {
  it("mat du couloir : le roi exposé est une case cœur, la case de la solution n'est jamais révélée", () => {
    // Blancs : Td1, roi g1 ; Noirs : roi g8 derrière f7-g7-h7. 1. Td8#
    const fen = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
    const s = analyseSkeleton(fen, ["d1d8"]);
    expect(s.core).toContain("g8");
    expect(s.squares.find((x) => x.case === "g8")?.type).toBe("roi_expose");
    expect(s.squares.some((x) => x.case === "d1" || x.case === "d8")).toBe(false);
  });

  it("une pièce capturée par la solution est une cible cœur", () => {
    // La dame noire en d5 n'est pas défendue ; 1. Rxd5.
    const fen = "4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1";
    const s = analyseSkeleton(fen, ["d1d5"]);
    expect(s.core).toEqual(["d5"]);
    expect(s.squares.find((x) => x.case === "d5")?.type).toBe("non_defendue");
  });

  it("note : au moins une case cœur ET une précision d'au moins 50 %", () => {
    const squares = [
      { case: "g8", type: "roi_expose" as const },
      { case: "e5", type: "non_defendue" as const },
    ];
    expect(scoreSkeleton(squares, ["g8"], ["g8"]).ok).toBe(true);
    expect(scoreSkeleton(squares, ["g8"], ["e5"]).ok).toBe(false); // pas de case cœur
    expect(scoreSkeleton(squares, ["g8"], ["g8", "a1", "a2"]).ok).toBe(false); // tout l'échiquier ne passe pas
    expect(scoreSkeleton(squares, ["g8"], []).ok).toBe(false);
  });
});

describe("squelette en finale de pions", () => {
  it("n'est jamais vide : pions passés et pions adverses sans protection de pion", () => {
    // Finale tirée du puzzle Lichess 2d82g : 56... Ka4 57. Kd2 Kb3.
    const fen = "8/8/8/kpp3p1/3p1pPp/P2P1P1P/1PK5/8 b - - 1 56";
    const s = analyseSkeleton(fen, ["a5a4", "c2d2", "a4b3"]);
    expect(s.core.length).toBeGreaterThan(0);
    expect(s.squares.some((x) => x.type === "non_defendue" && x.case === "d3")).toBe(true);
  });
});
