import { describe, expect, it } from "vitest";
import { mainLine } from "@/core/chess/pgn-tree";
import { findOpening, OPENINGS } from "@/core/curriculum/openings";
import { getCuratedChildren, getGlobalCurriculumIndex, getOpeningTree } from "./opening-tree-index";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("getOpeningTree", () => {
  it("synthétise un arbre strictement linéaire pour un chapitre sans `pgn`", () => {
    const scandinavian = findOpening("scandinavian")!;
    expect(scandinavian.pgn).toBeUndefined();
    const tree = getOpeningTree(scandinavian);
    const line = mainLine(tree);
    expect(line.map((n) => n.san)).toEqual(scandinavian.moves);
    expect(line.every((n) => n.children.length <= 1)).toBe(true);
  });

  it("parse l'arbre authored d'un chapitre enrichi, embranchements compris", () => {
    const ruyLopez = findOpening("ruy-lopez")!;
    const tree = getOpeningTree(ruyLopez);
    const nodes = mainLine(tree);
    const bb5 = nodes.find((n) => n.san === "Bb5")!;
    expect(bb5.children.length).toBeGreaterThan(1);
  });
});

describe("getGlobalCurriculumIndex / getCuratedChildren", () => {
  it("connaît les deux premiers coups théoriques depuis la position de départ", () => {
    const children = getCuratedChildren(START_FEN);
    const sans = children.map((c) => c.san);
    expect(sans).toContain("e4");
    expect(sans).toContain("d4");
  });

  it("expose l'embranchement de la Ruy Lopez (a6 ET Nf6 depuis la position après 3.Bb5)", () => {
    const ruyLopez = findOpening("ruy-lopez")!;
    const tree = getOpeningTree(ruyLopez);
    const bb5 = mainLine(tree).find((n) => n.san === "Bb5")!;
    const children = getCuratedChildren(bb5.fen);
    const sans = children.map((c) => c.san);
    expect(sans).toContain("a6");
    expect(sans).toContain("Nf6");
    const berlin = children.find((c) => c.san === "Nf6");
    expect(berlin?.variationName).toMatch(/Berlin/i);
  });

  it("renvoie [] pour une position totalement hors du catalogue", () => {
    const deepMiddlegame = "r2qk2r/ppp2ppp/2n1bn2/3p4/3P4/2N1BN2/PPP2PPP/R2QK2R w KQkq - 4 9";
    expect(getCuratedChildren(deepMiddlegame)).toEqual([]);
  });

  it("indexe une entrée par ouverture du catalogue (racine comprise)", () => {
    const index = getGlobalCurriculumIndex();
    const startMatches = index.get(START_FEN);
    expect(startMatches?.length).toBe(OPENINGS.length);
  });
});
