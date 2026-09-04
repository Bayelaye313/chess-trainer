import { describe, expect, it } from "vitest";
import {
  aggregatePlayerProgress,
  computeHangingPieceStats,
  computeOpeningPerformance,
  computePhaseAccuracy,
  computeTacticalMotifStats,
  filterOpeningPerformanceForDisplay,
  findStrugglingOpening,
  MIN_GAMES_IN_OPENING_TABLE,
  UNKNOWN_OPENING_NAME,
} from "./progress-insights";
import type { OpeningPerformance, PlayerGameRecord, PlayerMoveRecord } from "./types";

/** Coup minimal, valeurs par défaut neutres — chaque test ne précise que ce qui compte. */
function move(partial: Partial<PlayerMoveRecord>): PlayerMoveRecord {
  return {
    fenBefore: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
    uci: "e1d1",
    ply: 1,
    quality: "best",
    phase: "middlegame",
    motifs: [],
    motifFound: false,
    byPlayer: true,
    ...partial,
  };
}

function game(partial: Partial<PlayerGameRecord>): PlayerGameRecord {
  return {
    eco: null,
    openingName: null,
    result: null,
    playerColor: "w",
    moves: [],
    ...partial,
  };
}

describe("computePhaseAccuracy", () => {
  it("répartit par phase et calcule une précision indépendante par phase", () => {
    const result = computePhaseAccuracy([
      move({ phase: "opening", quality: "best" }),
      move({ phase: "opening", quality: "best" }),
      move({ phase: "middlegame", quality: "blunder" }),
    ]);

    expect(result.opening).toEqual({ phase: "opening", movesAnalysed: 2, accuracy: 100 });
    expect(result.middlegame).toEqual({ phase: "middlegame", movesAnalysed: 1, accuracy: 5 });
    expect(result.endgame).toEqual({ phase: "endgame", movesAnalysed: 0, accuracy: null });
  });

  it("renvoie les trois phases à zéro sans coup du tout", () => {
    const result = computePhaseAccuracy([]);
    expect(result.opening.movesAnalysed).toBe(0);
    expect(result.opening.accuracy).toBeNull();
    expect(result.middlegame.accuracy).toBeNull();
    expect(result.endgame.accuracy).toBeNull();
  });
});

describe("computeTacticalMotifStats", () => {
  it("sépare trouvé et manqué, par motif suivi", () => {
    const result = computeTacticalMotifStats([
      move({ motifs: ["fork"], motifFound: true }),
      move({ motifs: ["fork"], motifFound: false }),
      move({ motifs: ["pin"], motifFound: true }),
      move({ motifs: [], motifFound: false }), // aucun motif : ignoré
      move({ motifs: ["skewer"], motifFound: true }), // motif non suivi par cet axe : ignoré
    ]);

    expect(result.fork).toEqual({ motif: "fork", found: 1, missed: 1, successRate: 50 });
    expect(result.pin).toEqual({ motif: "pin", found: 1, missed: 0, successRate: 100 });
  });

  it("renvoie un taux nul quand l'occasion ne s'est jamais présentée", () => {
    const result = computeTacticalMotifStats([move({ motifs: [], motifFound: false })]);
    expect(result.fork).toEqual({ motif: "fork", found: 0, missed: 0, successRate: null });
  });

  it("compte les deux motifs quand le même coup les cumule", () => {
    // Cas limite documenté dans progress-insights.ts : `motifFound` est un
    // seul booléen par coup, pas un par motif.
    const result = computeTacticalMotifStats([move({ motifs: ["fork", "pin"], motifFound: true })]);
    expect(result.fork.found).toBe(1);
    expect(result.pin.found).toBe(1);
  });
});

