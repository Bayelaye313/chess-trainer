import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { attachEngineSuggestion, collectNodes, findNode, mainLine, parseMoveTree, pathTo } from "./move-tree";

describe("parseMoveTree", () => {
  it("parse une ligne plate sans variante", () => {
    const root = parseMoveTree("1. e4 e5 2. Nf3 Nc6");
    const line = mainLine(root);
    expect(line.map((n) => n.san)).toEqual(["e4", "e5", "Nf3", "Nc6"]);
    expect(line[0].ply).toBe(1);
    expect(line[3].ply).toBe(4);
    expect(new Chess(line[3].fen).isCheckmate()).toBe(false);
    expect(line[3].fen.split(" ")[5]).toBe("3"); // 4 demi-coups = fin du 2e coup complet, compteur "3" (le 3e coup complet à jouer)
  });

  it("rattache une variante RAV comme sœur du coup remplacé, jamais comme un enfant du coup principal", () => {
    const root = parseMoveTree("1. e4 e5 2. Nf3 (2. Bc4 Bc5) 2... Nc6");
    expect(root.children).toHaveLength(1); // 1.e4 : un seul premier coup
    const afterE4E5 = root.children[0].children[0]; // après 1...e5
    expect(afterE4E5.children.map((c) => c.san)).toEqual(["Nf3", "Bc4"]);
    expect(afterE4E5.children[1].children.map((c) => c.san)).toEqual(["Bc5"]);
  });

  it("gère une variante imbriquée dans une variante, à profondeur arbitraire", () => {
    const root = parseMoveTree("1. d4 d5 2. c4 (2. Nf3 Nf6 (2... e6 3. c4)) 2... e6");
    const afterD4D5 = root.children[0].children[0];
    expect(afterD4D5.children.map((c) => c.san)).toEqual(["c4", "Nf3"]);
    const nf3Branch = afterD4D5.children[1];
    expect(nf3Branch.children.map((c) => c.san)).toEqual(["Nf6", "e6"]);
    const nestedE6 = nf3Branch.children[1];
    expect(nestedE6.children.map((c) => c.san)).toEqual(["c4"]);
  });

  it("capture le commentaire, [%csl] et [%cal] d'un nœud, et nettoie le texte affiché", () => {
    const root = parseMoveTree("1. d4 Nf6 2. c4 g6 { Bonne case. } { [%csl Rd5][%cal Gc4d5] }");
    const g6 = mainLine(root)[3];
    expect(g6.comment).toBe("Bonne case.");
    expect(g6.highlights).toEqual([{ square: "d5", color: "red" }]);
    expect(g6.arrows).toEqual([{ from: "c4", to: "d5", color: "green" }]);
  });

  it("lève une erreur explicite sur un coup illégal, jamais un arbre corrompu en silence", () => {
    expect(() => parseMoveTree("1. e4 e5 2. Qh5 g6 3. Qxf7")).toThrow(/illégal/);
  });

  it("attribue un id stable à chaque nœud, unique dans tout l'arbre", () => {
    const root = parseMoveTree("1. e4 e5 (1... c5 2. Nf3)");
    const ids = collectNodes(root).map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findNode(root, ids[ids.length - 1])).not.toBeNull();
  });

  it("pathTo renvoie le chemin racine→nœud inclus, [] si absent", () => {
    const root = parseMoveTree("1. e4 e5 2. Nf3");
    const nf3 = mainLine(root)[2];
    const path = pathTo(root, nf3.id);
    expect(path.map((n) => n.san)).toEqual([null, "e4", "e5", "Nf3"]);
    expect(pathTo(root, "introuvable")).toEqual([]);
  });
});

describe("attachEngineSuggestion", () => {
  it("pose une suggestion moteur explicite sur le nœud ciblé", () => {
    const root = parseMoveTree("1. e4 e5 2. Nf3");
    const afterE4E5 = root.children[0].children[0];
    attachEngineSuggestion(root, afterE4E5.id, { san: "Bc4", uci: "f1c4", cp: 35, mate: null });
    expect(afterE4E5.engineSuggestion).toEqual({ san: "Bc4", uci: "f1c4", cp: 35, mate: null });
  });

  it("lève une erreur si le nœud ciblé n'existe pas — jamais un échec silencieux", () => {
    const root = parseMoveTree("1. e4 e5");
    expect(() => attachEngineSuggestion(root, "introuvable", { san: "Nf3", uci: "g1f3", cp: null, mate: null })).toThrow(/introuvable/);
  });
});
