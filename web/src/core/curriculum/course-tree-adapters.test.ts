import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { collectNodes, mainLine } from "@/core/chess/move-tree";
import { COURSE_LESSONS } from "./course-lesson";
import { COURSE_TREES } from "./course-tree";
import { courseLessonToTree, puzzlesToCourseTree, resolveAuthoredCourseTree } from "./course-tree-adapters";

describe("courseLessonToTree", () => {
  it.each(Object.keys(COURSE_LESSONS))("%s : un chapitre par étape, ligne principale = moveSan, FEN validées par chess.js", (themeId) => {
    const lesson = COURSE_LESSONS[themeId];
    const tree = courseLessonToTree(lesson);
    expect(tree.chapters).toHaveLength(lesson.steps.length);
    tree.chapters.forEach((chapter, index) => {
      const step = lesson.steps[index];
      expect(chapter.title).toBe(step.title);
      expect(chapter.root.fen).toBe(new Chess(step.fen).fen());
      expect(mainLine(chapter.root).map((n) => n.san)).toEqual([...(step.moveSan ?? [])]);
      expect(chapter.root.comment !== null || chapter.root.tip !== null).toBe(true);
      for (const node of collectNodes(chapter.root)) expect(() => new Chess(node.fen)).not.toThrow();
    });
  });
});

describe("resolveAuthoredCourseTree", () => {
  it("sert l'arbre RAV natif en priorité, sinon la leçon convertie, sinon null", () => {
    const nativeId = Object.keys(COURSE_TREES)[0];
    expect(resolveAuthoredCourseTree(nativeId)).toBe(COURSE_TREES[nativeId]);
    const lessonId = Object.keys(COURSE_LESSONS)[0];
    const converted = resolveAuthoredCourseTree(lessonId);
    expect(converted?.chapters).toHaveLength(COURSE_LESSONS[lessonId].steps.length);
    expect(resolveAuthoredCourseTree(lessonId)).toBe(converted); // mémoïsé
    expect(resolveAuthoredCourseTree("theme-inexistant")).toBeNull();
  });
});

describe("puzzlesToCourseTree", () => {
  const puzzle = {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solutionSan: ["Qxf7#"],
    sourceRef: "Mat du berger",
  };

  it("un chapitre par exercice, consigne et provenance sur la racine, solution en ligne principale", () => {
    const tree = puzzlesToCourseTree([puzzle, puzzle], "Le mat du berger");
    expect(tree?.chapters.map((c) => c.title)).toEqual(["Exemple 1", "Exemple 2"]);
    const root = tree!.chapters[0].root;
    expect(root.comment).toContain("Trait aux Blancs");
    expect(root.comment).toContain("Mat du berger");
    expect(mainLine(root).map((n) => n.san)).toEqual(["Qxf7#"]);
  });

  it("renvoie null sans exercice, lève sur une solution illégale", () => {
    expect(puzzlesToCourseTree([], "x")).toBeNull();
    expect(() => puzzlesToCourseTree([{ ...puzzle, solutionSan: ["Qxa8"] }], "x")).toThrow(/illégal/);
  });
});
