import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
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

describe("findOpening", () => {
  it("retrouve une ouverture par son slug", () => {
    expect(findOpening("ruy-lopez")?.name).toBe("Ruy Lopez (Espagnole)");
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(findOpening("does-not-exist")).toBeNull();
  });
});
