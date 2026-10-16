import { describe, expect, it } from "vitest";
import type { OpeningSessionHistory } from "./opening-endurance-history";
import {
  buildPerformanceProfile,
  firstEncounters,
  levelOf,
  theoryDiscipline,
} from "./opening-performance-radar";

const now = new Date("2026-10-16T12:00:00Z");

function session(id: string, daysAgo: number, overrides: Partial<OpeningSessionHistory> = {}): OpeningSessionHistory {
  return {
    sessionId: id,
    openingId: "caro-kann",
    openingName: "Caro-Kann",
    variationKey: "main_line",
    playedAt: new Date(now.getTime() - daysAgo * 86_400_000).toISOString(),
    firstMistakePly: null,
    lastPly: 30,
    accuracy: 100,
    ...overrides,
  };
}

describe("opening-performance-radar", () => {
  it("discipline : part des 12 premiers plies jouée sans faute", () => {
    expect(theoryDiscipline(session("a", 0))).toBe(1);
    expect(theoryDiscipline(session("a", 0, { firstMistakePly: 13 }))).toBe(1);
    expect(theoryDiscipline(session("a", 0, { firstMistakePly: 7 }))).toBe(0.5);
    expect(theoryDiscipline(session("a", 0, { firstMistakePly: 1 }))).toBe(0);
    // Ligne de 8 plies : jugée sur sa propre longueur.
    expect(theoryDiscipline(session("a", 0, { firstMistakePly: 5, lastPly: 8 }))).toBe(0.5);
  });

  it("niveaux de pilier", () => {
    expect(levelOf(75)).toBe("fort");
    expect(levelOf(74)).toBe("moyen");
    expect(levelOf(49)).toBe("faible");
  });

  it("instinct de punition : seule la PREMIÈRE session de chaque variante nommée compte", () => {
    const sessions = [
      session("main", 5),
      session("v1-first", 4, { variationKey: "B12|Advance", firstMistakePly: 16 }),
      session("v1-second", 1, { variationKey: "B12|Advance" }),
      session("v2-first", 3, { variationKey: "B13|Exchange" }),
    ];
    expect(firstEncounters(sessions).map((s) => s.sessionId)).toEqual(["v1-first", "v2-first"]);
    const punition = buildPerformanceProfile(sessions)!.pillars[2];
    // (15/30 + 1) / 2 = 75 %
    expect(punition.score).toBe(75);
    expect(punition.detail).toBe("1 variante adverse sur 2 jouée sans faute dès la première rencontre.");
  });

  it("instinct de punition non mesuré sans variante nommée", () => {
    const punition = buildPerformanceProfile([session("a", 0)])!.pillars[2];
    expect(punition.score).toBeNull();
    expect(punition.level).toBeNull();
  });

  it("profil : réflexes solides MAIS essoufflement au coup 13", () => {
    const sessions = Array.from({ length: 6 }, (_, i) => session(`s${i}`, i, { firstMistakePly: 25, lastPly: 40 }));
    const profile = buildPerformanceProfile(sessions)!;
    const [discipline, endurance] = profile.pillars;
    expect(discipline.score).toBe(100);
    // Dernier coup propre = ply 24 = coup 12 → 12/20 = 60.
    expect(endurance.score).toBe(60);
    expect(endurance.marker).toEqual({ at: 60, label: "Coup 12" });
    expect(profile.headline).toBe(
      "Profil : Réflexes d'ouverture solides mais sujet à l'essoufflement positionnel vers le coup 13.",
    );
  });

  it("hit-parade : forteresses la plus robuste d'abord, zones de danger la plus critique d'abord, sans recouvrement", () => {
    const sessions = [
      session("ck", 0, { firstMistakePly: 27, lastPly: 30 }), // robustesse 87
      session("sc", 0, { openingId: "scotch", openingName: "Écossaise" }), // 100
      session("dr", 0, { openingId: "dragon", openingName: "Dragon", firstMistakePly: 4, lastPly: 30 }), // 10
      session("ki", 0, { openingId: "kid", openingName: "Est-Indienne", firstMistakePly: 13, lastPly: 30 }), // 40
    ];
    const profile = buildPerformanceProfile(sessions)!;
    expect(profile.fortresses.map((r) => r.openingId)).toEqual(["scotch", "caro-kann"]);
    expect(profile.dangerZones.map((r) => r.openingId)).toEqual(["dragon", "kid"]);
    expect(profile.details.at(-1)).toBe("Priorité de travail : Dragon, première gaffe au coup 2 en moyenne.");
  });

  it("aucun profil sans session", () => {
    expect(buildPerformanceProfile([])).toBeNull();
  });
});
