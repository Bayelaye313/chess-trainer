import { describe, expect, it } from "vitest";
import { computeSecondBestGap } from "./critical-gap";

describe("computeSecondBestGap", () => {
  it("renvoie null sans second choix moteur", () => {
    expect(computeSecondBestGap({ cp: 30, mate: null }, null, true)).toBeNull();
  });

  it("mesure un écart nul quand les deux choix se valent", () => {
    expect(computeSecondBestGap({ cp: 30, mate: null }, { cp: 25, mate: null }, true)).toBeCloseTo(0, 0);
  });

  it("mesure un gros écart (%) quand le second choix perd la partie", () => {
    const gap = computeSecondBestGap({ cp: 30, mate: null }, { cp: -500, mate: null }, true);
    expect(gap).not.toBeNull();
    expect(gap!).toBeGreaterThan(CRITICAL_LIKE_GAP);
  });

  it("bascule le point de vue pour les Noirs — un meilleur coup blanc élevé n'aide pas les Noirs", () => {
    // POV Noirs : le meilleur choix (cp 30 POV Blancs, mauvais pour les Noirs)
    // est en réalité PIRE que le second (cp -500 POV Blancs, excellent pour
    // les Noirs) — l'écart doit être clampé à 0, jamais négatif.
    const gap = computeSecondBestGap({ cp: 30, mate: null }, { cp: -500, mate: null }, false);
    expect(gap).toBe(0);
  });

  it("gère un mat annoncé comme meilleur coup", () => {
    const gap = computeSecondBestGap({ cp: null, mate: 3 }, { cp: 50, mate: null }, true);
    expect(gap).not.toBeNull();
    expect(gap!).toBeGreaterThan(CRITICAL_LIKE_GAP);
  });
});

/** Repère lisible pour les assertions "gros écart" ci-dessus (voir CRITICAL_GAP_THRESHOLD dans classify.ts). */
const CRITICAL_LIKE_GAP = 10;
