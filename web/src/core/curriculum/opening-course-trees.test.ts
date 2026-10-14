import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { collectNodes } from "@/core/chess/move-tree";
import { OPENING_COURSE_IDS } from "./opening-course-ids";
import { OPENING_COURSE_TREES } from "./opening-course-trees";
import { OPENINGS } from "./openings";

const SQUARE = /^[a-h][1-8]$/;
const OPENING_IDS = new Set(OPENINGS.map((opening) => opening.id));
// Les figurines Unicode font planter l'affichage côté client : SAN en texte brut uniquement.
const FIGURINES = /[\u2654-\u265F]/;

describe("OPENING_COURSE_TREES", () => {
  it("la liste légère OPENING_COURSE_IDS (lien « Cours » de la fiche) coïncide avec le registre", () => {
    expect([...OPENING_COURSE_IDS].sort()).toEqual(Object.keys(OPENING_COURSE_TREES).sort());
  });

  it("ne cible que des ouvertures qui existent dans OPENINGS", () => {
    for (const openingId of Object.keys(OPENING_COURSE_TREES)) {
      expect(OPENING_IDS.has(openingId), openingId).toBe(true);
    }
  });

  it("chaque chapitre part de la position initiale et contient les coups de l'ouverture (ligne principale ou variante)", () => {
    for (const [openingId, tree] of Object.entries(OPENING_COURSE_TREES)) {
      const expected = OPENINGS.find((opening) => opening.id === openingId)!.moves;
      for (const chapter of tree.chapters) {
        expect(chapter.root.fen, `${openingId} (${chapter.title})`).toBe(new Chess().fen());
        let node = chapter.root;
        for (const san of expected) {
          const next = node.children.find((child) => child.san === san);
          expect(next, `${openingId} (${chapter.title}) : ${san} introuvable`).toBeDefined();
          node = next!;
        }
      }
    }
  });

  it("chaque chapitre a un titre, une introduction et une explication sur chaque coup, variantes comprises", () => {
    for (const [openingId, tree] of Object.entries(OPENING_COURSE_TREES)) {
      for (const chapter of tree.chapters) {
        expect(chapter.title.trim().length, openingId).toBeGreaterThan(0);
        expect(chapter.root.comment, `${openingId} (${chapter.title}) : introduction`).toBeTruthy();
        for (const node of collectNodes(chapter.root)) {
          if (node.san === null) continue;
          expect(node.comment, `${openingId} (${chapter.title}) : ${node.san} sans explication`).toBeTruthy();
        }
      }
    }
  });

  it.each(["scotch-game", "caro-kann", "scotch-gambit", "italian-game"])("%s : chaque coup porte une évaluation pour la barre et chaque commentaire gèle le jeu ([%%txt])", (openingId) => {
    for (const chapter of OPENING_COURSE_TREES[openingId].chapters) {
      for (const node of collectNodes(chapter.root)) {
        if (node.san === null) continue;
        const where = `${chapter.title} : ${node.san} (${node.id})`;
        expect(node.evaluationScore !== null || node.evaluationMate !== null, where).toBe(true);
        expect(node.showEvalBar, where).toBe(true);
        expect(node.freeze, where).toBe(true);
      }
    }
  });

  it("Gambit Écossais : chaque faute noire signalée porte 3 indices progressifs, et ses cases d'indice existent", () => {
    let withHints = 0;
    for (const chapter of OPENING_COURSE_TREES["scotch-gambit"].chapters) {
      for (const node of collectNodes(chapter.root)) {
        if (node.hints.length === 0) continue;
        withHints++;
        expect(node.hints, `${chapter.title} : ${node.san}`).toHaveLength(3);
        expect(node.hintHighlights.length, `${chapter.title} : ${node.san}`).toBeGreaterThan(0);
        for (const highlight of node.hintHighlights) expect(highlight.square).toMatch(SQUARE);
      }
    }
    expect(withHints).toBeGreaterThanOrEqual(8);
  });

  it("aucune figurine Unicode dans les commentaires, flèches et surbrillances sur des cases réelles", () => {
    for (const [openingId, tree] of Object.entries(OPENING_COURSE_TREES)) {
      for (const chapter of tree.chapters) {
        expect(FIGURINES.test(chapter.title), `${openingId} titre`).toBe(false);
        for (const node of collectNodes(chapter.root)) {
          expect(FIGURINES.test(node.comment ?? ""), `${openingId} (${chapter.title}) nœud ${node.id}`).toBe(false);
          expect(() => new Chess(node.fen)).not.toThrow();
          for (const arrow of node.arrows) {
            expect(arrow.from, `${openingId} nœud ${node.id}`).toMatch(SQUARE);
            expect(arrow.to, `${openingId} nœud ${node.id}`).toMatch(SQUARE);
          }
          for (const highlight of node.highlights) {
            expect(highlight.square, `${openingId} nœud ${node.id}`).toMatch(SQUARE);
          }
        }
      }
    }
  });
});
