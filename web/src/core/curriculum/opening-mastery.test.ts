import { describe, expect, it } from "vitest";
import { findNextUnmasteredVariation, isMasteredAccuracy, starsForAccuracy } from "./opening-mastery";

describe("starsForAccuracy", () => {
  it("100% = 3 étoiles", () => {
    expect(starsForAccuracy(100)).toBe(3);
  });

  it("> 80% = 2 étoiles", () => {
    expect(starsForAccuracy(81)).toBe(2);
    expect(starsForAccuracy(95)).toBe(2);
  });

  it("> 50% = 1 étoile", () => {
    expect(starsForAccuracy(51)).toBe(1);
    expect(starsForAccuracy(80)).toBe(1);
  });

  it("<= 50% (dont 0, jamais pratiqué) = aucune étoile", () => {
    expect(starsForAccuracy(50)).toBe(0);
    expect(starsForAccuracy(0)).toBe(0);
  });
});

describe("isMasteredAccuracy", () => {
  it("seul 100% est considéré maîtrisé", () => {
    expect(isMasteredAccuracy(100)).toBe(true);
    expect(isMasteredAccuracy(99)).toBe(false);
  });
});

describe("findNextUnmasteredVariation", () => {
  const entries = [
    { key: "main_line", label: "Ligne principale" },
    { key: "a|Var A", label: "Var A" },
    { key: "b|Var B", label: "Var B" },
    { key: "c|Var C", label: "Var C" },
  ];

  it("passe à la variante suivante non maîtrisée", () => {
    const accuracy = new Map([
      ["main_line", 100],
      ["a|Var A", 40],
    ]);
    expect(findNextUnmasteredVariation(entries, accuracy, "main_line")).toEqual(entries[1]);
  });

  it("saute les variantes déjà maîtrisées (100%) pour n'en proposer qu'une non maîtrisée", () => {
    const accuracy = new Map([
      ["main_line", 100],
      ["a|Var A", 100],
      ["b|Var B", 60],
    ]);
    expect(findNextUnmasteredVariation(entries, accuracy, "main_line")).toEqual(entries[2]);
  });

  it("boucle sur le début de la liste après la dernière entrée", () => {
    const accuracy = new Map([["main_line", 30]]);
    expect(findNextUnmasteredVariation(entries, accuracy, "c|Var C")).toEqual(entries[0]);
  });

  it("une variante jamais pratiquée (absente de la map) compte comme non maîtrisée", () => {
    const accuracy = new Map<string, number>();
    expect(findNextUnmasteredVariation(entries, accuracy, "main_line")).toEqual(entries[1]);
  });

  it("renvoie null si tout le catalogue restant est déjà à 100%", () => {
    const accuracy = new Map([
      ["main_line", 100],
      ["a|Var A", 100],
      ["b|Var B", 100],
      ["c|Var C", 100],
    ]);
    expect(findNextUnmasteredVariation(entries, accuracy, "main_line")).toBeNull();
  });

  it("renvoie null sur une liste vide", () => {
    expect(findNextUnmasteredVariation([], new Map(), "main_line")).toBeNull();
  });
});
