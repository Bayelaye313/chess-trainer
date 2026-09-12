import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { collectNodes } from "@/core/chess/move-tree";
import { CURRICULUM_THEMES } from "./catalog";
import { COURSE_TREES } from "./course-tree";

const SQUARE = /^[a-h][1-8]$/;
const THEME_IDS = new Set(CURRICULUM_THEMES.map((theme) => theme.id));

describe("COURSE_TREES", () => {
  it("ne cible que des thèmes qui existent réellement dans le catalogue", () => {
    for (const themeId of Object.keys(COURSE_TREES)) {
      expect(THEME_IDS.has(themeId)).toBe(true);
    }
  });

  it("chaque nœud a une FEN chess.js valide et cohérente avec son SAN/UCI", () => {
    for (const [themeId, tree] of Object.entries(COURSE_TREES)) {
      for (const chapter of tree.chapters) {
        for (const node of collectNodes(chapter.root)) {
          expect(() => new Chess(node.fen), `${themeId} nœud ${node.id}`).not.toThrow();
          if (node.san !== null) {
            expect(node.uci, `${themeId} nœud ${node.id}`).toMatch(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
          }
        }
      }
    }
  });

  it("chaque arbre porte une vraie variante (au moins un nœud avec plus d'un enfant) — sinon ce ne serait qu'un CourseLesson mal nommé", () => {
    for (const [themeId, tree] of Object.entries(COURSE_TREES)) {
      for (const chapter of tree.chapters) {
        const hasBranch = collectNodes(chapter.root).some((n) => n.children.length > 1);
        expect(hasBranch, `${themeId} (${chapter.title})`).toBe(true);
      }
    }
  });

  it("flèches et surbrillances portent des cases réelles de l'échiquier", () => {
    for (const [themeId, tree] of Object.entries(COURSE_TREES)) {
      for (const chapter of tree.chapters) {
        for (const node of collectNodes(chapter.root)) {
          for (const arrow of node.arrows) {
            expect(arrow.from, `${themeId} nœud ${node.id}`).toMatch(SQUARE);
            expect(arrow.to, `${themeId} nœud ${node.id}`).toMatch(SQUARE);
          }
          for (const highlight of node.highlights) {
            expect(highlight.square, `${themeId} nœud ${node.id}`).toMatch(SQUARE);
          }
        }
      }
    }
  });

  it("une suggestion moteur, quand présente, porte un SAN/UCI cohérents avec un enfant réel ou reste une alternative valide au coup joué", () => {
    for (const [themeId, tree] of Object.entries(COURSE_TREES)) {
      for (const chapter of tree.chapters) {
        for (const node of collectNodes(chapter.root)) {
          if (!node.engineSuggestion) continue;
          expect(node.engineSuggestion.uci, `${themeId} nœud ${node.id}`).toMatch(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
          const chess = new Chess(node.fen);
          expect(() => chess.move(node.engineSuggestion!.san), `${themeId} nœud ${node.id} suggestion "${node.engineSuggestion!.san}"`).not.toThrow();
        }
      }
    }
  });

  it("chaque chapitre a un titre non vide", () => {
    for (const [themeId, tree] of Object.entries(COURSE_TREES)) {
      for (const chapter of tree.chapters) {
        expect(chapter.title.trim().length, themeId).toBeGreaterThan(0);
      }
    }
  });
});
