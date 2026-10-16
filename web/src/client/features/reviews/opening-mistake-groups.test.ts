import { describe, expect, it } from "vitest";
import type { DeviationGameSummaryDto } from "@/server/actions/practice";
import { flattenMistakes, groupMistakesByFamily, splitOpeningName } from "./opening-mistake-groups";

function game(partial: Partial<DeviationGameSummaryDto>): DeviationGameSummaryDto {
  return {
    gameId: "game-1",
    opponentName: "Adversaire",
    playedAt: "2026-08-01T00:00:00.000Z",
    playerColor: "w",
    result: "1-0",
    openingId: null,
    openingName: "Ruy Lopez: Berlin Defense, Rio de Janeiro Variation",
    eco: "C67",
    ply: 5,
    fenBefore: "fen-a",
    expectedSan: "Bxc6",
    expectedUci: "b5c6",
    actualSan: "O-O",
    actualUci: "e1g1",
    actualQuality: "inaccuracy",
    leadInUci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"],
    ...partial,
  };
}

describe("splitOpeningName", () => {
  it("sépare famille et sous-variante quand le nom contient un ':'", () => {
    expect(splitOpeningName("Ruy Lopez: Berlin Defense, Rio de Janeiro Variation")).toEqual({
      family: "Ruy Lopez",
      subVariation: "Berlin Defense",
    });
  });

  it("sous-variante sans virgule derrière ':' — tout le reste après ':'", () => {
    expect(splitOpeningName("Sicilian Defense: Najdorf Variation")).toEqual({
      family: "Sicilian Defense",
      subVariation: "Najdorf Variation",
    });
  });

  it("aucun ':' — famille seule, pas de sous-variante", () => {
    expect(splitOpeningName("Scotch Game")).toEqual({ family: "Scotch Game", subVariation: null });
  });
});

describe("groupMistakesByFamily", () => {
  it("regroupe deux parties de la même famille mais de sous-variantes différentes sous UN SEUL groupe famille", () => {
    const games = [
      game({ fenBefore: "fen-a", actualUci: "e1g1", openingName: "Ruy Lopez: Berlin Defense" }),
      game({
        gameId: "game-2",
        fenBefore: "fen-b",
        actualUci: "d2d3",
        openingName: "Ruy Lopez: Morphy Defense, Anderssen Variation",
      }),
    ];
    const groups = groupMistakesByFamily(games, new Set());

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Ruy Lopez");
    expect(groups[0].subVariations.map((s) => s.label).sort()).toEqual(["Berlin Defense", "Morphy Defense"]);
    expect(groups[0].totalMistakes).toBe(2);
  });

  it("deux parties qui répètent EXACTEMENT la même déviation (même fenBefore + actualUci) restent une seule erreur, avec son compteur", () => {
    const games = [
      game({ gameId: "game-1", fenBefore: "fen-a", actualUci: "e1g1" }),
      game({ gameId: "game-2", fenBefore: "fen-a", actualUci: "e1g1" }),
    ];
    const groups = groupMistakesByFamily(games, new Set());

    expect(groups[0].subVariations[0].mistakes).toHaveLength(1);
    expect(groups[0].subVariations[0].mistakes[0].gameCount).toBe(2);
  });

  it("une déviation à une position/coup différents reste distincte, même dans la même sous-variante", () => {
    const games = [
      game({ gameId: "game-1", fenBefore: "fen-a", actualUci: "e1g1", ply: 5 }),
      game({ gameId: "game-2", fenBefore: "fen-c", actualUci: "d2d4", ply: 7 }),
    ];
    const groups = groupMistakesByFamily(games, new Set());

    expect(groups[0].subVariations[0].mistakes).toHaveLength(2);
  });

  it("une ouverture sans sous-variante nommée tombe dans le seau « Ligne principale »", () => {
    const games = [game({ openingName: "Scotch Game" })];
    const groups = groupMistakesByFamily(games, new Set());

    expect(groups[0].label).toBe("Scotch Game");
    expect(groups[0].subVariations[0].label).toBe("Ligne principale");
  });

  it("marque `reviewed` d'après le Set de clés déjà corrigées, et compte le total au niveau famille", () => {
    const games = [
      game({ gameId: "game-1", fenBefore: "fen-a", actualUci: "e1g1" }),
      game({ gameId: "game-2", fenBefore: "fen-b", actualUci: "d2d3", openingName: "Ruy Lopez: Morphy Defense" }),
    ];
    const groups = groupMistakesByFamily(games, new Set(["fen-a|e1g1"]));

    const allMistakes = groups[0].subVariations.flatMap((s) => s.mistakes);
    expect(allMistakes.find((m) => m.key === "fen-a|e1g1")?.reviewed).toBe(true);
    expect(allMistakes.find((m) => m.key === "fen-b|d2d3")?.reviewed).toBe(false);
    expect(groups[0].reviewedCount).toBe(1);
  });

  it("normalise la criticité sur l'erreur la plus répétée de TOUT le journal, pas seulement de son groupe", () => {
    const games = [
      // Ruy Lopez : la même déviation répétée 3 fois — le pire du journal.
      game({ gameId: "g1", fenBefore: "fen-a", actualUci: "a" }),
      game({ gameId: "g2", fenBefore: "fen-a", actualUci: "a" }),
      game({ gameId: "g3", fenBefore: "fen-a", actualUci: "a" }),
      // Scotch Game : une seule occurrence, groupe famille différent.
      game({ gameId: "g4", fenBefore: "fen-b", actualUci: "b", openingName: "Scotch Game" }),
    ];
    const groups = groupMistakesByFamily(games, new Set());
    const flat = flattenMistakes(groups);

    expect(flat.find((m) => m.key === "fen-a|a")?.criticality).toBe(1);
    expect(flat.find((m) => m.key === "fen-b|b")?.criticality).toBeCloseTo(1 / 3);
  });

  it("trie les erreurs d'une sous-variante par occurrences décroissantes puis par ply croissant", () => {
    const games = [
      game({ gameId: "g1", fenBefore: "fen-a", actualUci: "a", ply: 9 }),
      game({ gameId: "g2", fenBefore: "fen-b", actualUci: "b", ply: 3 }),
      game({ gameId: "g3", fenBefore: "fen-b", actualUci: "b", ply: 3 }),
    ];
    const groups = groupMistakesByFamily(games, new Set());
    const mistakes = groups[0].subVariations[0].mistakes;

    expect(mistakes[0].key).toBe("fen-b|b"); // gameCount 2, passe devant malgré un ply plus petit
    expect(mistakes[0].gameCount).toBe(2);
    expect(mistakes[1].key).toBe("fen-a|a");
  });
});

describe("flattenMistakes", () => {
  it("aplatit famille → sous-variante → erreurs dans l'ordre du rendu", () => {
    const games = [
      game({ gameId: "g1", fenBefore: "fen-a", actualUci: "a", openingName: "Ruy Lopez: Berlin Defense" }),
      game({ gameId: "g2", fenBefore: "fen-b", actualUci: "b", openingName: "Ruy Lopez: Morphy Defense" }),
      game({ gameId: "g3", fenBefore: "fen-c", actualUci: "c", openingName: "Scotch Game" }),
    ];
    const groups = groupMistakesByFamily(games, new Set());
    const flat = flattenMistakes(groups);

    expect(flat.map((m) => m.key)).toEqual(["fen-a|a", "fen-b|b", "fen-c|c"]);
  });

  it("liste vide pour aucun groupe", () => {
    expect(flattenMistakes([])).toEqual([]);
  });
});
