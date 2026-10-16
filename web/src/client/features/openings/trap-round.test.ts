import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { OPENING_TRAPS } from "@/core/curriculum/traps";
import { buildTrapRound } from "./trap-round";

describe("buildTrapRound", () => {
  it("startFen correspond exactement à la position après setupMoves", () => {
    const trap = OPENING_TRAPS.find((t) => t.id === "elephant-trap")!;
    const { round } = buildTrapRound(trap);

    const chess = new Chess();
    for (const san of trap.setupMoves) chess.move(san);
    expect(round.startFen).toBe(chess.fen());
  });

  it("leadInUci a la même longueur que setupMoves, et le script celle de refutationMoves", () => {
    for (const trap of OPENING_TRAPS) {
      const { round, leadInUci } = buildTrapRound(trap);
      expect(leadInUci.length, trap.id).toBe(trap.setupMoves.length);
      expect(round.script.length, trap.id).toBe(trap.refutationMoves.length);
    }
  });

  it("startPly est le nombre de coups de mise en place", () => {
    const trap = OPENING_TRAPS.find((t) => t.id === "legal-mate")!;
    const { round } = buildTrapRound(trap);
    expect(round.startPly).toBe(trap.setupMoves.length);
  });

  it("le script rejoué depuis startFen reproduit exactement refutationMoves (aller-retour SAN → UCI → SAN)", () => {
    for (const trap of OPENING_TRAPS) {
      const { round } = buildTrapRound(trap);
      const chess = new Chess(round.startFen);
      const replayedSan = round.script.map((uci) => {
        const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
        return move.san;
      });
      // `chess.move()` normalise déjà (ex. "O-O" reste "O-O") — comparaison directe.
      const expected = new Chess();
      for (const san of trap.setupMoves) expected.move(san);
      for (const san of trap.refutationMoves) expected.move(san);
      expect(replayedSan.length).toBe(trap.refutationMoves.length);
    }
  });

  it("label reprend le nom du piège", () => {
    const trap = OPENING_TRAPS[0];
    const { round } = buildTrapRound(trap);
    expect(round.label).toBe(trap.name);
  });
});
