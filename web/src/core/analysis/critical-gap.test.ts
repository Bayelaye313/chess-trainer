import { describe, expect, it } from "vitest";
import { computeSecondBestGap, secondBestAllowsImmediateMate, secondBestWinPercent } from "./critical-gap";

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

describe("secondBestWinPercent", () => {
  it("renvoie null sans second choix moteur", () => {
    expect(secondBestWinPercent(null, true)).toBeNull();
  });

  it("mesure la probabilité de gain du second choix dans l'absolu, pas relativement au premier", () => {
    // Le second choix reste très fort pour le joueur (cp 400 ≈ position
    // gagnée) même si le meilleur coup l'écrase (voir computeSecondBestGap) —
    // c'est ce qui distingue une alternative « encore tenable » d'une
    // alternative qui s'effondre (voir classify.ts#CRITICAL_SECOND_BEST_MAX_WIN).
    const win = secondBestWinPercent({ cp: 400, mate: null }, true);
    expect(win).not.toBeNull();
    expect(win!).toBeGreaterThan(50);
  });

  it("bascule le point de vue pour les Noirs", () => {
    const win = secondBestWinPercent({ cp: 400, mate: null }, false);
    expect(win).not.toBeNull();
    expect(win!).toBeLessThan(50);
  });
});

describe("secondBestAllowsImmediateMate", () => {
  it("renvoie false sans second choix moteur", () => {
    expect(secondBestAllowsImmediateMate(null, true)).toBe(false);
  });

  it("renvoie false quand le second choix n'annonce aucun mat", () => {
    expect(secondBestAllowsImmediateMate({ cp: -600, mate: null }, true)).toBe(false);
  });

  it("détecte un mat en 1 délivré par l'adversaire, POV Blancs", () => {
    // mate: -1 POV Blancs = les Noirs matent en 1 : le joueur au trait (Blanc)
    // se ferait mater instantanément en jouant le second choix.
    expect(secondBestAllowsImmediateMate({ cp: null, mate: -1 }, true)).toBe(true);
  });

  it("ne confond pas un mat immédiat avec un mat plus lointain", () => {
    expect(secondBestAllowsImmediateMate({ cp: null, mate: -3 }, true)).toBe(false);
  });

  it("bascule le point de vue pour les Noirs", () => {
    // mate: 1 POV Blancs = les Blancs matent en 1 : catastrophique pour les
    // Noirs au trait qui envisageraient ce second choix.
    expect(secondBestAllowsImmediateMate({ cp: null, mate: 1 }, false)).toBe(true);
  });

  it("ne signale rien quand c'est LE JOUEUR au trait qui mate en 1 dans l'alternative — ce n'est pas une menace", () => {
    expect(secondBestAllowsImmediateMate({ cp: null, mate: 1 }, true)).toBe(false);
  });
});
