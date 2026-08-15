import { describe, expect, it } from "vitest";
import { findBookMove } from "./openings";

describe("findBookMove", () => {
  it("reconnaît la position après 1.e4 comme théorique", () => {
    const afterE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    const match = findBookMove(afterE4);
    expect(match).not.toBeNull();
    expect(match?.eco).toMatch(/^[A-E]\d\d$/);
  });

  it("sort de la théorie en profondeur de partie", () => {
    // Position quelconque, très en aval d'une ligne réelle — n'a aucune raison
    // d'être cataloguée telle quelle.
    const deepMiddlegame =
      "r2qk2r/ppp2ppp/2n1bn2/3p4/3P4/2N1BN2/PPP2PPP/R2QK2R w KQkq - 4 9";
    expect(findBookMove(deepMiddlegame)).toBeNull();
  });
});
