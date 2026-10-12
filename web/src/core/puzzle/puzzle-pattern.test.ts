import { describe, expect, it } from "vitest";
import { identifyPuzzlePattern } from "./puzzle-pattern";

describe("identifyPuzzlePattern", () => {
  it("prend le motif stocké en priorité, avec son cours d'Académie", () => {
    const pattern = identifyPuzzlePattern("4k3/8/8/8/8/8/8/4K2R w K - 0 1", ["h1h8"], ["fork"]);
    expect(pattern?.name).toBe("La fourchette");
    expect(pattern?.theme?.themeId).toBe("tm-la-fourchette");
  });

  it("sans motif stocké, reconnaît un mat du couloir en rejouant la solution", () => {
    const pattern = identifyPuzzlePattern("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1", ["a1a8"], []);
    expect(pattern?.name).toBe("Le mat du couloir");
    expect(pattern?.theme?.themeId).toBe("cm-mat-du-couloir");
  });

  it("sans motif stocké, nomme un coup tranquille et pointe vers le bon cours (pas le coup intercalaire)", () => {
    // 1.Kb6 : ni échec ni prise, et la dame matera au coup suivant — mais pas sur la rangée du fond.
    const pattern = identifyPuzzlePattern("k7/8/2K5/8/8/8/8/1Q6 w - - 0 1", ["c6b6", "a8b8"], []);
    expect(pattern?.name).toBe("Le coup tranquille");
    expect(pattern?.theme?.themeId).toBe("la-coup-tranquille");
  });

  it("renvoie null sur une solution incohérente", () => {
    expect(identifyPuzzlePattern("4k3/8/8/8/8/8/8/4K3 w - - 0 1", ["a1a8"], [])).toBeNull();
  });
});
