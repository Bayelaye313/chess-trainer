import { describe, expect, it } from "vitest";
import { estimatePerformanceElo } from "./performance-rating";

describe("estimatePerformanceElo", () => {
  it("retombe sur le niveau du bot sans coup analysé", () => {
    expect(estimatePerformanceElo(1500, null, null, "w")).toBe(1500);
  });

  it("reste au niveau du bot à 50% de précision, partie nulle", () => {
    expect(estimatePerformanceElo(1500, 50, "1/2-1/2", "w")).toBe(1500);
  });

  it("monte au-dessus du niveau du bot avec une grosse précision et une victoire", () => {
    const perf = estimatePerformanceElo(1500, 95, "1-0", "w");
    expect(perf).toBeGreaterThan(1500);
  });

  it("descend sous le niveau du bot avec une faible précision et une défaite", () => {
    const perf = estimatePerformanceElo(1500, 20, "0-1", "w");
    expect(perf).toBeLessThan(1500);
  });

  it("juge le résultat du point de vue du joueur, pas des Blancs", () => {
    // Le joueur a les Noirs et gagne (résultat "0-1") : bonus, pas malus.
    const asBlackWin = estimatePerformanceElo(1500, 70, "0-1", "b");
    const asBlackLoss = estimatePerformanceElo(1500, 70, "1-0", "b");
    expect(asBlackWin).toBeGreaterThan(asBlackLoss);
  });

  it("ne descend jamais sous le plancher pédagogique", () => {
    expect(estimatePerformanceElo(500, 0, "0-1", "w")).toBeGreaterThanOrEqual(400);
  });
});
