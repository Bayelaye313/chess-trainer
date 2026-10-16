import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { findTrap, listTrapFamilies, listTrapGambits, OPENING_TRAPS } from "./traps";

/** Rejoue `setupMoves` depuis le début — jette si un coup est illégal (voir le docstring du fichier). */
function replaySetup(trap: (typeof OPENING_TRAPS)[number]): Chess {
  const chess = new Chess();
  for (const san of trap.setupMoves) {
    expect(() => chess.move(san), `${trap.id}: coup illégal "${san}" dans setupMoves`).not.toThrow();
  }
  return chess;
}

describe("OPENING_TRAPS", () => {
  it("a des identifiants uniques", () => {
    const ids = OPENING_TRAPS.map((trap) => trap.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("a un code ECO au format standard (une lettre A-E suivie de deux chiffres)", () => {
    for (const trap of OPENING_TRAPS) {
      expect(trap.eco, trap.id).toMatch(/^[A-E]\d\d$/);
    }
  });

  it("a au moins un coup de mise en place", () => {
    for (const trap of OPENING_TRAPS) {
      expect(trap.setupMoves.length, trap.id).toBeGreaterThan(0);
    }
  });

  it("setupMoves ne contient que des coups légalement jouables", () => {
    for (const trap of OPENING_TRAPS) replaySetup(trap);
  });

  it("c'est bien au tour de victimSide de jouer une fois setupMoves rejoué", () => {
    for (const trap of OPENING_TRAPS) {
      const chess = replaySetup(trap);
      const expectedTurn = trap.victimSide === "white" ? "w" : "b";
      expect(chess.turn(), trap.id).toBe(expectedTurn);
    }
  });

  it("trapMove est un coup légal (mais perdant) depuis la position critique", () => {
    for (const trap of OPENING_TRAPS) {
      const chess = replaySetup(trap);
      expect(() => chess.move(trap.trapMove), `${trap.id}: trapMove illégal "${trap.trapMove}"`).not.toThrow();
    }
  });

  it("refutationMoves (le script du drill) ne contient que des coups légalement jouables depuis la même position critique", () => {
    for (const trap of OPENING_TRAPS) {
      expect(trap.refutationMoves.length, trap.id).toBeGreaterThan(0);
      const chess = replaySetup(trap);
      for (const san of trap.refutationMoves) {
        expect(() => chess.move(san), `${trap.id}: coup illégal "${san}" dans refutationMoves`).not.toThrow();
      }
    }
  });

  it("le premier coup de refutationMoves n'est jamais trapMove lui-même", () => {
    for (const trap of OPENING_TRAPS) {
      expect(trap.refutationMoves[0], trap.id).not.toBe(trap.trapMove);
    }
  });

  it("a une difficulté connue", () => {
    for (const trap of OPENING_TRAPS) {
      expect(["beginner", "intermediate", "expert"], trap.id).toContain(trap.difficulty);
    }
  });

  it("a une série de gambit (`gambit`) et un commentaire conceptuel (`comments`) non vides", () => {
    for (const trap of OPENING_TRAPS) {
      expect(trap.gambit.length, trap.id).toBeGreaterThan(0);
      expect(trap.comments.length, trap.id).toBeGreaterThan(0);
    }
  });

  it("les 25 pièges du socle statique portent tous une `punishmentLine` (option Pion Poison)", () => {
    for (const trap of OPENING_TRAPS) {
      expect(trap.punishmentLine, trap.id).toBeDefined();
      expect(trap.punishmentLine!.length, trap.id).toBeGreaterThan(0);
    }
  });

  it("`punishmentLine` (option Pion Poison) ne contient que des coups légalement jouables juste après `trapMove`", () => {
    for (const trap of OPENING_TRAPS) {
      if (!trap.punishmentLine) continue;
      const chess = replaySetup(trap);
      expect(() => chess.move(trap.trapMove), `${trap.id}: trapMove illégal "${trap.trapMove}"`).not.toThrow();
      for (const san of trap.punishmentLine) {
        expect(() => chess.move(san), `${trap.id}: coup illégal "${san}" dans punishmentLine`).not.toThrow();
      }
    }
  });
});

describe("findTrap", () => {
  it("retrouve un piège par son slug", () => {
    expect(findTrap("elephant-trap")?.name).toBe("Le Piège de l'Éléphant");
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(findTrap("does-not-exist")).toBeNull();
  });
});

describe("listTrapFamilies", () => {
  it("liste chaque famille une seule fois", () => {
    const families = listTrapFamilies();
    expect(new Set(families).size).toBe(families.length);
  });

  it("n'est jamais vide", () => {
    expect(listTrapFamilies().length).toBeGreaterThan(0);
  });
});

describe("listTrapGambits", () => {
  it("liste chaque série de gambit d'une famille une seule fois", () => {
    for (const family of listTrapFamilies()) {
      const gambits = listTrapGambits(family);
      expect(new Set(gambits).size, family).toBe(gambits.length);
      expect(gambits.length, family).toBeGreaterThan(0);
    }
  });

  it("renvoie une liste vide pour une famille inconnue", () => {
    expect(listTrapGambits("does-not-exist")).toEqual([]);
  });
});
