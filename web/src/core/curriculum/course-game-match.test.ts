import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { parseMoveTree } from "@/core/chess/move-tree";
import type { MoveQuality } from "@/core/chess/types";
import type { CourseTree } from "./course-tree";
import { OPENING_COURSE_TREES } from "./opening-course-trees";
import { findOpening } from "./openings";
import {
  attributeGameToCourse,
  buildCourseIndex,
  matchGameToCourse,
  moveNumberLabel,
  signatureKeyOf,
  tallyDeviations,
  tallyMistakes,
  type AttributableCourse,
  type CourseGameMove,
} from "./course-game-match";

const TREE: CourseTree = {
  chapters: [
    { title: "Classique", root: parseMoveTree("1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5 (4... Nf6 5. Nxc6) 5. Nxc6") },
    // Le même départ dans un second chapitre : ses coups s'ajoutent à la même position.
    { title: "Göring", root: parseMoveTree("1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. c3") },
  ],
};
const INDEX = buildCourseIndex(TREE);
const SIGNATURE = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"];
const SIGNATURE_KEY = signatureKeyOf(SIGNATURE);

/** Partie avec les Blancs : `quality` par demi-coup, `okay` par défaut. */
function game(sans: string[], qualities: Record<number, MoveQuality> = {}, playerColor: "w" | "b" = "w"): (CourseGameMove & { bestSan: string | null })[] {
  const board = new Chess();
  return sans.map((san, index) => {
    const fenBefore = board.fen();
    const move = board.move(san);
    const ply = index + 1;
    return {
      ply,
      san: move.san,
      uci: move.from + move.to + (move.promotion ?? ""),
      fenBefore,
      byPlayer: (ply % 2 === 1) === (playerColor === "w"),
      quality: qualities[ply] ?? "okay",
      cpLoss: null,
      bestSan: null,
    };
  });
}

function match(moves: CourseGameMove[]) {
  return matchGameToCourse(INDEX, SIGNATURE_KEY, SIGNATURE.length, moves);
}

describe("buildCourseIndex", () => {
  it("réunit les coups prévus par tous les chapitres à une même position", () => {
    const afterExd4 = game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"])[6].fenBefore;
    const position = INDEX.get(afterExd4.split(" ").slice(0, 3).join(" "));
    expect(position?.moves.map((m) => m.san)).toEqual(["Nxd4", "c3"]);
    expect(position?.chapterIndex).toBe(0);
  });
});

