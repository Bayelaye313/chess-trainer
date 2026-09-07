import { describe, expect, it } from "vitest";
import { buildCoachMessage, buildGameCoachFindings, type DeviationHint } from "./coach-narrative";
import { buildGameTimeline, type AnalysedPly, type TimelinePly } from "./timeline";

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

describe("buildCoachMessage", () => {
  it("ne dit rien pour un coup de l'adversaire ou sans analyse", () => {
    const timeline = buildGameTimeline(PGN, [ply({ ply: 2, byPlayer: false, quality: "blunder" })]);
    expect(buildCoachMessage(timeline[1], null)).toBeNull(); // coup adverse
    expect(buildCoachMessage(timeline[0], null)).toBeNull(); // pas d'analyse
  });

  it("priorise la déviation de répertoire sur le reste", () => {
    const timeline = buildGameTimeline(PGN, [ply({ ply: 3, quality: "blunder" })]);
    const deviation: DeviationHint = { ply: 3, expectedSan: "Nf3", openingName: "Partie italienne" };
    const message = buildCoachMessage(timeline[2], deviation);
    expect(message?.tag).toBe("deviation");
    expect(message?.text).toContain("coup 3");
    expect(message?.text).toContain("Nf3");
    expect(message?.text).toContain("Partie italienne");
  });

  it("félicite un coup brillant ou critique", () => {
    const timeline = buildGameTimeline(PGN, [ply({ ply: 1, quality: "brilliant" }), ply({ ply: 3, quality: "critical" })]);
    expect(buildCoachMessage(timeline[0], null)?.tag).toBe("brilliant");
    expect(buildCoachMessage(timeline[2], null)?.tag).toBe("critical");
  });

  it("signale un mat manqué avant tout autre diagnostic", () => {
    const timeline = buildGameTimeline(PGN, [ply({ ply: 1, quality: "okay", mateMissed: true, bestSan: "Qh5" })]);
    const message = buildCoachMessage(timeline[0], null);
    expect(message?.tag).toBe("missed_mate");
    expect(message?.text).toContain("Qh5");
  });

  it("nomme le motif manqué quand le meilleur coup l'exploitait", () => {
    const timeline = buildGameTimeline(PGN, [
      ply({ ply: 3, quality: "blunder", motifs: ["fork"], motifFound: false, bestSan: "Nd5" }),
    ]);
    const message = buildCoachMessage(timeline[2], null);
    expect(message?.tag).toBe("missed_tactic");
    expect(message?.motif).toBe("fork");
    expect(message?.text).toContain("fourchette");
  });

  it("nomme précisément la pièce et la case laissées en prise par le coup", () => {
    // 1. Nc3 Nf6, puis 2. Nd5?? : le cavalier blanc atterrit sur une case
    // attaquée par Nf6 et défendue par personne — une vraie gaffe imputable
    // à CE coup (le cavalier ne pouvait pas être en prise avant, il n'était
    // pas encore sur d5).
    const fenBefore = "rnbqkb1r/pppppppp/5n2/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq - 2 2";
    const fenAfter = "rnbqkb1r/pppppppp/5n2/3N4/8/8/PPPPPPPP/R1BQKBNR b KQkq - 3 2";
    const entry: TimelinePly = {
      ply: 3,
      side: "w",
      san: "Nd5",
      uci: "c3d5",
      fenBefore,
      fenAfter,
      analysis: ply({ ply: 3, quality: "blunder", bestSan: "e4" }),
    };
    const message = buildCoachMessage(entry, null);
    expect(message?.tag).toBe("hanging_piece");
    expect(message?.text).toContain("cavalier");
    expect(message?.text).toContain("d5");
  });

  it("signale un roi exposé quand le coup ouvre un échec immédiat sans rien laisser en prise", () => {
    // Le Mat du Berger inversé (Fool's Mate) : 1. f3 e5 2. g4?? ouvre
    // Dxh4+ (Qd8-h4, diagonale d8-h4 totalement dégagée) sans qu'aucune
    // pièce blanche ne devienne prenable.
    const fenBefore = "rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2";
    const fenAfter = "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2";
    const entry: TimelinePly = {
      ply: 3,
      side: "w",
      san: "g4",
      uci: "g2g4",
      fenBefore,
      fenAfter,
      analysis: ply({ ply: 3, quality: "blunder", bestSan: "Nf3" }),
    };
    const message = buildCoachMessage(entry, null);
    expect(message?.tag).toBe("king_safety");
  });

  it("retombe sur un message générique quand aucune heuristique ne matche", () => {
    const timeline = buildGameTimeline(PGN, [ply({ ply: 1, quality: "inaccuracy", bestSan: "d4" })]);
    const message = buildCoachMessage(timeline[0], null);
    expect(message?.tag).toBe("inaccuracy");
    expect(message?.text).toContain("d4");
  });

  it("décrit géométriquement la cage du roi sur un mat manqué (roi acculé, muré par ses propres pions)", () => {
    // Roi noir en g8, muré par ses propres pions f7/g7/h7 — Re8# était disponible.
    const fenBefore = "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1";
    const entry: TimelinePly = {
      ply: 1,
      side: "w",
      san: "Kf1",
      uci: "g1f1",
      fenBefore,
      fenAfter: fenBefore,
      analysis: ply({ ply: 1, quality: "okay", mateMissed: true, bestSan: "Re8#" }),
    };
    const message = buildCoachMessage(entry, null);
    expect(message?.tag).toBe("missed_mate");
    expect(message?.text).toContain("muré par ses propres pions");
    expect(message?.text).toContain("Re8#");
  });

  it("annonce une case faible chroniquement créée par une poussée de pion (a2-a4 sans pion c pour épauler b3)", () => {
    const fenBefore = "4k3/8/8/8/8/8/P7/4K3 w - - 0 1";
    const fenAfter = "4k3/8/8/8/P7/8/8/4K3 b - - 0 1";
    const entry: TimelinePly = {
      ply: 1,
      side: "w",
      san: "a4",
      uci: "a2a4",
      fenBefore,
      fenAfter,
      analysis: ply({ ply: 1, quality: "inaccuracy", bestSan: "e4" }),
    };
    const message = buildCoachMessage(entry, null);
    expect(message?.tag).toBe("weak_square");
    expect(message?.text).toContain("b3");
    expect(message?.text).toContain("a4");
  });

  it("n'invente pas de motif manqué sur un coup qui n'a rien coûté", () => {
    // Le meilleur coup exploite structurellement une fourchette (`detectMotifs`
    // ne juge que sa FORME), mais le coup joué est lui-même `best`/`okay` — un
    // simple échange matériel linéaire, sans perte de probabilité de gain
    // mesurable. Annoncer « tu as raté une fourchette » ici serait une fausse
    // alerte (bug utilisateur corrigé, voir coach-narrative.ts).
    const timeline = buildGameTimeline(PGN, [
      ply({ ply: 1, quality: "best", motifs: ["fork"], motifFound: false }),
      ply({ ply: 3, quality: "okay", motifs: ["fork"], motifFound: false }),
    ]);
    expect(buildCoachMessage(timeline[0], null)).toBeNull();
    expect(buildCoachMessage(timeline[1], null)).toBeNull();
  });
});

