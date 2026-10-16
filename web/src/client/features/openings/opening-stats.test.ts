import { describe, expect, it } from "vitest";
import { plyToMoveNumber, readEndurance, resolveTrigger } from "./opening-stats";

const base = { openingId: "slav-defense", playerSide: "black" as const, hasCourse: true };

describe("opening-stats", () => {
  it("convertit le ply en numéro de coup", () => {
    expect(plyToMoveNumber(11)).toBe(6);
    expect(plyToMoveNumber(12)).toBe(6);
    expect(plyToMoveNumber(1)).toBe(1);
  });

  it("classe l'endurance par numéro de coup, pas par ply", () => {
    expect(readEndurance(10).tier).toBe("fragile"); // coup 5
    expect(readEndurance(11).tier).toBe("moyen"); // coup 6
    expect(readEndurance(24).tier).toBe("moyen"); // coup 12
    expect(readEndurance(25).tier).toBe("solide"); // coup 13
    expect(readEndurance(null).tier).toBe("intact");
  });

  it("gaffe avant le coup 6 : verrouiller les réflexes en Sans Guide, côté du joueur", () => {
    const trigger = resolveTrigger({ ...base, tier: "fragile" });
    expect(trigger.kind).toBe("reflexes");
    expect(trigger.label).toBe("Verrouiller les réflexes (Mode Sans Guide - Début)");
    expect(trigger.href).toBe("/ouvertures/slav-defense?drill=main_line&side=black&mode=sans-guide#drill");
  });

  it("gaffe entre les coups 6 et 12 : drill normal, Manche 1 comprise", () => {
    const trigger = resolveTrigger({ ...base, tier: "moyen" });
    expect(trigger.kind).toBe("consolidation");
    expect(trigger.href).not.toContain("mode=");
  });

  it("gaffe après le coup 12 : simulateur de survie seulement si un cours existe", () => {
    expect(resolveTrigger({ ...base, tier: "solide" })).toMatchObject({
      kind: "survie",
      label: "Lancer le simulateur de survie (Milieu de jeu)",
      href: "/ouvertures/slav-defense/cours",
    });
    expect(resolveTrigger({ ...base, tier: "intact" }).href).toBe("/ouvertures/slav-defense/cours");
    const fallback = resolveTrigger({ ...base, tier: "solide", hasCourse: false });
    expect(fallback.href).toContain("?drill=");
    expect(fallback.label).not.toContain("simulateur");
  });
});
