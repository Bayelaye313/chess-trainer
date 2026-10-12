import { describe, expect, it } from "vitest";
import { buildDiagnostic, plyToMoveNumber, readEndurance, resolveTrigger, type UserOpeningStats } from "./opening-stats";

const base: UserOpeningStats = {
  openingId: "slav-defense",
  openingName: "Défense Slave",
  playerSide: "b",
  gamesPlayed: 10,
  winRate: 60,
  accuracy: 82,
  avgMistakePly: 24,
};

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

  it("propose la mémorisation quand la gaffe arrive tôt, côté du joueur", () => {
    const trigger = resolveTrigger({ ...base, avgMistakePly: 8 }, true);
    expect(trigger.kind).toBe("memorisation");
    expect(trigger.href).toBe("/ouvertures/slav-defense?drill=main_line&side=black");
  });

  it("propose le simulateur de survie seulement si un cours existe", () => {
    expect(resolveTrigger({ ...base, avgMistakePly: 30 }, true)).toMatchObject({ kind: "survie", href: "/ouvertures/slav-defense/cours" });
    const fallback = resolveTrigger({ ...base, avgMistakePly: 30 }, false);
    expect(fallback.href).toContain("?drill=");
    expect(fallback.label).not.toContain("simulateur");
  });

  it("n'affirme rien sous l'échantillon minimal", () => {
    expect(buildDiagnostic({ ...base, gamesPlayed: 2 })).toContain("Seulement 2 parties");
    expect(buildDiagnostic({ ...base, avgMistakePly: 23 })).toContain("coup 12");
  });
});
