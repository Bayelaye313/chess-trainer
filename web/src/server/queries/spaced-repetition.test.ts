import { describe, expect, it } from "vitest";
import type { MoveRow } from "@/server/db/schema";
import { puzzleFromMove } from "./spaced-repetition";

const NOW = new Date("2026-08-14T10:00:00Z");

/** Coup minimal, valeurs neutres — chaque test ne précise que ce qui compte. */
function move(partial: Partial<MoveRow>): MoveRow {
  return {
    id: 1,
    gameId: "game-1",
    ply: 12,
    side: "w",
    byPlayer: true,
    uci: "e2e4",
    san: "e4",
    fenBefore: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
    cpBefore: null,
    mateBefore: null,
    cpAfter: null,
    mateAfter: null,
    cpLoss: null,
    quality: "best",
    phase: "middlegame",
    bestUci: "e2e4",
    bestSan: "e4",
    mateMissed: false,
    motifs: [],
    motifFound: false,
    clockMs: null,
    thinkSeconds: null,
    ...partial,
  };
}

describe("puzzleFromMove", () => {
  it("crée un puzzle à partir d'une gaffe, rangé dans le bon deck", () => {
    const puzzle = puzzleFromMove(
      move({ quality: "blunder", phase: "middlegame", uci: "d1d5", bestUci: "g1f3", bestSan: "Nf3" }),
      NOW,
    );

    expect(puzzle).not.toBeNull();
    expect(puzzle?.deck).toBe("positional_mistakes");
    expect(puzzle?.solution).toEqual(["g1f3"]);
    expect(puzzle?.solutionSan).toEqual(["Nf3"]);
    expect(puzzle?.playedUci).toBe("d1d5");
    expect(puzzle?.source).toBe("local");
    expect(puzzle?.moveId).toBe(1);
    expect(puzzle?.createdAt).toBe(NOW);
  });

  it("range un mat manqué dans le deck des mats manqués, même sans gaffe", () => {
    const puzzle = puzzleFromMove(move({ quality: "okay", mateMissed: true }), NOW);
    expect(puzzle?.deck).toBe("missed_checkmates");
  });

  it("range une tactique manquée en ouverture dans le deck d'ouverture, pas celui des tactiques", () => {
    // categorizeDeck priorise la phase avant le motif tactique — même règle
    // qu'à l'analyse (evaluate-move.ts), non dupliquée ici.
    const puzzle = puzzleFromMove(
      move({ quality: "okay", phase: "opening", motifs: ["fork"], motifFound: false }),
      NOW,
    );
    expect(puzzle?.deck).toBe("opening_mistakes");
  });

  it("ignore un coup correct qui ne remplit aucun critère", () => {
    expect(puzzleFromMove(move({ quality: "best" }), NOW)).toBeNull();
  });

  it("ignore une gaffe sans coup de référence exploitable", () => {
    expect(puzzleFromMove(move({ quality: "blunder", bestUci: null, bestSan: null }), NOW)).toBeNull();
  });

  it("attribue un identifiant différent à chaque puzzle", () => {
    const a = puzzleFromMove(move({ quality: "blunder" }), NOW);
    const b = puzzleFromMove(move({ quality: "blunder", id: 2 }), NOW);
    expect(a?.id).not.toBe(b?.id);
  });
});
