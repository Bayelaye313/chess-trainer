import { describe, expect, it } from "vitest";
import {
  buildEnduranceStatus,
  buildTimeline,
  cleanPlyOf,
  compareOpenings,
  relativeDay,
  type OpeningSessionHistory,
} from "./opening-endurance-history";

const now = new Date("2026-10-12T12:00:00Z");

function session(id: string, daysAgo: number, overrides: Partial<OpeningSessionHistory> = {}): OpeningSessionHistory {
  return {
    sessionId: id,
    openingId: "sicilian-alapin",
    openingName: "Alapine",
    playedAt: new Date(now.getTime() - daysAgo * 86_400_000).toISOString(),
    firstMistakePly: 20,
    lastPly: 40,
    accuracy: 85,
    ...overrides,
  };
}

describe("opening-endurance-history", () => {
  it("le dernier ply propre s'arrête juste avant la première gaffe, ou en fin de ligne", () => {
    expect(cleanPlyOf(session("a", 0, { firstMistakePly: 11 }))).toBe(10);
    expect(cleanPlyOf(session("a", 0, { firstMistakePly: null, lastPly: 24 }))).toBe(24);
  });

  it("statut : record, moyenne glissante sur 10 sessions et tendance", () => {
    expect(buildEnduranceStatus([])).toBeNull();
    const older = Array.from({ length: 10 }, (_, i) => session(`old${i}`, 30 + i, { firstMistakePly: 11 }));
    const recent = Array.from({ length: 10 }, (_, i) => session(`new${i}`, i, { firstMistakePly: 29 }));
    const status = buildEnduranceStatus([...older, ...recent])!;
    expect(status.recordMove).toBe(14);
    expect(status.rollingMove).toBe(14);
    expect(status.rollingCount).toBe(10);
    expect(status.trend).toBe(9);
    expect(status.tier).toBe("solide");
    expect(buildEnduranceStatus([session("x", 0, { firstMistakePly: 7 })])!.tier).toBe("fragile");
  });

  it("chronologie : plus récente d'abord, record et progrès racontés", () => {
    const timeline = buildTimeline(
      [
        session("s1", 5, { firstMistakePly: 21 }),
        session("s2", 2, { firstMistakePly: 30, accuracy: 92 }),
        session("s3", 1, { firstMistakePly: 18, openingId: "caro-kann", openingName: "Caro-Kann" }),
      ],
      now,
    );
    expect(timeline.map((e) => e.session.sessionId)).toEqual(["s3", "s2", "s1"]);
    expect(timeline[1].headline).toBe("Il y a 2 jours dans l'Alapine");
    expect(timeline[1].mood).toBe("record");
    expect(timeline[1].story).toBe(
      "Tu as tenu une précision de 92 % jusqu'au coup 15, où tombe ta première gaffe, brisant ton précédent record de fatigue stratégique (coup 10).",
    );
    expect(timeline[0].headline).toBe("Hier dans la Caro-Kann");
    expect(timeline[0].mood).toBe("stable");
  });

  it("comparateur : une carte par ouverture, la plus fragile d'abord", () => {
    const rows = compareOpenings([
      session("a", 1, { openingId: "caro-kann", openingName: "Caro-Kann", firstMistakePly: 27 }),
      session("b", 2, { openingId: "kings-indian", openingName: "Est-Indienne", firstMistakePly: 9 }),
      session("c", 3, { openingId: "caro-kann", openingName: "Caro-Kann", firstMistakePly: null, lastPly: 32 }),
    ]);
    expect(rows.map((r) => [r.openingName, r.verdict, r.avgMistakeMove])).toEqual([
      ["Est-Indienne", "Risque d'amnésie", 5],
      ["Caro-Kann", "Mur de briques", 14],
    ]);
    expect(rows[1].bestCleanMove).toBe(16);
  });

  it("dates relatives", () => {
    expect(relativeDay(now.toISOString(), now)).toBe("aujourd'hui");
    expect(relativeDay(session("a", 1).playedAt, now)).toBe("hier");
    expect(relativeDay(session("a", 20).playedAt, now)).toBe("il y a 2 semaines");
  });
});
