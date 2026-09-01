import { describe, expect, it } from "vitest";
import { collectNodes, mainLine, parsePgnTree } from "./pgn-tree";

describe("parsePgnTree", () => {
  it("parse une ligne plate sans variante", () => {
    const root = parsePgnTree("1.e4 e5 2.Nf3 Nc6 3.Bb5");
    const line = mainLine(root);
    expect(line.map((n) => n.san)).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5"]);
    expect(line.map((n) => n.ply)).toEqual([1, 2, 3, 4, 5]);
    expect(line.every((n) => n.uci)).toBe(true);
    expect(line.at(-1)?.fen.split(" ")[1]).toBe("b");
  });

  it("rattache une variante comme un embranchement FRÈRE, pas un enfant", () => {
    const root = parsePgnTree("1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 (3...Nf6 4.O-O)");
    const line = mainLine(root);
    expect(line.map((n) => n.san)).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"]);

    // Le nœud "Bb5" doit avoir deux enfants : "a6" (ligne principale) et "Nf6" (variante).
    const bb5 = line[4];
    expect(bb5.san).toBe("Bb5");
    expect(bb5.children.map((n) => n.san).sort()).toEqual(["Nf6", "a6"].sort());

    const nf6 = bb5.children.find((n) => n.san === "Nf6")!;
    expect(nf6.children.map((n) => n.san)).toEqual(["O-O"]);
  });

  it("gère plusieurs variantes sœurs consécutives après le même coup", () => {
    const root = parsePgnTree("1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 (4...d6 5.O-O) (4...b5 5.Bb3)");
    const line = mainLine(root);
    const ba4 = line.find((n) => n.san === "Ba4")!;
    expect(ba4.children.map((n) => n.san).sort()).toEqual(["Nf6", "b5", "d6"].sort());
    expect(ba4.children.find((n) => n.san === "d6")?.children.map((n) => n.san)).toEqual(["O-O"]);
    expect(ba4.children.find((n) => n.san === "b5")?.children.map((n) => n.san)).toEqual(["Bb3"]);
  });

  it("gère des variantes imbriquées (parenthèse dans une parenthèse)", () => {
    const root = parsePgnTree("1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 (3...Nf6 4.O-O (4.Nxe5 Nxe4) 4...Nxe4)");
    const line = mainLine(root);
    const bb5 = line.find((n) => n.san === "Bb5")!;
    const nf6 = bb5.children.find((n) => n.san === "Nf6")!;
    expect(nf6.children.map((n) => n.san).sort()).toEqual(["Nxe5", "O-O"].sort());
    const oo = nf6.children.find((n) => n.san === "O-O")!;
    expect(oo.children.map((n) => n.san)).toEqual(["Nxe4"]);
    const nxe5 = nf6.children.find((n) => n.san === "Nxe5")!;
    expect(nxe5.children.map((n) => n.san)).toEqual(["Nxe4"]);
  });

  it("capture un commentaire comme nom de la sous-variante", () => {
    const root = parsePgnTree("1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 (3...Nf6 {Défense Berlinoise} 4.O-O)");
    const line = mainLine(root);
    const bb5 = line.find((n) => n.san === "Bb5")!;
    const nf6 = bb5.children.find((n) => n.san === "Nf6")!;
    expect(nf6.comment).toBe("Défense Berlinoise");
  });

  it("ignore numéros de coup, NAG et résultat final", () => {
    const root = parsePgnTree("1.e4! e5 2.Nf3 $1 Nc6 1-0");
    const line = mainLine(root);
    expect(line.map((n) => n.san)).toEqual(["e4", "e5", "Nf3", "Nc6"]);
  });

  it("lève une erreur explicite sur un coup illégal", () => {
    expect(() => parsePgnTree("1.e4 e5 2.Nf3 Nc9")).toThrow(/coup illégal/);
  });

  it("part d'un FEN personnalisé quand fourni", () => {
    const afterE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    const root = parsePgnTree("1...e5 2.Nf3", afterE4);
    expect(mainLine(root).map((n) => n.san)).toEqual(["e5", "Nf3"]);
  });
});

describe("collectNodes", () => {
  it("retourne tous les nœuds, racine comprise, embranchements inclus", () => {
    const root = parsePgnTree("1.e4 e5 (1...c5 2.Nf3)");
    const nodes = collectNodes(root);
    expect(nodes).toContain(root);
    expect(nodes.map((n) => n.san).filter(Boolean).sort()).toEqual(["Nf3", "c5", "e4", "e5"].sort());
  });
});
