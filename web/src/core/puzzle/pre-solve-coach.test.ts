import { describe, expect, it } from "vitest";
import { buildPreSolveCoachMessage } from "./pre-solve-coach";

describe("buildPreSolveCoachMessage", () => {
  it("nomme le coup adverse et invite à jouer, sans motif ni suite connus", () => {
    const message = buildPreSolveCoachMessage({ setupSan: "Bxf7+", motifs: [], playerMoveCount: 1 });
    expect(message).toBe("L'adversaire vient de jouer Bxf7+. Trouve le meilleur coup.");
  });

  it("reste utile sans coup adverse connu (puzzle importé sans historique)", () => {
    const message = buildPreSolveCoachMessage({ setupSan: null, motifs: [], playerMoveCount: 1 });
    expect(message).toBe("Trouve le meilleur coup.");
  });

  it("nomme le motif quand il est connu, plutôt que l'invite générique", () => {
    const message = buildPreSolveCoachMessage({ setupSan: "Nc3", motifs: ["fork"], playerMoveCount: 1 });
    expect(message).toBe("L'adversaire vient de jouer Nc3. Cherche une fourchette.");
  });

  it("cumule plusieurs motifs", () => {
    const message = buildPreSolveCoachMessage({ setupSan: null, motifs: ["pin", "skewer"], playerMoveCount: 1 });
    expect(message).toBe("Cherche un clouage et une enfilade.");
  });

  it("signale une suite à enchaîner au-delà d'un coup", () => {
    const message = buildPreSolveCoachMessage({ setupSan: null, motifs: [], playerMoveCount: 3 });
    expect(message).toBe("Trouve la suite gagnante. (3 coups à enchaîner.)");
  });

  it("cumule coup adverse, motif et suite", () => {
    const message = buildPreSolveCoachMessage({ setupSan: "Qxd5", motifs: ["hanging_piece"], playerMoveCount: 2 });
    expect(message).toBe("L'adversaire vient de jouer Qxd5. Cherche une pièce en prise. (2 coups à enchaîner.)");
  });
});
