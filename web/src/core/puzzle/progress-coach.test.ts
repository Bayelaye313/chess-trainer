import { describe, expect, it } from "vitest";
import { buildProgressCoachMessage } from "./progress-coach";

describe("buildProgressCoachMessage", () => {
  it("signale une promotion imminente quand le pion du joueur atteint l'avant-dernière rangée", () => {
    const message = buildProgressCoachMessage({
      fenBefore: "4k3/8/P7/8/8/8/8/4K3 w - - 0 1",
      fenAfter: "4k3/P7/8/8/8/8/8/4K3 b - - 0 1",
      lastMoveUci: "a6a7",
      playerColor: "w",
      movesRemaining: 1,
    });
    expect(message).toContain("promotion");
  });

  it("signale l'ouverture d'une colonne pour une pièce lourde déjà en place", () => {
    const message = buildProgressCoachMessage({
      fenBefore: "4k3/8/8/4p3/3P4/8/8/3RK3 w - - 0 1",
      fenAfter: "4k3/8/8/4P3/8/8/8/3RK3 b - - 0 1",
      lastMoveUci: "d4e5",
      playerColor: "w",
      movesRemaining: 2,
    });
    expect(message).toContain("colonne");
  });

  it("signale un gain de matériel net apporté par ce coup", () => {
    // Un pion noir supplémentaire (h7) évite que la position ne tombe dans le
    // cas particulier « matériel insuffisant pour mater » une fois la tour
    // noire capturée — sans lui, `chess.isDraw()` court-circuiterait le test.
    const message = buildProgressCoachMessage({
      fenBefore: "4k3/7p/4r3/8/2B5/8/8/4K3 w - - 0 1",
      fenAfter: "4k3/7p/4B3/8/8/8/8/4K3 b - - 0 1",
      lastMoveUci: "c4e6",
      playerColor: "w",
      movesRemaining: 0,
    });
    expect(message).toContain("gagn");
  });

  it("signale l'objectif de nulle atteint (pat)", () => {
    const message = buildProgressCoachMessage({
      fenBefore: "k7/8/8/8/8/1Q6/8/7K w - - 0 1",
      fenAfter: "k7/8/1Q6/8/8/8/8/7K b - - 0 1",
      lastMoveUci: "b3b6",
      playerColor: "w",
      movesRemaining: 0,
    });
    expect(message).toContain("nulle");
  });

  it("retombe sur un encouragement générique qui mentionne les plis restants", () => {
    const message = buildProgressCoachMessage({
      fenBefore: "4k3/8/8/8/8/8/8/4K2R w - - 0 1",
      fenAfter: "4k3/8/8/8/8/8/7R/4K3 b - - 0 1",
      lastMoveUci: "h1h2",
      playerColor: "w",
      movesRemaining: 3,
    });
    expect(message).toContain("3");
  });

  it("ne dit rien de plus quand ce coup vient de faire mat (le statut standard suffit)", () => {
    // Mat du couloir : tour blanche d8 (hors de portée du roi), roi noir g8 muré par ses propres pions.
    const message = buildProgressCoachMessage({
      fenBefore: "6k1/5ppp/8/8/8/8/8/3R1K2 w - - 0 1",
      fenAfter: "3R2k1/5ppp/8/8/8/8/8/5K2 b - - 0 1",
      lastMoveUci: "d1d8",
      playerColor: "w",
      movesRemaining: 0,
    });
    expect(message).toBeNull();
  });
});
