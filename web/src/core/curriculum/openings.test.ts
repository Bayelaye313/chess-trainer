import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { annotateTree, collectNodes, mainLine, nodeAtSanPath, parsePgnTree } from "../chess/pgn-tree";
import { findOpening, OPENINGS } from "./openings";

describe("OPENINGS", () => {
  it("a des identifiants uniques", () => {
    const ids = OPENINGS.map((opening) => opening.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("n'a que des lignes de coups légalement jouables", () => {
    for (const opening of OPENINGS) {
      const chess = new Chess();
      for (const san of opening.moves) {
        expect(() => chess.move(san), `${opening.id}: coup illégal "${san}"`).not.toThrow();
      }
    }
  });

  it("a au moins un coup par ligne", () => {
    for (const opening of OPENINGS) {
      expect(opening.moves.length, opening.id).toBeGreaterThan(0);
    }
  });

  it("a un code ECO au format standard (une lettre A-E suivie de deux chiffres)", () => {
    for (const opening of OPENINGS) {
      expect(opening.eco, opening.id).toMatch(/^[A-E]\d\d$/);
    }
  });
});

describe("OPENINGS avec arbre PGN enrichi", () => {
  const withPgn = OPENINGS.filter((opening) => opening.pgn);

  it("en enrichit au moins une poignée (pas une régression silencieuse vers 0)", () => {
    expect(withPgn.length).toBeGreaterThanOrEqual(5);
  });

  it("parse sans erreur, et sa ligne principale préfixe exactement `moves`", () => {
    for (const opening of withPgn) {
      const tree = parsePgnTree(opening.pgn!);
      const line = mainLine(tree).slice(0, opening.moves.length).map((n) => n.san);
      expect(line, opening.id).toEqual(opening.moves);
    }
  });

  it("contient réellement au moins un embranchement (plus d'un enfant quelque part)", () => {
    for (const opening of withPgn) {
      const tree = parsePgnTree(opening.pgn!);
      let hasBranch = false;
      const stack = [tree];
      while (stack.length > 0) {
        const node = stack.pop()!;
        if (node.children.length > 1) hasBranch = true;
        stack.push(...node.children);
      }
      expect(hasBranch, opening.id).toBe(true);
    }
  });
});

describe("OPENINGS avec annotations (philosophy/strategicObjective/engineSuggestion)", () => {
  const withAnnotations = OPENINGS.filter((opening) => opening.annotations);

  it("en enrichit au moins une (pas une régression silencieuse vers 0)", () => {
    expect(withAnnotations.length).toBeGreaterThanOrEqual(1);
  });

  it("chaque chemin SAN se résout réellement sur l'arbre de son propre chapitre", () => {
    for (const opening of withAnnotations) {
      const tree = parsePgnTree(opening.pgn!);
      expect(() => annotateTree(tree, opening.annotations!), opening.id).not.toThrow();
    }
  });

  it("scotch-game : au moins un nœud de chacun des 4 blocs (Göring, Gambit Écossais, Classique, Mieses & Schmidt) porte une philosophy ou un strategicObjective", () => {
    const opening = findOpening("scotch-game")!;
    const tree = parsePgnTree(opening.pgn!);
    annotateTree(tree, opening.annotations!);
    const annotated = collectNodes(tree).filter((n) => n.philosophy !== null || n.strategicObjective !== null);
    expect(annotated.length).toBeGreaterThanOrEqual(4 * 5);
  });

  it("scotch-game : la branche 4.Bc4 (Gambit Écossais) existe, aux côtés de 4.Nxd4/4.c3", () => {
    const opening = findOpening("scotch-game")!;
    const tree = parsePgnTree(opening.pgn!);
    const afterExd4 = nodeAtSanPath(tree, ["e4", "e5", "Nf3", "Nc6", "d4", "exd4"]);
    expect(afterExd4.children.map((c) => c.san).sort()).toEqual(["Bc4", "Nxd4", "c3"].sort());
  });

  // Sprint « Scotch Traps Pipeline » (2026-09-13) : les blocs A (Göring) et B
  // (Gambit Écossais) sont désormais sourcés jusqu'au coup 14/15 (voir le
  // docstring de `SCOTCH_GAME_ANNOTATIONS`) — au-delà de l'ancien plafond de
  // 9-12 coups, sans jamais perdre les sous-variantes déjà présentes.
  it("scotch-game : le bloc Göring (4.c3) atteint le coup 14 sur sa vraie ligne principale (9...Nxe5, sourcée fsQlSpVh), tout en gardant 9...d5 comme sous-variante", () => {
    const opening = findOpening("scotch-game")!;
    const tree = parsePgnTree(opening.pgn!);
    annotateTree(tree, opening.annotations!);
    const mainLineNode = nodeAtSanPath(tree, [
      "e4", "e5", "Nf3", "Nc6", "d4", "exd4", "c3", "dxc3", "Nxc3", "Bb4", "Bc4", "d6", "O-O", "Bxc3", "bxc3", "Nf6", "e5", "Nxe5",
      "Nxe5", "dxe5", "Qb3", "Qe7", "Ba3", "c5", "Bb5+", "Kf8", "c4",
    ]);
    expect(mainLineNode.san).toBe("c4");
    expect(mainLineNode.strategicObjective ?? mainLineNode.philosophy).not.toBeNull();

    const sideline = nodeAtSanPath(tree, [
      "e4", "e5", "Nf3", "Nc6", "d4", "exd4", "c3", "dxc3", "Nxc3", "Bb4", "Bc4", "d6", "O-O", "Bxc3", "bxc3", "Nf6", "e5", "d5",
      "Bd3", "Ne4", "Bxe4", "dxe4", "Qxd8+", "Kxd8",
    ]);
    expect(sideline.san).toBe("Kxd8");
  });

  it("scotch-game : le bloc Gambit Écossais (4.Bc4) atteint le coup 15 sur sa ligne principale (sourcée UMNISCeS/AujagS6s), avec ses 3 sous-variantes citées", () => {
    const opening = findOpening("scotch-game")!;
    const tree = parsePgnTree(opening.pgn!);
    annotateTree(tree, opening.annotations!);
    const mainLineNode = nodeAtSanPath(tree, [
      "e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Nf6", "e5", "d5", "Bb5", "Ne4", "Nxd4", "Bd7", "Bxc6", "bxc6", "O-O", "Bc5",
      "f3", "Ng5", "f4", "Ne4", "Be3", "O-O", "Nd2", "Nxd2", "Qxd2", "Bb6", "Nb3",
    ]);
    expect(mainLineNode.san).toBe("Nb3");
    expect(mainLineNode.philosophy).not.toBeNull();

    for (const path of [
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Nf6", "e5", "d5", "Bb5", "Ne4", "Nxd4", "Bd7", "Bxc6", "Bxc6"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Nf6", "e5", "d5", "Bb5", "Ne4", "Nxd4", "Bd7", "Bxc6", "bxc6", "O-O", "Bc5", "f3", "Bxd4+"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Nf6", "e5", "d5", "Bb5", "Ne4", "Nxd4", "Bd7", "Bxc6", "bxc6", "O-O", "Bc5", "f3", "Ng5", "f4", "Ne6", "c3"],
    ]) {
      expect(() => nodeAtSanPath(tree, path), path.join(" ")).not.toThrow();
    }
  });
});

describe("findOpening", () => {
  it("retrouve une ouverture par son slug", () => {
    expect(findOpening("ruy-lopez")?.name).toBe("Ruy Lopez (Espagnole)");
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(findOpening("does-not-exist")).toBeNull();
  });
});
