import { describe, expect, it } from "vitest";
import { findMatchingTrap } from "./opening-trap-alert";
import { OPENING_TRAPS } from "./traps";

/**
 * `findMatchingTrap` alimente la "Trap Exploration" réactive de
 * `use-opening-drill.ts#triggerTrapPunishment` — un faux positif y
 * déclencherait la démonstration de punition sur un coup parfaitement sain,
 * un faux négatif laisserait une gaffe documentée passer par le refus
 * générique (`rejectMove`) sans jamais montrer la punition. Les deux sens
 * sont donc couverts ici, pas seulement le cas nominal.
 */
describe("findMatchingTrap", () => {
  it("retrouve chacun des pièges du socle statique à sa position exacte (préfixe + trapMove)", () => {
    for (const trap of OPENING_TRAPS) {
      const found = findMatchingTrap(trap.setupMoves, trap.trapMove);
      expect(found?.id, trap.id).toBe(trap.id);
    }
  });

  it("les deux pièges de la Partie Écossaise (sprint « Scotch Traps Pipeline ») matchent bien à leur nœud documenté", () => {
    const steinitz = findMatchingTrap(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"], "Qh4");
    expect(steinitz?.id).toBe("scotch-steinitz-qh4");

    const gambitCollapse = findMatchingTrap(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Bc5", "c3"], "dxc3");
    expect(gambitCollapse?.id).toBe("scotch-gambit-dxc3-fxf7");
  });

  it("ne matche jamais un coup sain joué à la même position qu'un piège documenté", () => {
    // 4...Bc5 (Variante Classique), la suite théorique saine — jamais confondue avec 4...Qh4?!.
    expect(findMatchingTrap(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"], "Bc5")).toBeNull();
  });

  it("ne matche jamais le bon coup (`trapMove`) joué à une position différente (préfixe plus court ou plus long)", () => {
    expect(findMatchingTrap(["e4", "e5", "Nf3", "Nc6", "d4", "exd4"], "Qh4")).toBeNull();
    expect(findMatchingTrap(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5"], "Qh4")).toBeNull();
  });

  it("ne matche jamais un préfixe de la bonne longueur mais d'un chemin SAN différent", () => {
    expect(findMatchingTrap(["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5"], "Qh4")).toBeNull();
  });

  it("renvoie `null` pour une partie qui n'a jamais rejoint le début d'un piège connu", () => {
    expect(findMatchingTrap([], "e4")).toBeNull();
  });
});
