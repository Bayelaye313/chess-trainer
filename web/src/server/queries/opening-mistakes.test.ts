import { describe, expect, it } from "vitest";
import type { PopularMove } from "@/server/import/lichess-explorer";
import {
  buildDeviationGameSummaries,
  earliestOpeningMistakePerGame,
  filterRealDeviations,
  resolveTheoreticalCorrection,
  type DeviationGameSummary,
  type OpeningMistakeMoveRow,
} from "./opening-mistakes";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
/** Position après 1.e4 — le joueur des Noirs y a le trait. */
const AFTER_E4_FEN = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";

function moveRow(partial: Partial<OpeningMistakeMoveRow>): OpeningMistakeMoveRow {
  return {
    gameId: "game-1",
    ply: 1,
    actualUci: "e2e4",
    actualSan: "e4",
    fenBefore: START_FEN,
    actualQuality: "blunder",
    bestUci: "d2d4",
    bestSan: "d4",
    opponentName: "Adversaire",
    playedAt: new Date("2026-01-01T00:00:00Z"),
    playerColor: "w",
    result: "1-0",
    eco: "C60",
    openingName: "Ruy Lopez (Espagnole)",
    ...partial,
  };
}

describe("resolveTheoreticalCorrection", () => {
  it("propose un embranchement du catalogue curaté quand la position en a un", () => {
    // Après 1.e4, le catalogue curaté connaît plusieurs réponses théoriques
    // (Ruy Lopez, Italienne, etc.) — toutes différentes du coup fautif fourni.
    const correction = resolveTheoreticalCorrection(AFTER_E4_FEN, "a7a6");
    expect(correction).not.toBeNull();
    expect(correction!.uci).not.toBe("a7a6");
  });

  it("retombe sur la base ECO globale quand aucun embranchement curaté ne couvre la position", () => {
    // Position obscure, hors du catalogue curaté restreint, mais où la
    // plupart des coups légaux restent répertoriés par `chess-openings`.
    const correction = resolveTheoreticalCorrection(START_FEN, "a2a3");
    expect(correction).not.toBeNull();
    expect(correction!.uci).not.toBe("a2a3");
  });

  it("exclut toujours le coup fautif lui-même de la correction proposée", () => {
    const correction = resolveTheoreticalCorrection(START_FEN, "e2e4");
    expect(correction?.uci).not.toBe("e2e4");
  });
});

describe("earliestOpeningMistakePerGame", () => {
  it("ne garde que la gaffe au ply le plus petit par partie", () => {
    const rows = [
      moveRow({ gameId: "game-1", ply: 5 }),
      moveRow({ gameId: "game-1", ply: 3 }),
      moveRow({ gameId: "game-1", ply: 7 }),
      moveRow({ gameId: "game-2", ply: 9 }),
    ];

    const result = earliestOpeningMistakePerGame(rows);

    expect(result).toHaveLength(2);
    expect(result.find((r) => r.gameId === "game-1")?.ply).toBe(3);
    expect(result.find((r) => r.gameId === "game-2")?.ply).toBe(9);
  });

  it("renvoie un tableau vide sans lignes", () => {
    expect(earliestOpeningMistakePerGame([])).toEqual([]);
  });
});