describe("computeOpeningPerformance", () => {
  it("agrège victoires, taux et précision par ECO, ignore les parties sans ECO", () => {
    const games: PlayerGameRecord[] = [
      game({
        eco: "B01",
        openingName: "Scandinavian Defense",
        result: "1-0",
        playerColor: "w",
        moves: [move({ quality: "best", byPlayer: true })],
      }),
      game({
        eco: "B01",
        openingName: "Scandinavian Defense",
        result: "0-1",
        playerColor: "w",
        moves: [move({ quality: "blunder", byPlayer: true })],
      }),
      game({
        eco: "C50",
        openingName: "Italian Game",
        result: "1/2-1/2",
        playerColor: "b",
        moves: [move({ quality: "okay", byPlayer: true })],
      }),
      game({ eco: null, result: "1-0", playerColor: "w" }),
    ];

    const result = computeOpeningPerformance(games);

    expect(result).toHaveLength(2);
    // Triée par nombre de parties décroissant : B01 (2) avant C50 (1).
    expect(result[0]).toEqual({
      eco: "B01",
      name: "Scandinavian Defense",
      gamesPlayed: 2,
      wins: 1,
      winRate: 50,
      accuracy: 53,
      avgMistakePly: null, // les deux coups sont en phase "middlegame" (défaut de la fixture), pas "opening"
    });
    expect(result[1]).toEqual({
      eco: "C50",
      name: "Italian Game",
      gamesPlayed: 1,
      wins: 0,
      winRate: 0,
      accuracy: 85,
      avgMistakePly: null,
    });
  });

  it("ne compte jamais une nulle ou une partie sans résultat comme une victoire", () => {
    const result = computeOpeningPerformance([
      game({ eco: "A00", result: "1/2-1/2", playerColor: "w" }),
      game({ eco: "A00", result: null, playerColor: "w" }),
    ]);
    expect(result[0].wins).toBe(0);
  });

  it("retient le nom le plus fréquent du groupe, à égalité le premier rencontré", () => {
    const result = computeOpeningPerformance([
      game({ eco: "C44", openingName: "Ponziani Opening" }),
      game({ eco: "C44", openingName: "Scotch Game" }),
      game({ eco: "C44", openingName: "Ponziani Opening" }),
    ]);
    expect(result[0].name).toBe("Ponziani Opening");
  });

  it("retombe sur le nom par défaut si aucune partie du groupe n'a de nom", () => {
    const result = computeOpeningPerformance([game({ eco: "A00", openingName: null })]);
    expect(result[0].name).toBe("Ouverture personnalisée / Non répertoriée");
  });

  it("calcule le ply moyen de la première gaffe d'ouverture, une seule par partie", () => {
    const result = computeOpeningPerformance([
      game({
        eco: "B01",
        moves: [
          // Deux gaffes d'ouverture dans la même partie : seule la première (ply 5) compte.
          move({ phase: "opening", quality: "blunder", ply: 5 }),
          move({ phase: "opening", quality: "inaccuracy", ply: 9 }),
          move({ phase: "middlegame", quality: "blunder", ply: 20 }), // hors phase d'ouverture : ignoré
        ],
      }),
      game({
        eco: "B01",
        moves: [move({ phase: "opening", quality: "blunder", ply: 7 })],
      }),
      game({
        eco: "B01",
        moves: [move({ phase: "opening", quality: "best", ply: 3 })], // coup sain : aucune gaffe dans cette partie
      }),
    ]);

    // Moyenne sur les DEUX parties qui en comptent une : (5 + 7) / 2 = 6.
    expect(result[0].avgMistakePly).toBe(6);
  });

  it("ne compte jamais un coup de l'adversaire dans le ply moyen de gaffe", () => {
    const result = computeOpeningPerformance([
      game({ eco: "B01", moves: [move({ phase: "opening", quality: "blunder", ply: 5, byPlayer: false })] }),
    ]);
    expect(result[0].avgMistakePly).toBeNull();
  });
});

describe("filterOpeningPerformanceForDisplay", () => {
  function performance(partial: Partial<OpeningPerformance>): OpeningPerformance {
    return { eco: "A00", name: "Test", gamesPlayed: 5, wins: 2, winRate: 40, accuracy: 70, avgMistakePly: null, ...partial };
  }

  it("ne garde que les ouvertures jouées au moins 5 fois par défaut", () => {
    const result = filterOpeningPerformanceForDisplay([
      performance({ eco: "B01", gamesPlayed: 5 }),
      performance({ eco: "C50", gamesPlayed: 4 }),
      performance({ eco: "A00", gamesPlayed: 1 }),
    ]);
    expect(result.map((p) => p.eco)).toEqual(["B01"]);
  });

  it("le seuil par défaut vaut MIN_GAMES_IN_OPENING_TABLE (5)", () => {
    expect(MIN_GAMES_IN_OPENING_TABLE).toBe(5);
  });

  it("accepte un seuil personnalisé", () => {
    const result = filterOpeningPerformanceForDisplay([performance({ eco: "B01", gamesPlayed: 2 })], 2);
    expect(result).toHaveLength(1);
  });

  it("renvoie une liste vide sans jamais planter sur une entrée d'entrée vide", () => {
    expect(filterOpeningPerformanceForDisplay([])).toEqual([]);
  });
});

