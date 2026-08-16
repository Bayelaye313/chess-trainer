import { describe, expect, it } from "vitest";
import {
  aggregatePlayerProgress,
  computeHangingPieceStats,
  computeOpeningPerformance,
  computePhaseAccuracy,
  computeTacticalMotifStats,
  UNKNOWN_OPENING_NAME,
} from "./progress-insights";
import type { PlayerGameRecord, PlayerMoveRecord } from "./types";

/** Coup minimal, valeurs par défaut neutres — chaque test ne précise que ce qui compte. */
function move(partial: Partial<PlayerMoveRecord>): PlayerMoveRecord {
  return {
    fenBefore: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
    uci: "e1d1",
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
    });
    expect(result[1]).toEqual({
      eco: "C50",
      name: "Italian Game",
      gamesPlayed: 1,
      wins: 0,
      winRate: 0,
      accuracy: 85,
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
