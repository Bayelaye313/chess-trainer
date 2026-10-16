import { describe, expect, it } from "vitest";
import { kingInCheckSquare } from "./check";

describe("kingInCheckSquare", () => {
  it("renvoie null quand le camp au trait n'est pas en échec", () => {
    const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    expect(kingInCheckSquare(start)).toBeNull();
  });

  it("trouve le roi en échec simple", () => {
    // Dame blanche en e2 donne échec au roi noir en e8, colonne e ouverte.
    const check = "4k3/8/8/8/8/8/4Q3/4K3 b - - 0 1";
    expect(kingInCheckSquare(check)).toBe("e8");
  });

  it("trouve le roi en échec et mat", () => {
    // Mat du couloir classique.
    const mate = "6k1/6R1/6K1/8/8/8/8/8 b - - 0 1";
    expect(kingInCheckSquare(mate)).toBe("g8");
  });

  it("ne surligne jamais le roi du camp qui N'EST PAS au trait", () => {
    // Après ...Qe2+ (une dame noire imaginaire en e2), les Blancs sont en
    // échec et c'est à eux de jouer — le roi noir, lui, n'est pas menacé.
    const whiteInCheck = "4k3/8/8/8/8/8/4q3/4K3 w - - 0 1";
    expect(kingInCheckSquare(whiteInCheck)).toBe("e1");
  });
});
