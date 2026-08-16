import { describe, expect, it } from "vitest";
import { isPuzzleWorthy, type PuzzleCandidate } from "./decks";

function move(partial: Partial<PuzzleCandidate>): PuzzleCandidate {
  return {
    quality: "best",
    mateMissed: false,
    motifs: [],
    motifFound: false,
    ...partial,
  };
}

describe("isPuzzleWorthy", () => {
  it("retient une gaffe ou une imprécision, quel que soit le contexte", () => {
    expect(isPuzzleWorthy(move({ quality: "blunder" }))).toBe(true);
    expect(isPuzzleWorthy(move({ quality: "inaccuracy" }))).toBe(true);
  });

  it("retient un mat forcé manqué même si le coup reste bien noté", () => {
    expect(isPuzzleWorthy(move({ quality: "okay", mateMissed: true }))).toBe(true);
  });

  it("retient un motif tactique manqué même sans gaffe", () => {
    expect(isPuzzleWorthy(move({ quality: "okay", motifs: ["fork"], motifFound: false }))).toBe(true);
  });

  it("ignore un motif tactique que le joueur a effectivement trouvé", () => {
    expect(isPuzzleWorthy(move({ quality: "best", motifs: ["fork"], motifFound: true }))).toBe(false);
  });

  it("ignore un coup correct, sans erreur ni occasion manquée", () => {
    expect(isPuzzleWorthy(move({ quality: "best" }))).toBe(false);
    expect(isPuzzleWorthy(move({ quality: "okay" }))).toBe(false);
    expect(isPuzzleWorthy(move({ quality: "book" }))).toBe(false);
  });
});
