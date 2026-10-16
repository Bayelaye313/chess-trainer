import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { classifyWrongMove, newKingThreat } from "./coach-hints";

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

  it("repère un coup qui offre un échec qui coûte (fourchette roi + tour)", () => {
    // Kd1-c1 : le cavalier d4 n'avait aucun échec ; désormais Cb3+ attaque
    // le roi c1 ET la tour a1, et rien ne peut prendre le cavalier en b3.
    const before = new Chess("4k3/8/8/8/3n4/8/8/R2K4 w - - 0 1");
    const after = new Chess("4k3/8/8/8/3n4/8/8/R1K5 b - - 0 1");
    expect(classifyWrongMove(before, after, "w")).toBe("exposes_king");
    expect(newKingThreat(before, after, "w")).toEqual({
      kind: "fork",
      checkSan: "Nb3+",
      target: { piece: "r", square: "a1" },
      cause: { kind: "king_move" },
    });
  });

  it("ne reproche pas un échec dangereux qui existait déjà avant le coup", () => {
    // Cb3+ fourchait déjà roi c1 + tour a1 ; un coup de pion ailleurs ne change rien.
    const before = new Chess("4k3/8/8/8/3n4/8/7P/R1K5 w - - 0 1");
    const after = new Chess("4k3/8/8/8/3n3P/8/8/R1K5 b - - 0 1");
    expect(newKingThreat(before, after, "w")).toBeNull();
  });

  it("n'accuse pas le roi pour un échec « en l'air » sans conséquence", () => {
    const before = new Chess("q3k3/8/8/8/8/8/4K3/8 w - - 0 1");
    // Roi rentré en e1 : Qe8+/Qe4+ deviennent possibles, mais aucun ne mate,
    // ne prend ni ne fourche — ce n'est pas une faute de sécurité du roi.
    const after = new Chess("q3k3/8/8/8/8/8/8/4K3 b - - 0 1");
    expect(classifyWrongMove(before, after, "w")).toBe("generic");
  });

  it("retombe sur l'indice générique sans prise ni menace d'échec", () => {
    const before = new Chess("4k3/8/8/8/8/8/4K3/8 w - - 0 1");
    const after = new Chess("4k3/8/8/8/8/8/8/4K3 b - - 0 1");
    expect(classifyWrongMove(before, after, "w")).toBe("generic");
  });
});
