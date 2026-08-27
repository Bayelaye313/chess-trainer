import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { classifyWrongMove } from "./coach-hints";

describe("classifyWrongMove", () => {
  it("repère une pièce laissée en prise PAR ce coup", () => {
    // Cavalier b3, en sécurité — Tour a5 ne bat que la rangée 5 et la colonne a.
    const before = new Chess("4k3/8/8/r7/8/1N6/8/4K3 w - - 0 1");
    // Nb3-c5 : le cavalier atterrit sur la rangée 5, en prise de la tour, sans
    // aucun défenseur.
    const after = new Chess("4k3/8/8/r1N5/8/8/8/4K3 b - - 0 1");
    expect(classifyWrongMove(before, after, "w")).toBe("hangs_piece");
  });

  it("ne blâme pas un matériel déjà en prise avant le coup", () => {
    // Dame d4 déjà en prise du fou g7 (diagonale ouverte), un coup de
    // cavalier ailleurs ne change rien à cette prise préexistante.
    const before = new Chess("4k3/6b1/8/8/3Q4/8/8/4K3 w - - 0 1");
    const after = new Chess("4k3/6b1/8/8/3Q4/8/4N3/4K3 b - - 0 1");
    expect(classifyWrongMove(before, after, "w")).not.toBe("hangs_piece");
  });

  it("repère un coup qui offre un échec immédiat à l'adversaire", () => {
    const before = new Chess("q3k3/8/8/8/8/8/4K3/8 w - - 0 1");
    // Roi rentré en e1 : la dame a8 peut désormais donner échec sur la
    // colonne e (Qe8+, Qe4+…) sans qu'aucun coup blanc ne l'en empêche.
    const after = new Chess("q3k3/8/8/8/8/8/8/4K3 b - - 0 1");
    expect(classifyWrongMove(before, after, "w")).toBe("exposes_king");
  });

  it("retombe sur l'indice générique sans prise ni menace d'échec", () => {
    const before = new Chess("4k3/8/8/8/8/8/4K3/8 w - - 0 1");
    const after = new Chess("4k3/8/8/8/8/8/8/4K3 b - - 0 1");
    expect(classifyWrongMove(before, after, "w")).toBe("generic");
  });
});
