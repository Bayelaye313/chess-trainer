import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { CURRICULUM_THEMES } from "./catalog";
import { COURSE_LESSONS } from "./course-lesson";

const THEME_IDS = new Set(CURRICULUM_THEMES.map((theme) => theme.id));
const SQUARE = /^[a-h][1-8]$/;

describe("COURSE_LESSONS", () => {
  it("ne cible que des thèmes qui existent réellement dans le catalogue", () => {
    for (const themeId of Object.keys(COURSE_LESSONS)) {
      expect(THEME_IDS.has(themeId)).toBe(true);
    }
  });

  it("porte au moins deux chapitres par cours — un seul chapitre ne serait qu'un ThemeDemo mal nommé", () => {
    for (const [themeId, lesson] of Object.entries(COURSE_LESSONS)) {
      expect(lesson.steps.length, themeId).toBeGreaterThanOrEqual(2);
    }
  });

  it("chaque chapitre a une FEN valide, des flèches et surbrillances sur des cases réelles", () => {
    for (const [themeId, lesson] of Object.entries(COURSE_LESSONS)) {
      for (const [index, step] of lesson.steps.entries()) {
        expect(() => new Chess(step.fen), `${themeId} chapitre ${index} (${step.title})`).not.toThrow();
        for (const arrow of step.arrows ?? []) {
          expect(arrow.from, `${themeId} chapitre ${index}`).toMatch(SQUARE);
          expect(arrow.to, `${themeId} chapitre ${index}`).toMatch(SQUARE);
        }
        for (const highlight of step.highlights ?? []) {
          expect(highlight.square, `${themeId} chapitre ${index}`).toMatch(SQUARE);
        }
      }
    }
  });

  it("chaque chapitre a un titre et un commentaire non vides", () => {
    for (const [themeId, lesson] of Object.entries(COURSE_LESSONS)) {
      for (const [index, step] of lesson.steps.entries()) {
        expect(step.title.trim().length, `${themeId} chapitre ${index}`).toBeGreaterThan(0);
        expect(step.text.trim().length, `${themeId} chapitre ${index}`).toBeGreaterThan(0);
      }
    }
  });

  it("moveSan, quand présent, est une suite de coups réellement légale rejouée depuis fen (position réelle, jamais inventée)", () => {
    // `fen` porte toujours la position de DÉPART du chapitre (voir le docstring de
    // `course-lesson.ts`) — `moveSan` se rejoue donc directement depuis là, exactement
    // comme `theme-demo.test.ts` le fait pour `expectedMove`.
    for (const [themeId, lesson] of Object.entries(COURSE_LESSONS)) {
      for (const [index, step] of lesson.steps.entries()) {
        if (!step.moveSan || step.moveSan.length === 0) continue;
        const chess = new Chess(step.fen);
        for (const san of step.moveSan) {
          expect(() => chess.move(san), `${themeId} chapitre ${index} (${step.title}) : ${san} depuis ${chess.fen()}`).not.toThrow();
        }
      }
    }
  });
});
