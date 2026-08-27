import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { TACTICAL_SIGNALS, describeTacticalSignals, isRelativelyPinned } from "./tactical-signals";

describe("clouage absolu contre clouage relatif", () => {
  it("distingue le clouage devant le roi de celui devant une pièce plus chère", () => {
    // Fb5 : le cavalier c6 écrante SON ROI en e8 — bouger est illégal.
    const absolute = describeTacticalSignals(
      "r1b1kb1r/ppp2ppp/2n5/4p3/4P3/8/PPP2PPP/RNBQKB1R w KQkq - 0 1",
      ["f1b5"],
    );
    expect(absolute).toContain("absolute_pin");
    expect(absolute).not.toContain("relative_pin");

    // Fg5 : le cavalier f6 écrante la DAME d8 — bouger est légal, mais coûteux.
    const relative = describeTacticalSignals(
      "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1",
      ["c1g5"],
    );
    expect(relative).toContain("relative_pin");
    expect(relative).not.toContain("absolute_pin");
  });

  it("ne compte jamais deux fois le même clouage", () => {
    const board = new Chess("r1b1kb1r/ppp2ppp/2n5/1B2p3/4P3/8/PPP2PPP/RNBQK1NR b KQkq - 0 1");
    // Cloué devant le roi : absolu, donc surtout PAS relatif.
    expect(isRelativelyPinned(board, "b", "c6")).toBe(false);
  });
});

describe("nature du premier coup", () => {
  it("sépare le coup tranquille de l'échec et de la prise", () => {
    const quiet = describeTacticalSignals(
      "rnb1kb1r/pppp1ppp/5n2/4p3/4P3/3P4/PPP2PPP/RNBQKB1R w KQkq - 0 1",
      ["c1g5"],
    );
    expect(quiet).toContain("quiet_first");
    expect(quiet).not.toContain("check_first");
    expect(quiet).not.toContain("capture_first");
  });

  it("reconnaît le sacrifice grec Fxh7+ et le classe comme sacrifice", () => {
    const signals = describeTacticalSignals(
      "r1bq1rk1/pppnbppp/4p3/3pP3/3P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 0 1",
      ["d3h7", "g8h7", "f3g5", "h7g8", "d1h5"],
    );
    expect(signals).toEqual(expect.arrayContaining(["check_first", "capture_first", "sacrifice_first", "greek_gift"]));
  });
});

describe("promotions et prise en passant", () => {
  it("distingue la sous-promotion de la promotion en dame", () => {
    const under = describeTacticalSignals("8/5P2/8/8/8/6k1/8/6K1 w - - 0 1", ["f7f8n"]);
    expect(under).toEqual(expect.arrayContaining(["promotion", "under_promotion"]));

    const queen = describeTacticalSignals("8/5P2/8/8/8/6k1/8/6K1 w - - 0 1", ["f7f8q"]);
    expect(queen).toContain("promotion");
    expect(queen).not.toContain("under_promotion");
  });

  it("reconnaît une prise en passant dans la solution", () => {
    const signals = describeTacticalSignals("6k1/8/8/3pP3/8/8/8/6K1 w - d6 0 1", ["e5d6"]);
    expect(signals).toContain("en_passant");
  });
});

describe("séries forcées", () => {
  it("reconnaît un échec perpétuel : que des échecs, et pas de mat au bout", () => {
    const signals = describeTacticalSignals(
      "6k1/5p1p/8/8/8/8/8/3Q2K1 w - - 0 1",
      ["d1d8", "g8g7", "d8d4", "g7g8", "d4d8", "g8g7"],
    );
    expect(signals).toContain("perpetual_check");
  });

  it("ne prend pas une suite d'échecs qui mate pour un perpétuel", () => {
    const signals = describeTacticalSignals("R6k/1R6/8/8/8/8/8/6K1 w - - 0 1", ["b7b8"]);
    expect(signals).not.toContain("perpetual_check");
  });
});

describe("robustesse", () => {
  it("ne prétend rien d'une solution qu'il n'a pas pu rejouer", () => {
    // Coup illégal dans cette position : aucun signal ne doit être affirmé.
    expect(describeTacticalSignals("6k1/8/8/8/8/8/8/6K1 w - - 0 1", ["e2e4"])).toEqual([]);
    expect(describeTacticalSignals("pas une fen", ["e2e4"])).toEqual([]);
    expect(describeTacticalSignals("6k1/8/8/8/8/8/8/6K1 w - - 0 1", [])).toEqual([]);
  });

  it("renvoie les signaux dans l'ordre déclaré, sans doublon", () => {
    const signals = describeTacticalSignals(
      "r1bq1rk1/pppnbppp/4p3/3pP3/3P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 0 1",
      ["d3h7", "g8h7", "f3g5", "h7g8", "d1h5"],
    );
    expect(new Set(signals).size).toBe(signals.length);
    const order = signals.map((signal) => TACTICAL_SIGNALS.indexOf(signal));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
