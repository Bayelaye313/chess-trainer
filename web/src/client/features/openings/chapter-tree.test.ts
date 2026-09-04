import { describe, expect, it } from "vitest";
import { allNodeKeys, ancestorPathsToActive, buildChapterTree, countChapters } from "./chapter-tree";

function variation(name: string, sanMoves: string[] = ["e4"]) {
  return { eco: "B90", name, sanMoves, uciMoves: sanMoves.map((s) => `${s}?`) };
}

describe("buildChapterTree", () => {
  it("dégénère en liste plate quand aucun nom ne contient de virgule (chapitres curatés)", () => {
    const tree = buildChapterTree([variation("Défense Berlinoise"), variation("Défense Steinitz")]);
    expect(tree.map((n) => n.label)).toEqual(["Défense Berlinoise", "Défense Steinitz"]);
    expect(tree.every((n) => n.children.length === 0 && n.variation !== null)).toBe(true);
  });

  it("regroupe les entrées qui partagent un préfixe de virgule sous un même en-tête", () => {
    const tree = buildChapterTree([
      variation("Najdorf Variation, English Attack"),
      variation("Najdorf Variation, Adams Attack"),
      variation("Dragon Variation"),
    ]);
    expect(tree.map((n) => n.label).sort()).toEqual(["Dragon Variation", "Najdorf Variation"].sort());

    const najdorf = tree.find((n) => n.label === "Najdorf Variation")!;
    // Aucune ligne DB ne s'arrête pile sur "Najdorf Variation" seul ici — pur en-tête, pas jouable.
    expect(najdorf.variation).toBeNull();
    expect(najdorf.children.map((n) => n.label).sort()).toEqual(["Adams Attack", "English Attack"].sort());

    const dragon = tree.find((n) => n.label === "Dragon Variation")!;
    expect(dragon.variation).not.toBeNull();
    expect(dragon.children).toEqual([]);
  });

  it("pose la variante sur son propre nœud QUAND une ligne DB s'arrête pile sur un en-tête de groupe", () => {
    const tree = buildChapterTree([
      variation("Najdorf Variation"),
      variation("Najdorf Variation, English Attack"),
    ]);
    const najdorf = tree.find((n) => n.label === "Najdorf Variation")!;
    expect(najdorf.variation?.name).toBe("Najdorf Variation");
    expect(najdorf.children.map((n) => n.label)).toEqual(["English Attack"]);
  });
});

describe("countChapters", () => {
  it("compte les variantes jouables sous un en-tête de groupe, lui-même compris s'il en est une", () => {
    const tree = buildChapterTree([
      variation("Najdorf Variation, English Attack"),
      variation("Najdorf Variation, Adams Attack"),
      variation("Najdorf Variation"),
    ]);
    const najdorf = tree.find((n) => n.label === "Najdorf Variation")!;
    expect(countChapters(najdorf)).toBe(3); // lui-même + les deux enfants
  });
});

describe("allNodeKeys", () => {
  it("renvoie une clé par nœud, racine et sous-arbres compris", () => {
    const tree = buildChapterTree([variation("Najdorf Variation, English Attack"), variation("Dragon Variation")]);
    expect(allNodeKeys(tree).sort()).toEqual(
      ["Najdorf Variation", "Najdorf Variation␟English Attack", "Dragon Variation"].sort(),
    );
  });
});

describe("ancestorPathsToActive", () => {
  const keyOf = (v: { eco: string; name: string }) => `${v.eco}|${v.name}`;

  it("renvoie [] sans clé active", () => {
    const tree = buildChapterTree([variation("Dragon Variation")]);
    expect(ancestorPathsToActive(tree, null, keyOf)).toEqual([]);
  });

  it("renvoie le chemin des en-têtes à déplier pour révéler le chapitre actif", () => {
    const tree = buildChapterTree([
      variation("Najdorf Variation, English Attack"),
      variation("Najdorf Variation, Adams Attack"),
    ]);
    const englishAttack = tree[0].children.find((n) => n.label === "English Attack")!.variation!;
    const paths = ancestorPathsToActive(tree, keyOf(englishAttack), keyOf);
    expect(paths).toEqual(["Najdorf Variation"]);
  });
});
