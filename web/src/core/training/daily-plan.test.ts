import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { OPENINGS } from "@/core/curriculum/openings";
import { OPENING_COURSE_TREES } from "@/core/curriculum/opening-course-trees";
import { OPENING_TRAPS } from "@/core/curriculum/traps";
import {
  GOAL_EFFORT_POINTS,
  MAX_EFFORT_POINTS,
  buildBotStartLines,
  computeDailyCompletion,
  computeDailyEffort,
  createDailySession,
  normalizeDailySession,
  pickBotStartLine,
  utcDayKey,
  type RepertoireOpening,
  type RepertoireTrap,
} from "./daily-plan";

const NOW = new Date("2026-10-16T09:30:00Z");

describe("computeDailyEffort", () => {
  it("pondère chaque objectif (35/25/25/15, total 100)", () => {
    expect(GOAL_EFFORT_POINTS).toEqual({ tactics: 35, openings: 25, traps: 25, review: 15 });
    expect(MAX_EFFORT_POINTS).toBe(100);
    expect(computeDailyEffort(["tactics", "openings", "traps", "review"])).toEqual({ points: 100, percent: 100, level: "optimal" });
  });

  it("signale un plan trop léger sous le seuil, optimal au-dessus", () => {
    expect(computeDailyEffort(["review"])).toEqual({ points: 15, percent: 15, level: "light" });
    expect(computeDailyEffort(["openings", "traps"]).level).toBe("light");
    expect(computeDailyEffort(["tactics", "openings"])).toEqual({ points: 60, percent: 60, level: "optimal" });
  });

  it("ignore les doublons et accepte une sélection vide", () => {
    expect(computeDailyEffort(["tactics", "tactics"]).points).toBe(35);
    expect(computeDailyEffort([])).toEqual({ points: 0, percent: 0, level: "light" });
  });
});

describe("session du jour", () => {
  it("fige les objectifs dans l'ordre canonique avec leur charge", () => {
    expect(createDailySession(["review", "tactics"], NOW)).toEqual({
      day: "2026-10-16",
      goals: ["tactics", "review"],
      effortPoints: 50,
      appliedAt: "2026-10-16T09:30:00.000Z",
    });
  });

  it("relit une session du jour et ignore celle d'un autre jour UTC", () => {
    const session = createDailySession(["openings"], NOW);
    expect(normalizeDailySession(session, new Date("2026-10-16T23:59:00Z"))).toEqual(session);
    expect(normalizeDailySession(session, new Date("2026-10-17T00:00:00Z"))).toBeNull();
    expect(utcDayKey(new Date("2026-10-16T23:59:59Z"))).toBe("2026-10-16");
  });

  it("rejette un JSON corrompu sans planter et recalcule la charge", () => {
    expect(normalizeDailySession(null, NOW)).toBeNull();
    expect(normalizeDailySession("oops", NOW)).toBeNull();
    expect(normalizeDailySession({ day: "2026-10-16", goals: [], appliedAt: NOW.toISOString() }, NOW)).toBeNull();
    expect(normalizeDailySession({ day: "2026-10-16", goals: ["tactics"], appliedAt: "pas une date" }, NOW)).toBeNull();
    expect(
      normalizeDailySession({ day: "2026-10-16", goals: ["traps", "bogus"], effortPoints: 999, appliedAt: NOW.toISOString() }, NOW),
    ).toMatchObject({ goals: ["traps"], effortPoints: 25 });
  });

  it("compte un objectif comme fait dès qu'un événement de son type existe", () => {
    const session = createDailySession(["tactics", "openings", "review"], NOW);
    expect(computeDailyCompletion(session, [])).toEqual({ completedGoals: [], completedPoints: 0, percent: 0 });
    expect(computeDailyCompletion(session, ["puzzle", "puzzle", "trap", "game"])).toEqual({
      completedGoals: ["tactics"],
      completedPoints: 35,
      percent: 47,
    });
    expect(computeDailyCompletion(session, ["puzzle", "opening", "review"]).percent).toBe(100);
  });
});

const openings: RepertoireOpening[] = [
  { id: "scotch-game", name: "Partie Écossaise", side: "white", moves: ["e4", "e5", "Nf3", "Nc6", "d4"] },
  { id: "caro-kann", name: "Défense Caro-Kann", side: "black", moves: ["e4", "c6", "d4", "d5"] },
];
const traps: RepertoireTrap[] = [
  { id: "ck-trap", name: "Piège CK", family: "Défense Caro-Kann", victimSide: "black", setupMoves: ["e4", "c6"] },
  { id: "scotch-black-victim", name: "Piège Écossaise", family: "Partie Écossaise", victimSide: "black", setupMoves: ["e4", "e5"] },
  { id: "unrelated", name: "Hors répertoire", family: "Gambit Dame", victimSide: "white", setupMoves: ["d4"] },
];

describe("lignes de départ du bot", () => {
  it("n'impose rien sans « Ouvertures » ni « Pièges »", () => {
    expect(buildBotStartLines(["tactics", "review"], openings, traps)).toEqual([]);
  });

  it("injecte le répertoire pour « Ouvertures »", () => {
    expect(buildBotStartLines(["openings"], openings, traps).map((line) => line.sourceId)).toEqual(["scotch-game", "caro-kann"]);
  });

  it("ne garde que les pièges du répertoire où l'utilisateur est la victime", () => {
    expect(buildBotStartLines(["traps"], openings, traps)).toEqual([
      { kind: "trap", sourceId: "ck-trap", label: "Piège CK", side: "black", moves: ["e4", "c6"] },
    ]);
  });

  it("tire une ligne de la couleur choisie, ou aucune", () => {
    const lines = buildBotStartLines(["openings", "traps"], openings, traps);
    expect(pickBotStartLine(lines, "w", () => 0)?.sourceId).toBe("scotch-game");
    expect(pickBotStartLine(lines, "b", () => 0.99)?.sourceId).toBe("ck-trap");
    expect(pickBotStartLine(lines, "b", () => 0)?.sourceId).toBe("caro-kann");
    expect(pickBotStartLine(buildBotStartLines(["openings"], [openings[0]], []), "b")).toBeNull();
  });

  it("toutes les lignes réelles (cours op-*.ts + pièges) sont légales et laissent la partie en cours", () => {
    const repertoire = OPENINGS.filter((opening) => opening.id in OPENING_COURSE_TREES);
    expect(repertoire.map((opening) => opening.id)).toEqual(expect.arrayContaining(["scotch-game", "caro-kann", "slav-defense"]));
    const lines = buildBotStartLines(["openings", "traps"], repertoire, OPENING_TRAPS);
    expect(lines.some((line) => line.kind === "trap")).toBe(true);
    for (const line of lines) {
      const chess = new Chess();
      for (const san of line.moves) chess.move(san);
      expect(chess.isGameOver(), line.sourceId).toBe(false);
    }
  });
});