describe("matchGameToCourse", () => {
  it("repère TA sortie du cours et les coups qu'il prévoyait", () => {
    const result = match(game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Be3"]));
    expect(result?.followedPlies).toBe(8);
    expect(result?.exit).toMatchObject({ by: "player", ply: 9, playedSan: "Be3" });
    expect(result?.deviation).toMatchObject({ ply: 9, playedSan: "Be3", chapterIndex: 0 });
    expect(result?.deviation?.expected.map((m) => m.san)).toEqual(["Nxc6"]);
  });

  it("distingue une sortie de l'adversaire : pas de déviation à te reprocher", () => {
    const result = match(game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Qh4"]));
    expect(result?.exit).toMatchObject({ by: "opponent", ply: 8 });
    expect(result?.deviation).toBeNull();
  });

  it("signale la fin du cours quand la partie l'a suivi jusqu'au bout", () => {
    const result = match(game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Nxc6", "Qf6"]));
    expect(result?.exit).toMatchObject({ by: "end", ply: 10 });
    expect(result?.deviation).toBeNull();
  });

  it("ignore une partie que l'adversaire détourne avant la ligne caractéristique", () => {
    expect(match(game(["e4", "e5", "Nf3", "d6", "d4"]))).toBeNull();
  });

  it("suit aussi le camp adverse du cours : la déviation est celle du joueur", () => {
    const result = match(game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Qf6"], {}, "b"));
    expect(result?.exit).toMatchObject({ by: "player", ply: 8 });
    expect(result?.deviation?.expected.map((m) => m.san)).toEqual(["Bc5", "Nf6"]);
  });
});

describe("tallyDeviations / tallyMistakes", () => {
  it("classe d'abord le coup hors cours le plus répété", () => {
    const be3 = match(game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Be3"]));
    const nc3 = match(game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nf6", "Nc3"]));
    const tally = tallyDeviations([
      { gameId: "a", deviation: nc3!.deviation },
      { gameId: "b", deviation: be3!.deviation },
      { gameId: "c", deviation: be3!.deviation },
    ]);
    expect(tally.map((t) => [t.playedSan, t.count])).toEqual([
      ["Be3", 2],
      ["Nc3", 1],
    ]);
    expect(tally[0].gameIds).toEqual(["b", "c"]);
  });

  it("regroupe une même gaffe rejouée à la même position, une fois par partie", () => {
    const blunder = game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Be3"], { 9: "blunder" });
    const inaccuracy = game(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Be3"], { 9: "inaccuracy" });
    const tally = tallyMistakes(INDEX, [
      { gameId: "a", moves: blunder },
      { gameId: "b", moves: inaccuracy },
    ]);
    expect(tally).toHaveLength(1);
    expect(tally[0]).toMatchObject({ playedSan: "Be3", count: 2, quality: "blunder" });
    expect(tally[0].expected.map((m) => m.san)).toEqual(["Nxc6"]);
  });
});

describe("moveNumberLabel", () => {
  it("numérote les coups blancs et noirs", () => {
    expect(moveNumberLabel(9)).toBe("5.");
    expect(moveNumberLabel(10)).toBe("5...");
  });
});

describe("attributeGameToCourse", () => {
  // Les vrais cours du catalogue : c'est leur chevauchement qui est en jeu.
  const COURSES: AttributableCourse[] = Object.entries(OPENING_COURSE_TREES).flatMap(([id, tree]) => {
    const opening = findOpening(id);
    if (!opening) return [];
    return [{
      id,
      color: opening.side === "white" ? ("w" as const) : ("b" as const),
      index: buildCourseIndex(tree),
      signatureKey: signatureKeyOf(opening.moves),
      signatureLength: opening.moves.length,
    }];
  });
  const attribute = (sans: string[], playerColor: "w" | "b") => attributeGameToCourse(COURSES, playerColor, game(sans, {}, playerColor));

  it("compte une Écossaise jouée avec les Blancs pour scotch-game, pas pour les Quatre Cavaliers (Noirs)", () => {
    const result = attribute(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Nxc6", "Qf6"], "w");
    expect(result).toMatchObject({ courseId: "scotch-game", withCourseSide: true });
  });

  it("compte des Quatre Cavaliers joués avec les Noirs pour scotch-four-knights-black", () => {
    const result = attribute(["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "d4", "exd4", "Nxd4", "Bb4"], "b");
    expect(result).toMatchObject({ courseId: "scotch-four-knights-black", withCourseSide: true });
  });

  it("compte des Deux Cavaliers joués avec les Noirs pour italian-game-black, pas pour italian-game (Blancs)", () => {
    const result = attribute(["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5"], "b");
    expect(result).toMatchObject({ courseId: "italian-game-black", withCourseSide: true });
  });

  it("reconnaît une Italienne atteinte par transposition (2.Fc4 Cc6 3.Cf3 Cf6) : italian-game-black, pas bishops-center-black", () => {
    const result = attribute(["e4", "e5", "Bc4", "Nc6", "Nf3", "Nf6", "d3", "Bc5"], "b");
    expect(result).toMatchObject({ courseId: "italian-game-black", withCourseSide: true });
    expect(result?.match.signaturePly).toBe(6);
  });

  it("compte l'ordre direct 2.Cf3 Cc6 3.Fc4 Cf6 pour italian-game-black", () => {
    const result = attribute(["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "d3", "Bc5"], "b");
    expect(result).toMatchObject({ courseId: "italian-game-black", withCourseSide: true });
  });

  it("garde bishops-center-black quand la partie ne transpose pas", () => {
    const result = attribute(["e4", "e5", "Bc4", "Nf6", "d3", "c6"], "b");
    expect(result).toMatchObject({ courseId: "bishops-center-black", withCourseSide: true });
  });

  it("ne retombe sur un cours du camp adverse que si aucun cours de ton camp ne correspond", () => {
    const sans = ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5"];
    const whiteOnly = COURSES.filter((course) => course.color === "w");
    const result = attributeGameToCourse(whiteOnly, "b", game(sans, {}, "b"));
    expect(result?.withCourseSide).toBe(false);
    expect(result?.courseId).not.toBe("italian-game-black");
  });
});
