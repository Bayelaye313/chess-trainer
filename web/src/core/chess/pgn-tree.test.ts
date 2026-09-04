import { describe, expect, it } from "vitest";
import { buildTreeFromLines, collectNodes, mainLine, mergeTrees, parsePgnTree } from "./pgn-tree";

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

describe("buildTreeFromLines", () => {
  it("fusionne plusieurs lignes plates en un arbre, embranchant dès qu'elles divergent", () => {
    const root = buildTreeFromLines([
      { label: "Sicilienne", sanMoves: ["e4", "c5"] },
      { label: "Najdorf", sanMoves: ["e4", "c5", "Nf3", "d6"] },
      { label: "Alapine", sanMoves: ["e4", "c5", "c3"] },
    ]);
    const e4 = root.children.find((n) => n.san === "e4")!;
    const c5 = e4.children.find((n) => n.san === "c5")!;
    // "Sicilienne" est la ligne la plus courte : son nœud terminal (c5) ne
    // porte AUCUN enfant à lui — les deux lignes plus longues en ajoutent
    // ensuite, chacune sur son propre embranchement.
    expect(c5.comment).toBe("Sicilienne");
    expect(c5.children.map((n) => n.san).sort()).toEqual(["Nf3", "c3"].sort());

    const alapine = c5.children.find((n) => n.san === "c3")!;
    expect(alapine.comment).toBe("Alapine");
    expect(alapine.children).toEqual([]);

    const najdorf = c5.children.find((n) => n.san === "Nf3")!.children.find((n) => n.san === "d6")!;
    expect(najdorf.comment).toBe("Najdorf");
  });

  it("ne nomme rien pour une ligne interrompue par un coup illégal — jamais tout l'arbre en échec", () => {
    const root = buildTreeFromLines([
      { label: "Cassée", sanMoves: ["e4", "e5", "Xy9"] },
      { label: "Valide", sanMoves: ["e4", "e5"] },
    ]);
    const line = mainLine(root);
    expect(line.map((n) => n.san)).toEqual(["e4", "e5"]);
    expect(line.at(-1)?.comment).toBe("Valide"); // "Cassée" s'est arrêtée avant d'atteindre e5, rien à nommer.
  });

  it("garde le PREMIER nom rencontré à une position donnée, jamais écrasé par une ligne suivante", () => {
    const root = buildTreeFromLines([
      { label: "Premier nom", sanMoves: ["d4"] },
      { label: "Second nom", sanMoves: ["d4"] },
    ]);
    expect(mainLine(root)[0].comment).toBe("Premier nom");
  });

  it("porte le code ECO de la ligne sur son nœud terminal", () => {
    const root = buildTreeFromLines([{ label: "Sicilienne", eco: "B20", sanMoves: ["e4", "c5"] }]);
    expect(mainLine(root).at(-1)?.eco).toBe("B20");
  });
});

describe("mergeTrees", () => {
  it("ajoute un embranchement absent de `base` sans toucher au reste", () => {
    const base = parsePgnTree("1.e4 e5 2.Nf3 Nc6 3.Bb5");
    // Capturé AVANT la fusion : `mainLine` suit le premier enfant à chaque
    // étape, et la fusion en ajoute justement un à ce nœud — le recalculer
    // APRÈS pointerait déjà sur "Nf6", pas sur "Bb5".
    const bb5 = mainLine(base).at(-1)!;
    expect(bb5.san).toBe("Bb5");
    expect(bb5.children).toEqual([]);

    const addition = buildTreeFromLines([{ label: "Berlinoise", sanMoves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"] }]);
    mergeTrees(base, addition);

    expect(bb5.children.map((n) => n.san)).toEqual(["Nf6"]);
    expect(bb5.children[0].comment).toBe("Berlinoise");
  });

  it("ne recouvre jamais un `comment` déjà présent dans `base`", () => {
    // "(1...c5 ...)" remplace le DERNIER coup joué au même niveau (e5) — c5
    // est donc un enfant du nœud "e4", pas de la racine (voir le docstring de
    // `parseSequence`).
    const base = parsePgnTree("1.e4 e5 (1...c5 {Sicilienne authored} 2.Nf3)");
    const addition = buildTreeFromLines([{ label: "Sicilienne DB", sanMoves: ["e4", "c5"] }]);
    mergeTrees(base, addition);

    const e4 = base.children.find((n) => n.san === "e4")!;
    const c5 = e4.children.find((n) => n.san === "c5")!;
    expect(c5.comment).toBe("Sicilienne authored");
  });

  it("fusionne récursivement à travers plusieurs niveaux communs", () => {
    const base = buildTreeFromLines([{ label: "A", sanMoves: ["e4", "c5", "Nf3"] }]);
    // Capturé AVANT la fusion, même raison que le premier test de ce bloc.
    const nf3 = mainLine(base).at(-1)!;
    expect(nf3.comment).toBe("A");
    expect(nf3.children).toEqual([]);

    const addition = buildTreeFromLines([{ label: "B", sanMoves: ["e4", "c5", "Nf3", "d6"] }]);
    mergeTrees(base, addition);

    expect(nf3.comment).toBe("A"); // jamais recouvert
    expect(nf3.children.map((n) => n.san)).toEqual(["d6"]);
    expect(nf3.children[0].comment).toBe("B");
  });
});
