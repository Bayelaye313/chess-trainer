import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { GEOMETRIC_VARIANTS, applyGeometricVariant } from "@/core/chess/geometric-variants";
import { FALLBACK_PUZZLE_BANK, LOCAL_PUZZLE_BANK, resolveLocalPuzzle } from "./local-puzzle-bank";

/** Rejoue une suite UCI depuis une FEN — lève si un coup n'est pas légal. */
function replay(fen: string, moves: readonly string[]): Chess {
  const chess = new Chess(fen);
  for (const uci of moves) {
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
    if (!move) throw new Error(`Coup illégal : ${uci} sur ${chess.fen()}`);
  }
  return chess;
}

const ALL_BANKS: Record<string, readonly { fen: string; moves: string[]; baseRating: number }[]> = {
  ...LOCAL_PUZZLE_BANK,
  FALLBACK_PUZZLE_BANK,
};

describe("LOCAL_PUZZLE_BANK / FALLBACK_PUZZLE_BANK", () => {
  for (const [tag, bank] of Object.entries(ALL_BANKS)) {
    for (const [index, seed] of bank.entries()) {
      it(`${tag}[${index}] est une position légale dont la suite de coups est jouable`, () => {
        expect(() => replay(seed.fen, seed.moves)).not.toThrow();
      });

      for (const variant of GEOMETRIC_VARIANTS) {
        it(`${tag}[${index}] reste légale après la variante géométrique "${variant}"`, () => {
          const mutated = applyGeometricVariant(seed, variant);
          expect(() => replay(mutated.fen, mutated.moves)).not.toThrow();
        });
      }
    }
  }
});

describe("FALLBACK_PUZZLE_BANK", () => {
  it("contient au moins 5 positions radicalement différentes", () => {
    expect(FALLBACK_PUZZLE_BANK.length).toBeGreaterThanOrEqual(5);
    const boards = new Set(FALLBACK_PUZZLE_BANK.map((seed) => seed.fen.split(" ")[0]));
    expect(boards.size).toBe(FALLBACK_PUZZLE_BANK.length);
  });

  it("mélange mats en 1, mats en 2 et tactiques de gain de pièce", () => {
    const outcomes = FALLBACK_PUZZLE_BANK.map((seed) => {
      const finalPosition = replay(seed.fen, seed.moves);
      return { isMate: finalPosition.isCheckmate(), moveCount: seed.moves.length };
    });
    const mateInOne = outcomes.filter((o) => o.isMate && o.moveCount === 1).length;
    const mateInTwoPlus = outcomes.filter((o) => o.isMate && o.moveCount > 1).length;
    const pieceWins = outcomes.filter((o) => !o.isMate).length;
    expect(mateInOne).toBeGreaterThanOrEqual(1);
    expect(mateInTwoPlus).toBeGreaterThanOrEqual(1);
    expect(pieceWins).toBeGreaterThanOrEqual(1);
  });
});

describe("resolveLocalPuzzle", () => {
  it("fait défiler les positions distinctes avant de répéter", () => {
    const seen = new Set<string>();
    for (let index = 0; index < FALLBACK_PUZZLE_BANK.length; index += 1) {
      seen.add(resolveLocalPuzzle(FALLBACK_PUZZLE_BANK, index).fen);
    }
    expect(seen.size).toBe(FALLBACK_PUZZLE_BANK.length);
  });

  it("fait défiler jusqu'à 24 déclinaisons distinctes pour une banque de 6 positions avant tout doublon exact", () => {
    const seen = new Set<string>();
    for (let index = 0; index < 24; index += 1) {
      seen.add(resolveLocalPuzzle(FALLBACK_PUZZLE_BANK, index).fen);
    }
    expect(seen.size).toBe(24);
    // La 25e déclinaison revient forcément sur la 1re combinaison (position, variante).
    expect(resolveLocalPuzzle(FALLBACK_PUZZLE_BANK, 24).fen).toBe(resolveLocalPuzzle(FALLBACK_PUZZLE_BANK, 0).fen);
  });

  it("donne 4 orientations différentes même pour une banque à une seule position", () => {
    const singleSeedBank = LOCAL_PUZZLE_BANK.fork;
    const seen = new Set<string>();
    for (let index = 0; index < 4; index += 1) {
      seen.add(resolveLocalPuzzle(singleSeedBank, index).fen);
    }
    expect(seen.size).toBe(4);
  });

  it("est pure : n'altère jamais les seeds d'entrée", () => {
    const snapshot = JSON.stringify(FALLBACK_PUZZLE_BANK);
    resolveLocalPuzzle(FALLBACK_PUZZLE_BANK, 3);
    resolveLocalPuzzle(FALLBACK_PUZZLE_BANK, 17);
    expect(JSON.stringify(FALLBACK_PUZZLE_BANK)).toBe(snapshot);
  });
});
