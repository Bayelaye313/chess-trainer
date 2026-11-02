import { describe, expect, it } from "vitest";
import { planSession } from "./session-plan";
import type { ProgrammeDay, ProgrammePuzzle } from "./types";

const p = (id: string, rating: number) => ({ puzzle_id: id, rating_lichess: rating }) as ProgrammePuzzle;
const day = (semaine: number, jour: number, metaphore_id: string, ids: string[], reserve: string[] = []) =>
  ({
    semaine,
    jour,
    metaphore_id,
    elo_cible: 1500,
    puzzles: ids.map((id, i) => p(id, 1450 + i * 10)),
    reserve: reserve.map((id, i) => p(id, 1300 + i * 10)),
  }) as unknown as ProgrammeDay;

describe("composition d'une séance", () => {
  it("jour 1 de la semaine 1 : 6 puzzles du jour, échauffement pris dans la réserve", () => {
    const d = day(1, 1, "nef", ["a", "b", "c", "d", "e", "f"], ["r1", "r2", "r3"]);
    const plan = planSession([d], d, 0, []);
    expect(plan.filter((x) => x.role === "puzzle")).toHaveLength(6);
    expect(plan.filter((x) => x.role === "echauffement").map((x) => x.puzzle.puzzle_id)).toEqual(["r1", "r2"]);
  });

  it("jour 7 : un puzzle par jour de J-7, les ratés en priorité", () => {
    const week1 = Array.from({ length: 6 }, (_, i) => day(1, i + 1, `m${i}`, [`w${i}a`, `w${i}b`]));
    const d7 = day(2, 7, "m0", []);
    const week2 = Array.from({ length: 6 }, (_, i) => day(2, i + 1, `n${i}`, [`v${i}a`]));
    const history = [
      { puzzleId: "w0b", sourceDayKey: "S1J1", success: false },
      { puzzleId: "w1a", sourceDayKey: "S1J2", success: true },
    ];
    const plan = planSession([...week1, ...week2, d7], d7, 0, history);
    const retention = plan.filter((x) => x.role === "retention");
    expect(retention.map((x) => x.sourceDayKey)).toEqual(["S1J1", "S1J2", "S1J3", "S1J4", "S1J5", "S1J6"]);
    expect(retention[0].puzzle.puzzle_id).toBe("w0b");
    expect(retention[1].puzzle.puzzle_id).toBe("w1a");
    expect(plan.filter((x) => x.role === "entrelace").length).toBeGreaterThan(0);
  });
});
