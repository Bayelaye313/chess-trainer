import { describe, expect, it } from "vitest";
import {
  advanceCursor,
  interleavedReview,
  isPhaseFinalWeek,
  MAX_OFFSET,
  PHASE_PASS,
  phaseReview,
  nextRatingOffset,
  retentionPassed,
  retentionSourceDays,
  rollingSuccessRate,
  selectDayPuzzles,
  type SessionSummary,
} from "./adaptive";
import type { ProgrammeDay, ProgrammePuzzle } from "./types";

const puzzle = (id: string, rating: number): ProgrammePuzzle => ({
  source: "lichess_puzzle_db",
  puzzle_id: id,
  fen: "8/8/8/8/8/8/8/K6k w - - 0 1",
  theme_lichess: [],
  rating_lichess: rating,
  squelette_attendu: "",
  squelette_cases: [],
  squelette_coeur: [],
  solution_pgn: "",
  solution_uci: [],
  verification: { moteur: "test", profondeur: 1, eval_initiale: "+1", verifie_le: "2026-11-02" },
});

const day = (semaine: number, jour: number, metaphore_id: string, puzzles: ProgrammePuzzle[], reserve: ProgrammePuzzle[] = []) =>
  ({ semaine, jour, metaphore_id, elo_cible: 1500, puzzles, reserve }) as unknown as ProgrammeDay;

const sessions = (rate: number, n = 10): SessionSummary[] =>
  Array.from({ length: n }, (_, i) => ({ dayKey: `S1J${(i % 6) + 1}`, attempted: 10, succeeded: Math.round(rate * 10) }));

describe("fenêtre de rating glissante", () => {
  it("ne mesure que les 10 dernières séances", () => {
    const history = [...sessions(0, 5), ...sessions(1, 10)];
    expect(rollingSuccessRate(history)).toBe(1);
  });

  it("monte au-dessus de 75 %, baisse sous 50 %, reste entre les deux", () => {
    expect(nextRatingOffset(0, sessions(0.8))).toBe(50);
    expect(nextRatingOffset(0, sessions(0.4))).toBe(-50);
    expect(nextRatingOffset(0, sessions(0.6))).toBe(0);
    expect(nextRatingOffset(0, [])).toBe(0);
  });

  it("reste borné à ±200", () => {
    expect(nextRatingOffset(MAX_OFFSET, sessions(1))).toBe(MAX_OFFSET);
    expect(nextRatingOffset(-MAX_OFFSET, sessions(0))).toBe(-MAX_OFFSET);
  });
});

describe("sélection des puzzles du jour", () => {
  const d = day(1, 1, "nef", [puzzle("a", 1450), puzzle("b", 1500), puzzle("c", 1550)], [puzzle("d", 1650), puzzle("e", 1700), puzzle("f", 1350)]);

  it("prend les plus proches de la cible décalée, par difficulté croissante", () => {
    expect(selectDayPuzzles(d, 150, new Set(), 2).map((p) => p.puzzle_id)).toEqual(["d", "e"]);
    expect(selectDayPuzzles(d, -150, new Set(), 2).map((p) => p.puzzle_id)).toEqual(["f", "a"]);
  });

  it("sert des puzzles neufs quand la semaine est rejouée, et ne complète avec des vus qu'en dernier recours", () => {
    const seen = new Set(["a", "b", "c", "d", "e"]);
    expect(selectDayPuzzles(d, 0, seen, 2).map((p) => p.puzzle_id)).toEqual(["f", "b"]);
  });
});

describe("rétention J+7", () => {
  it("rejoue la semaine précédente, ou la semaine 1 elle-même", () => {
    expect(retentionSourceDays(3)).toEqual(["S2J1", "S2J2", "S2J3", "S2J4", "S2J5", "S2J6"]);
    expect(retentionSourceDays(1)[0]).toBe("S1J1");
  });

  it("exige 70 % de réussites complètes (squelette ET solution)", () => {
    const ok = { puzzleId: "x", skeletonOk: true, solved: true };
    const skeletonMissed = { puzzleId: "y", skeletonOk: false, solved: true };
    expect(retentionPassed([ok, ok, ok, skeletonMissed])).toBe(true);
    expect(retentionPassed([ok, skeletonMissed])).toBe(false);
    expect(retentionPassed([])).toBe(false);
  });

  it("avance au jour suivant, rejoue la semaine sur échec, passe à la semaine suivante sur succès", () => {
    expect(advanceCursor({ semaine: 2, jour: 3, repetition: 0 })).toMatchObject({ semaine: 2, jour: 4 });
    expect(advanceCursor({ semaine: 2, jour: 7, repetition: 0 }, false)).toMatchObject({ semaine: 2, jour: 1, repetition: 1 });
    expect(advanceCursor({ semaine: 2, jour: 7, repetition: 1 }, true)).toMatchObject({ semaine: 3, jour: 1, repetition: 0 });
    expect(advanceCursor({ semaine: 36, jour: 7, repetition: 0 }, true).finished).toBe(true);
  });
});

describe("interférence contextuelle", () => {
  it("alterne jours récents et anciens, sans reprendre le concept du jour", () => {
    const days = [
      day(1, 1, "nef", [puzzle("n", 1500)]),
      day(1, 2, "tribune", [puzzle("t", 1500)]),
      day(1, 3, "canon", [puzzle("c", 1500)]),
      day(1, 4, "nef", [puzzle("n2", 1500)]),
      day(1, 5, "nef", [puzzle("today", 1500)]),
    ];
    const picked = interleavedReview(days, { semaine: 1, jour: 5 }, 3).map((p) => p.puzzle_id);
    expect(picked).toEqual(["c", "t"]);
  });
});

describe("bilan de fin de phase", () => {
  const week = (succeeded: number, attempted = 8) => Array.from({ length: 6 }, (_, i) => ({ dayKey: `S7J${i + 1}`, attempted, succeeded }));

  it("ne porte que sur la dernière semaine de chaque phase", () => {
    expect([7, 14, 22, 29, 36].every(isPhaseFinalWeek)).toBe(true);
    expect([1, 6, 8, 15, 30, 35].some(isPhaseFinalWeek)).toBe(false);
  });

  it("exige la rétention ET une réussite de la semaine au moins égale au seuil", () => {
    const atThreshold = Math.ceil(PHASE_PASS * 8);
    expect(phaseReview(week(atThreshold), true).passed).toBe(true);
    expect(phaseReview(week(atThreshold), false).passed).toBe(false);
    expect(phaseReview(week(atThreshold - 1), true).passed).toBe(false);
    expect(phaseReview([], true)).toMatchObject({ weekSuccess: null, passed: false });
  });

  it("un échec rejoue la dernière semaine, un succès ouvre la phase suivante", () => {
    expect(advanceCursor({ semaine: 7, jour: 7, repetition: 0 }, phaseReview(week(2), true).passed)).toMatchObject({ semaine: 7, jour: 1, repetition: 1 });
    expect(advanceCursor({ semaine: 7, jour: 7, repetition: 0 }, phaseReview(week(7), true).passed)).toMatchObject({ semaine: 8, jour: 1, repetition: 0 });
  });
});
