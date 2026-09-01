import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { mainLine, parsePgnTree } from "../chess/pgn-tree";
import { findOpening, OPENINGS } from "./openings";

describe("OPENINGS", () => {
  it("a des identifiants uniques", () => {
    const ids = OPENINGS.map((opening) => opening.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("n'a que des lignes de coups légalement jouables", () => {
    for (const opening of OPENINGS) {
      const chess = new Chess();
      for (const san of opening.moves) {
        expect(() => chess.move(san), `${opening.id}: coup illégal "${san}"`).not.toThrow();
      }
    }
  });

  it("a au moins un coup par ligne", () => {
    for (const opening of OPENINGS) {
      expect(opening.moves.length, opening.id).toBeGreaterThan(0);
    }
  });

  it("a un code ECO au format standard (une lettre A-E suivie de deux chiffres)", () => {
    for (const opening of OPENINGS) {
      expect(opening.eco, opening.id).toMatch(/^[A-E]\d\d$/);
    }
  });
});

describe("OPENINGS avec arbre PGN enrichi", () => {
  const withPgn = OPENINGS.filter((opening) => opening.pgn);

  it("en enrichit au moins une poignée (pas une régression silencieuse vers 0)", () => {
    expect(withPgn.length).toBeGreaterThanOrEqual(5);
  });

  it("parse sans erreur, et sa ligne principale préfixe exactement `moves`", () => {
    for (const opening of withPgn) {
      const tree = parsePgnTree(opening.pgn!);
      const line = mainLine(tree).slice(0, opening.moves.length).map((n) => n.san);
      expect(line, opening.id).toEqual(opening.moves);
    }
  });

  it("contient réellement au moins un embranchement (plus d'un enfant quelque part)", () => {
    for (const opening of withPgn) {
      const tree = parsePgnTree(opening.pgn!);
      let hasBranch = false;
      const stack = [tree];
      while (stack.length > 0) {
        const node = stack.pop()!;
        if (node.children.length > 1) hasBranch = true;
        stack.push(...node.children);
      }
      expect(hasBranch, opening.id).toBe(true);
    }
  });
});

describe("findOpening", () => {
  it("retrouve une ouverture par son slug", () => {
    expect(findOpening("ruy-lopez")?.name).toBe("Ruy Lopez (Espagnole)");
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(findOpening("does-not-exist")).toBeNull();
  });
});
