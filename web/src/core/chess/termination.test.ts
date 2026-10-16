import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { gameOutcome } from "./termination";

describe("gameOutcome", () => {
  it("renvoie null tant que la partie continue", () => {
    expect(gameOutcome(new Chess())).toBeNull();
  });

  it("attribue la victoire au camp qui n'est pas maté", () => {
    // Mat du berger : les Blancs matent, trait aux Noirs.
    const chess = new Chess();
    for (const san of ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"]) {
      chess.move(san);
    }
    expect(gameOutcome(chess)).toEqual({ result: "1-0", termination: "checkmate" });
  });

  it("détecte le pat", () => {
    const chess = new Chess("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
    expect(gameOutcome(chess)).toEqual({ result: "1/2-1/2", termination: "stalemate" });
  });

  it("détecte le matériel insuffisant", () => {
    const chess = new Chess("8/8/8/4k3/8/8/8/4K3 w - - 0 1");
    expect(gameOutcome(chess)).toEqual({
      result: "1/2-1/2",
      termination: "insufficient_material",
    });
  });
});