describe("buildGameCoachFindings", () => {
  it("dédoublonne les lacunes par motif, au premier ply rencontré", () => {
    const timeline = buildGameTimeline(PGN, [
      ply({ ply: 1, quality: "blunder", motifs: ["fork"], motifFound: false }),
      ply({ ply: 3, quality: "blunder", motifs: ["fork"], motifFound: false }), // même motif, ignoré
      ply({ ply: 5, quality: "inaccuracy", motifs: ["pin"], motifFound: false }),
      ply({ ply: 7, quality: "okay", mateMissed: true }),
    ]);
    const findings = buildGameCoachFindings(timeline);
    expect(findings.map((f) => [f.ply, f.message.tag])).toEqual([
      [1, "missed_tactic"],
      [5, "missed_tactic"],
      [7, "missed_mate"],
    ]);
  });

  it("ignore les coups de l'adversaire et les motifs déjà trouvés", () => {
    const timeline = buildGameTimeline(PGN, [
      ply({ ply: 2, byPlayer: false, quality: "blunder", motifs: ["fork"], motifFound: false }),
      ply({ ply: 3, quality: "blunder", motifs: ["skewer"], motifFound: true }),
    ]);
    expect(buildGameCoachFindings(timeline)).toEqual([]);
  });

  it("ignore un motif dont le coup joué n'a rien coûté (pas de fausse alerte)", () => {
    const timeline = buildGameTimeline(PGN, [
      ply({ ply: 1, quality: "best", motifs: ["fork"], motifFound: false }),
      ply({ ply: 3, quality: "okay", motifs: ["pin"], motifFound: false }),
    ]);
    expect(buildGameCoachFindings(timeline)).toEqual([]);
  });
});
