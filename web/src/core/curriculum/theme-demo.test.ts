import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { CURRICULUM_THEMES } from "./catalog";
import { THEME_DEMOS } from "./theme-demo";

const THEME_IDS = new Set(CURRICULUM_THEMES.map((theme) => theme.id));

describe("THEME_DEMOS", () => {
  it("ne cible que des thèmes qui existent réellement dans le catalogue", () => {
    for (const themeId of Object.keys(THEME_DEMOS)) {
      expect(THEME_IDS.has(themeId)).toBe(true);
    }
  });

  it("porte au moins deux étapes par démonstration — une boucle à une seule étape ne montre rien", () => {
    for (const [themeId, demo] of Object.entries(THEME_DEMOS)) {
      expect(demo.steps.length, themeId).toBeGreaterThanOrEqual(2);
    }
  });

  it("chaque étape a une FEN valide et des flèches posées sur des cases réelles", () => {
    for (const [themeId, demo] of Object.entries(THEME_DEMOS)) {
      for (const [index, step] of demo.steps.entries()) {
        expect(() => new Chess(step.fen), `${themeId} step ${index}`).not.toThrow();
        for (const arrow of step.arrows) {
          expect(arrow.from, `${themeId} step ${index}`).toMatch(/^[a-h][1-8]$/);
          expect(arrow.to, `${themeId} step ${index}`).toMatch(/^[a-h][1-8]$/);
        }
      }
    }
  });

  it("le coup attendu de chaque étape interactive est réellement légal depuis sa FEN", () => {
    for (const [themeId, demo] of Object.entries(THEME_DEMOS)) {
      for (const [index, step] of demo.steps.entries()) {
        if (!step.expectedMove) continue;
        const board = new Chess(step.fen);
        expect(
          () => board.move({ from: step.expectedMove!.from, to: step.expectedMove!.to, promotion: step.expectedMove!.promotion }),
          `${themeId} step ${index} : ${step.expectedMove.from}-${step.expectedMove.to} devrait être légal depuis ${step.fen}`,
        ).not.toThrow();
      }
    }
  });

  it("la dernière étape de chaque démonstration est conclusive, sans coup attendu", () => {
    for (const [themeId, demo] of Object.entries(THEME_DEMOS)) {
      const lastStep = demo.steps[demo.steps.length - 1];
      expect(lastStep.expectedMove, themeId).toBeUndefined();
    }
  });
});
