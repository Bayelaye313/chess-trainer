import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { applyGeometricVariant, GEOMETRIC_VARIANTS, type FenAndMoves } from "./geometric-variants";

/**
 * Rejoue une suite de coups UCI depuis une FEN et renvoie la position finale
 * — échoue (comme `chess.js`) si un coup n'est pas légal. Sert à vérifier que
 * les mutations géométriques préservent la légalité de bout en bout.
 */
function replay(fen: string, moves: readonly string[]): Chess {
  const chess = new Chess(fen);
  for (const uci of moves) {
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
    if (!move) throw new Error(`Coup illégal après mutation : ${uci} sur ${chess.fen()}`);
  }
  return chess;
}

const MATE_IN_ONE: FenAndMoves = { fen: "1k6/8/1K6/8/8/8/8/7Q w - - 0 1", moves: ["h1h8"] };
const MATE_IN_TWO: FenAndMoves = { fen: "7k/8/8/8/8/8/8/RR5K w - - 0 1", moves: ["a1a7", "h8g8", "b1b8"] };
const PIECE_WIN: FenAndMoves = { fen: "3q3k/8/8/8/8/8/8/R6K w - - 0 1", moves: ["a1a8", "h8h7"] };
const EN_PASSANT: FenAndMoves = { fen: "6k1/8/8/3pP3/8/8/8/6K1 w - d6 0 1", moves: ["e5d6"] };

describe("applyGeometricVariant", () => {
  it("identity renvoie une copie, pas l'objet d'entrée", () => {
    const result = applyGeometricVariant(MATE_IN_ONE, "identity");
    expect(result.fen).toBe(MATE_IN_ONE.fen);
    expect(result.moves).toEqual(MATE_IN_ONE.moves);
    expect(result.moves).not.toBe(MATE_IN_ONE.moves);
  });

  it.each(GEOMETRIC_VARIANTS)("garde un mat en 1 légal et matant (%s)", (variant) => {
    const mutated = applyGeometricVariant(MATE_IN_ONE, variant);
    const finalPosition = replay(mutated.fen, mutated.moves);
    expect(finalPosition.isCheckmate()).toBe(true);
  });

  it.each(GEOMETRIC_VARIANTS)("garde un mat en 2 légal et matant (%s)", (variant) => {
    const mutated = applyGeometricVariant(MATE_IN_TWO, variant);
    const finalPosition = replay(mutated.fen, mutated.moves);
    expect(finalPosition.isCheckmate()).toBe(true);
  });

  it.each(GEOMETRIC_VARIANTS)("garde une tactique de gain de pièce légale (%s)", (variant) => {
    const mutated = applyGeometricVariant(PIECE_WIN, variant);
    expect(() => replay(mutated.fen, mutated.moves)).not.toThrow();
  });

  it.each(GEOMETRIC_VARIANTS)("transforme aussi la case en passant (%s)", (variant) => {
    const mutated = applyGeometricVariant(EN_PASSANT, variant);
    expect(() => replay(mutated.fen, mutated.moves)).not.toThrow();
  });

  it("mirror-h inverse bien les fichiers (a1 -> h1)", () => {
    const mutated = applyGeometricVariant({ fen: "7k/8/8/8/8/8/8/R6K w - - 0 1", moves: ["a1a7"] }, "mirror-h");
    expect(mutated.fen.startsWith("k7")).toBe(true); // le roi noir passe de h8 à a8
    expect(mutated.moves).toEqual(["h1h7"]);
  });

  it("flip-colors inverse le trait et la casse des pièces", () => {
    const mutated = applyGeometricVariant(MATE_IN_ONE, "flip-colors");
    const turn = mutated.fen.split(" ")[1];
    expect(turn).toBe("b");
    // Le roi noir (k) d'origine devient un roi blanc (K) une fois la casse inversée.
    expect(mutated.fen).toContain("K");
  });

  it("les 4 variantes produisent 4 FEN distinctes pour une position asymétrique", () => {
    const fens = new Set(GEOMETRIC_VARIANTS.map((variant) => applyGeometricVariant(MATE_IN_TWO, variant).fen));
    expect(fens.size).toBe(4);
  });
});
