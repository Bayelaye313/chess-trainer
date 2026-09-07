import { describe, expect, it } from "vitest";
import type { MoveRow } from "@/server/db/schema";
import { extendPuzzleSolution, puzzleFromMove } from "./spaced-repetition";

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
    bestPv: [],
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

describe("extendPuzzleSolution", () => {
  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("enchaîne plusieurs coups à partir de la PV moteur, pas juste la correction", () => {
    // Régression du bug utilisateur « puzzle à réviser limité à un seul
    // coup » : la PV moteur (`bestPv`) reste une ligne jouable depuis
    // `fenBefore`, contrairement à la suite RÉELLEMENT jouée dans la partie
    // (qui répondait à l'erreur, pas à la correction, et divergeait donc dès
    // le premier coup — voir le docstring de la fonction).
    const line = extendPuzzleSolution(
      move({
        fenBefore: START_FEN,
        bestUci: "e2e4",
        bestSan: "e4",
        bestPv: ["e2e4", "e7e5", "g1f3", "b8c6"],
      }),
    );
    expect(line.solution).toEqual(["e2e4", "e7e5", "g1f3", "b8c6"]);
    expect(line.solutionSan).toEqual(["e4", "e5", "Nf3", "Nc6"]);
  });

  it("plafonne à un enchaînement raisonnable même si la PV moteur est plus longue", () => {
    const line = extendPuzzleSolution(
      move({
        fenBefore: START_FEN,
        bestUci: "e2e4",
        bestSan: "e4",
        bestPv: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b5a4"],
      }),
    );
    expect(line.solution).toHaveLength(5);
    expect(line.solutionSan).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5"]);
  });

  it("s'arrête proprement dès qu'un coup de la PV n'est plus légal, sans planter", () => {
    const line = extendPuzzleSolution(
      move({
        fenBefore: START_FEN,
        bestUci: "e2e4",
        bestSan: "e4",
        // "e2e4" une seconde fois : illégal une fois le pion déjà parti d'e2.
        bestPv: ["e2e4", "e7e5", "e2e4"],
      }),
    );
    expect(line.solution).toEqual(["e2e4", "e7e5"]);
    expect(line.solutionSan).toEqual(["e4", "e5"]);
  });

  it("replie sur le seul coup connu quand aucune PV n'est disponible (parties analysées avant ce correctif)", () => {
    const line = extendPuzzleSolution(
      move({ fenBefore: START_FEN, bestUci: "e2e4", bestSan: "e4", bestPv: [] }),
    );
    expect(line.solution).toEqual(["e2e4"]);
    expect(line.solutionSan).toEqual(["e4"]);
  });

  it("renvoie une ligne vide sans coup de référence exploitable", () => {
    const line = extendPuzzleSolution(move({ bestUci: null, bestSan: null, bestPv: [] }));
    expect(line.solution).toEqual([]);
    expect(line.solutionSan).toEqual([]);
  });
});
