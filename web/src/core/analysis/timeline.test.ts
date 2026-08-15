import { describe, expect, it } from "vitest";
import {
  buildGameTimeline,
  computeAccuracy,
  evalPoints,
  findKeyMoments,
  tallyQualities,
  type AnalysedPly,
} from "./timeline";

// Mat du berger : 7 demi-coups, les Blancs matent au coup 7.
const PGN = "1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#";

function ply(overrides: Partial<AnalysedPly> & { ply: number }): AnalysedPly {
  return {
    byPlayer: true,
    quality: "best",
    cpLoss: 0,
    cpBefore: 20,
    mateBefore: null,
    cpAfter: 20,
    mateAfter: null,
    bestUci: null,
    bestSan: null,
    mateMissed: false,
    motifs: [],
    motifFound: false,
    phase: "opening",
    ...overrides,
  };
}

describe("buildGameTimeline", () => {
  it("reconstruit les deux camps depuis le PGN", () => {
    const timeline = buildGameTimeline(PGN, []);
    expect(timeline).toHaveLength(7);
    expect(timeline.map((t) => t.san)).toEqual(["e4", "e5", "Qh5", "Nc6", "Bc4", "Nf6", "Qxf7#"]);
    expect(timeline.map((t) => t.side)).toEqual(["w", "b", "w", "b", "w", "b", "w"]);
  });

  it("superpose l'analyse seulement sur les demi-coups renseignés", () => {
    const timeline = buildGameTimeline(PGN, [ply({ ply: 1, quality: "okay" })]);
    expect(timeline[0].analysis?.quality).toBe("okay");
    // Aucune analyse fournie pour ces plys : le mapping se fait par ply, pas par camp.
    expect(timeline[1].analysis).toBeNull();
    expect(timeline[2].analysis).toBeNull();
  });

  it("porte aussi l'analyse d'un coup adverse (byPlayer: false)", () => {
    const timeline = buildGameTimeline(PGN, [ply({ ply: 2, byPlayer: false, quality: "blunder" })]);
    expect(timeline[1].analysis?.quality).toBe("blunder");
    expect(timeline[1].analysis?.byPlayer).toBe(false);
  });

  it("calcule le bon uci, y compris sans promotion", () => {
    const timeline = buildGameTimeline(PGN, []);
    expect(timeline[0].uci).toBe("e2e4");
  });
});

describe("findKeyMoments", () => {
  it("étiquette gaffe, brillant et mat manqué", () => {
    const timeline = buildGameTimeline(PGN, [
      ply({ ply: 1, quality: "brilliant" }),
      ply({ ply: 3, quality: "blunder" }),
      ply({ ply: 5, quality: "best", mateMissed: true }),
    ]);
    const kinds = findKeyMoments(timeline).map((m) => `${m.ply}:${m.kind}`);
    expect(kinds).toEqual(["1:brilliant", "3:blunder", "5:missed_mate"]);
  });

  it("distingue tactique manquée d'une gaffe classique", () => {
    const timeline = buildGameTimeline(PGN, [
      // Bon coup, mais un motif tactique existait et n'a pas été saisi.
      ply({ ply: 1, quality: "okay", motifs: ["fork"], motifFound: false }),
      // Gaffe qui exploite pourtant le motif : pas une tactique manquée.
      ply({ ply: 3, quality: "blunder", motifs: ["pin"], motifFound: true }),
    ]);
    const kinds = findKeyMoments(timeline).map((m) => `${m.ply}:${m.kind}`);
    expect(kinds).toEqual(["1:missed_tactic", "3:blunder"]);
  });

  it("ignore les coups de l'adversaire, même une gaffe franche", () => {
    const timeline = buildGameTimeline(PGN, [
      ply({ ply: 1, quality: "best" }),
      ply({ ply: 2, byPlayer: false, quality: "blunder" }),
    ]);
    expect(findKeyMoments(timeline)).toEqual([]);
  });
});

describe("tallyQualities", () => {
  it("compte les coups par qualité, les autres à zéro", () => {
    const tally = tallyQualities([
      ply({ ply: 1, quality: "best" }),
      ply({ ply: 3, quality: "blunder" }),
      ply({ ply: 5, quality: "blunder" }),
    ]);
    expect(tally).toEqual({
      brilliant: 0,
      critical: 0,
      best: 1,
      okay: 0,
      inaccuracy: 0,
      blunder: 2,
      book: 0,
    });
  });
});

describe("computeAccuracy", () => {
  it("renvoie null sans coup analysé", () => {
    expect(computeAccuracy([])).toBeNull();
  });

  it("moyenne les poids par qualité", () => {
    // best(100) + blunder(5) → moyenne 52.5, arrondie à 53.
    const accuracy = computeAccuracy([
      ply({ ply: 1, quality: "best" }),
      ply({ ply: 3, quality: "blunder" }),
    ]);
    expect(accuracy).toBe(53);
  });
});

describe("evalPoints", () => {
  it("ancre sur la position de départ puis un point par coup analysé", () => {
    const points = evalPoints([
      ply({ ply: 3, cpAfter: -40 }),
      ply({ ply: 1, cpAfter: 25 }),
    ]);
    expect(points).toEqual([
      { ply: 0, cp: 0, mate: null },
      { ply: 1, cp: 25, mate: null },
      { ply: 3, cp: -40, mate: null },
    ]);
  });
});