describe("buildDeviationGameSummaries", () => {
  it("assemble un résumé complet, catalogue trouvé par code ECO", () => {
    const rows = [moveRow({})];
    const result = buildDeviationGameSummaries(rows, new Map([["game-1", ["e2e4"]]]));

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      gameId: "game-1",
      openingId: "ruy-lopez",
      openingName: "Ruy Lopez (Espagnole)",
      eco: "C60",
      ply: 1,
      actualSan: "e4",
      actualUci: "e2e4",
      leadInUci: ["e2e4"],
    });
    expect(result[0].expectedUci).not.toBe("e2e4");
  });

  it("openingId reste `null` quand le code ECO ne correspond à aucun chapitre du catalogue, mais le résumé reste exploitable", () => {
    const rows = [moveRow({ eco: "A45", openingName: "Une ouverture hors catalogue" })];
    const result = buildDeviationGameSummaries(rows, new Map());

    expect(result).toHaveLength(1);
    expect(result[0].openingId).toBeNull();
    expect(result[0].openingName).toBe("Une ouverture hors catalogue");
    expect(result[0].eco).toBe("A45");
  });

  it("retombe sur `openingName`/`eco` génériques quand la partie n'en portait aucun", () => {
    const rows = [moveRow({ eco: null, openingName: null })];
    const result = buildDeviationGameSummaries(rows, new Map());

    expect(result[0].openingName).toBe("Ouverture non identifiée");
    expect(result[0].eco).toBe("—");
  });

  it("`leadInUci` est vide quand la partie n'apparaît pas dans la carte fournie", () => {
    const rows = [moveRow({ gameId: "game-2" })];
    const result = buildDeviationGameSummaries(rows, new Map([["game-1", ["e2e4"]]]));

    expect(result[0].leadInUci).toEqual([]);
  });

  it("trie les résumés par date décroissante", () => {
    const rows = [
      moveRow({ gameId: "game-old", playedAt: new Date("2026-01-01T00:00:00Z") }),
      moveRow({ gameId: "game-new", playedAt: new Date("2026-06-01T00:00:00Z") }),
    ];

    const result = buildDeviationGameSummaries(rows, new Map());

    expect(result.map((r) => r.gameId)).toEqual(["game-new", "game-old"]);
  });

  it("retombe sur le meilleur coup moteur stocké (`bestUci`/`bestSan`) quand aucune correction théorique n'est trouvable", () => {
    // Position à coup forcé : le roi blanc en h1, en échec de la dame noire en
    // g2, n'a strictement AUCUN autre coup légal que Kxg2 (g1 et h2 sont
    // aussi couverts par la dame) — hors de tout catalogue curaté et hors de
    // toute position ECO. `resolveTheoreticalCorrection` ne trouve donc, par
    // construction, aucune alternative au coup réellement joué : le repli
    // moteur (`bestUci`/`bestSan`) doit tout de même produire un résumé
    // plutôt que d'être silencieusement abandonné.
    const fenBefore = "7k/8/8/8/8/8/6q1/7K w - - 0 1";
    const row = moveRow({ fenBefore, actualUci: "h1g2", actualSan: "Kxg2", bestUci: "h1g2", bestSan: "Kxg2" });
    const result = buildDeviationGameSummaries([row], new Map());

    expect(result).toHaveLength(1);
    expect(result[0].expectedUci).toBe("h1g2");
  });
});

describe("filterRealDeviations", () => {
  function summary(partial: Partial<DeviationGameSummary>): DeviationGameSummary {
    return {
      gameId: "game-1",
      opponentName: "Adversaire",
      playedAt: new Date("2026-01-01T00:00:00Z"),
      playerColor: "w",
      result: "1-0",
      openingId: "ruy-lopez",
      openingName: "Ruy Lopez (Espagnole)",
      eco: "C60",
      ply: 1,
      fenBefore: START_FEN,
      expectedSan: "e4",
      expectedUci: "e2e4",
      actualSan: "d4",
      actualUci: "d2d4",
      actualQuality: "blunder",
      leadInUci: [],
      ...partial,
    };
  }

  it("garde une vraie gaffe qui ne transpose vers aucune ligne de maîtres", () => {
    const deviations = [summary({ actualQuality: "blunder" })];
    const mastersByFen = new Map<string, readonly PopularMove[]>([[START_FEN, []]]);

    expect(filterRealDeviations(deviations, mastersByFen)).toEqual(deviations);
  });

  it("rejette un coup hors script mais SAIN (best/okay/critical/brilliant) — jamais une erreur de répertoire", () => {
    for (const actualQuality of ["best", "okay", "critical", "brilliant", "book"] as const) {
      const deviations = [summary({ actualQuality })];
      const mastersByFen = new Map<string, readonly PopularMove[]>();
      expect(filterRealDeviations(deviations, mastersByFen), actualQuality).toEqual([]);
    }
  });

  it("rejette un coup mauvais qui transpose vers une ligne de maîtres reconnue", () => {
    const deviations = [summary({ actualQuality: "blunder", actualUci: "d2d4" })];
    const mastersByFen = new Map<string, readonly PopularMove[]>([
      [START_FEN, [{ uci: "d2d4", san: "d4", games: 10_000 }]],
    ]);

    expect(filterRealDeviations(deviations, mastersByFen)).toEqual([]);
  });

  it("ne rejette pas un coup mauvais absent des maîtres à cette position précise", () => {
    const deviations = [summary({ actualQuality: "inaccuracy", actualUci: "h2h4" })];
    const mastersByFen = new Map<string, readonly PopularMove[]>([
      [START_FEN, [{ uci: "d2d4", san: "d4", games: 10_000 }]], // un AUTRE coup, sans rapport
    ]);

    expect(filterRealDeviations(deviations, mastersByFen)).toEqual(deviations);
  });
});