describe("findStrugglingOpening", () => {
  function performance(partial: Partial<OpeningPerformance>): OpeningPerformance {
    return { eco: "A00", name: "Test", gamesPlayed: 5, wins: 2, winRate: 40, accuracy: 70, avgMistakePly: null, ...partial };
  }

  it("retient la pire ouverture parmi celles avec un échantillon suffisant", () => {
    const result = findStrugglingOpening([
      performance({ eco: "B01", gamesPlayed: 5, winRate: 30 }),
      performance({ eco: "C50", gamesPlayed: 4, winRate: 10 }),
      performance({ eco: "A00", gamesPlayed: 5, winRate: 60 }), // taux correct : jamais candidate
    ]);
    expect(result?.eco).toBe("C50");
  });

  it("ignore une ouverture jouée trop peu de fois, même avec un mauvais taux", () => {
    const result = findStrugglingOpening([performance({ eco: "B01", gamesPlayed: 1, winRate: 0 })]);
    expect(result).toBeNull();
  });

  it("renvoie null quand aucune ouverture ne dépasse le seuil de difficulté", () => {
    const result = findStrugglingOpening([performance({ eco: "B01", gamesPlayed: 10, winRate: 55 })]);
    expect(result).toBeNull();
  });
});

describe("computeHangingPieceStats", () => {
  const HANGING_NO_DEFENDER = "4k3/8/8/r7/8/8/8/3QK3 w - - 0 1"; // Qd1-d5, tour a5 l'attaque, personne ne défend
  const DEFENDED = "4k3/8/8/r7/2P5/8/8/3QK3 w - - 0 1"; // même chose, mais le pion c4 défend d5
  const HANGING_PINNED_DEFENDER = "6k1/8/3p4/q7/6N1/2B5/8/4K3 w - - 0 1"; // Ng4-e5, seul « défenseur » cloué
  const QUIET = "4k3/8/8/8/8/8/8/4K3 w - - 0 1"; // Ke1-d1, rien à proximité

  it("compte les gaffes qui laissent réellement une pièce en prise", () => {
    const result = computeHangingPieceStats([
      game({
        moves: [
          move({ fenBefore: HANGING_NO_DEFENDER, uci: "d1d5", quality: "blunder" }),
          move({ fenBefore: DEFENDED, uci: "d1d5", quality: "blunder" }),
          move({ fenBefore: HANGING_PINNED_DEFENDER, uci: "g4e5", quality: "blunder" }),
          move({ fenBefore: QUIET, uci: "e1d1", quality: "blunder" }),
        ],
      }),
    ]);

    expect(result).toEqual({ blunderCount: 2, totalBlunders: 4 });
  });

  it("ignore les coups qui ne sont pas des gaffes et ceux de l'adversaire", () => {
    const result = computeHangingPieceStats([
      game({
        moves: [
          move({ fenBefore: HANGING_NO_DEFENDER, uci: "d1d5", quality: "best" }), // pas une gaffe
          move({ fenBefore: HANGING_NO_DEFENDER, uci: "d1d5", quality: "blunder", byPlayer: false }), // adversaire
        ],
      }),
    ]);

    expect(result).toEqual({ blunderCount: 0, totalBlunders: 0 });
  });
});

describe("aggregatePlayerProgress", () => {
  it("assemble les quatre axes dans une seule structure", () => {
    const games: PlayerGameRecord[] = [
      game({
        eco: "B01",
        result: "1-0",
        playerColor: "w",
        moves: [
          move({ phase: "opening", quality: "best", motifs: ["fork"], motifFound: true }),
          move({
            phase: "middlegame",
            quality: "blunder",
            fenBefore: "4k3/8/8/r7/8/8/8/3QK3 w - - 0 1",
            uci: "d1d5",
          }),
        ],
      }),
    ];

    const result = aggregatePlayerProgress(games);

    expect(result.phaseAccuracy.opening.movesAnalysed).toBe(1);
    expect(result.tacticalMotifs.fork.found).toBe(1);
    expect(result.openingPerformance).toEqual([
      {
        eco: "B01",
        name: UNKNOWN_OPENING_NAME,
        gamesPlayed: 1,
        wins: 1,
        winRate: 100,
        accuracy: expect.any(Number),
        avgMistakePly: null, // le seul coup en phase "opening" est un "best", pas une gaffe
      },
    ]);
    expect(result.hangingPieces).toEqual({ blunderCount: 1, totalBlunders: 1 });
  });

  it("n'agrège jamais les coups de l'adversaire dans le profil du joueur", () => {
    const games: PlayerGameRecord[] = [
      game({
        moves: [move({ quality: "blunder", byPlayer: false })],
      }),
    ];

    const result = aggregatePlayerProgress(games);

    expect(result.phaseAccuracy.middlegame.movesAnalysed).toBe(0);
  });
});
