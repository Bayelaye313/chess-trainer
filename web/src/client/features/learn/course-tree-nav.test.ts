import { describe, expect, it } from "vitest";
import { mainLine, parseMoveTree } from "@/core/chess/move-tree";
import { childForDrop, courseTreeNavReducer, initialCourseTreeNav, isPlayerTurn, moveArrowRevealed, turnOfFen } from "./course-tree-nav";

describe("courseTreeNavReducer", () => {
  it("sélectionne un nœud et efface le feedback", () => {
    const state = { ...initialCourseTreeNav("0"), feedback: "wrong" as const };
    expect(courseTreeNavReducer(state, { type: "select", id: "0.0" })).toMatchObject({ currentId: "0.0", feedback: "idle" });
  });

  it("changer de chapitre repart de sa racine", () => {
    const state = { ...initialCourseTreeNav("0"), currentId: "0.0.0" };
    expect(courseTreeNavReducer(state, { type: "chapter", index: 2, rootId: "0" })).toMatchObject({ chapterIndex: 2, currentId: "0" });
  });

  it("entrer en mode jeu ramène à la racine, revenir en lecture garde la position", () => {
    const reading = { ...initialCourseTreeNav("0"), currentId: "0.0.0" };
    const playing = courseTreeNavReducer(reading, { type: "mode", mode: "play", rootId: "0" });
    expect(playing).toMatchObject({ mode: "play", currentId: "0" });
    const moved = { ...playing, currentId: "0.0" };
    expect(courseTreeNavReducer(moved, { type: "mode", mode: "read", rootId: "0" })).toMatchObject({ mode: "read", currentId: "0.0" });
  });

  it("wrong / hint posent le feedback sans bouger le curseur", () => {
    const state = initialCourseTreeNav("0");
    expect(courseTreeNavReducer(state, { type: "wrong" })).toMatchObject({ currentId: "0", feedback: "wrong" });
    expect(courseTreeNavReducer(state, { type: "hint" })).toMatchObject({ currentId: "0", feedback: "hint" });
  });
});

describe("indices progressifs", () => {
  it("chaque « Indice » monte d'un cran, et changer de nœud remet le compteur à zéro", () => {
    const once = courseTreeNavReducer(initialCourseTreeNav("0"), { type: "hint" });
    const twice = courseTreeNavReducer(once, { type: "hint" });
    expect(twice.hintLevel).toBe(2);
    expect(courseTreeNavReducer(twice, { type: "select", id: "0.0" }).hintLevel).toBe(0);
  });

  it("la flèche du coup n'arrive qu'après tous les indices textuels du nœud", () => {
    const [, f6] = mainLine(parseMoveTree('1. e4 f6 { [%hint "Un."] [%hint "Deux."] [%hint "Trois."] }'));
    expect(moveArrowRevealed(f6, 3)).toBe(false);
    expect(moveArrowRevealed(f6, 4)).toBe(true);
    const [e4] = mainLine(parseMoveTree("1. e4 e5"));
    expect(moveArrowRevealed(e4, 1)).toBe(true);
  });
});

describe("childForDrop / isPlayerTurn", () => {
  const root = parseMoveTree("1. e4 e5 (1... c5) 2. Nf3");

  it("trouve le coup de la ligne principale et celui d'une variante, null sinon", () => {
    const e4 = root.children[0];
    expect(childForDrop(root, "e2", "e4")?.san).toBe("e4");
    expect(childForDrop(e4, "e7", "e5")?.san).toBe("e5");
    expect(childForDrop(e4, "c7", "c5")?.san).toBe("c5");
    expect(childForDrop(e4, "d7", "d5")).toBeNull();
  });

  it("accepte une promotion déposée sans pièce précisée comme une dame", () => {
    const promo = parseMoveTree("1. a8=Q", "8/P6k/8/8/8/8/8/K7 w - - 0 1");
    expect(childForDrop(promo, "a7", "a8")?.san).toBe("a8=Q");
  });

  it("le lecteur joue seulement quand il a le trait et qu'il reste un coup", () => {
    const [e4, e5, nf3] = mainLine(root);
    expect(turnOfFen(e4.fen)).toBe("b");
    expect(isPlayerTurn(root, "w")).toBe(true);
    expect(isPlayerTurn(e4, "w")).toBe(false);
    expect(isPlayerTurn(e5, "w")).toBe(true);
    expect(isPlayerTurn(nf3, "b")).toBe(false); // fin de ligne
  });
});
