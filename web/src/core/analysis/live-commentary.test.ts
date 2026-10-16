import { describe, expect, it } from "vitest";
import { buildLiveCommentaryFeed, buildLiveCommentaryLine } from "./live-commentary";
import type { AnalysedPly, TimelinePly } from "./timeline";

function analysis(partial: Partial<AnalysedPly>): AnalysedPly {
  return {
    ply: 1,
    byPlayer: true,
    quality: "okay",
    cpLoss: 0,
    cpBefore: 0,
    mateBefore: null,
    cpAfter: 0,
    mateAfter: null,
    bestUci: null,
    bestSan: null,
    mateMissed: false,
    motifs: [],
    motifFound: false,
    phase: "middlegame",
    ...partial,
  };
}

function ply(partial: Partial<TimelinePly>): TimelinePly {
  return {
    ply: 1,
    side: "w",
    san: "e4",
    uci: "e2e4",
    fenBefore: "fen-before",
    fenAfter: "fen-after",
    analysis: null,
    ...partial,
  };
}

describe("buildLiveCommentaryLine", () => {
  it("ne renvoie jamais null — même pour un coup adverse sain", () => {
    const line = buildLiveCommentaryLine(ply({ side: "b", san: "e5", analysis: analysis({ byPlayer: false, quality: "okay" }) }));
    expect(line.text.length).toBeGreaterThan(0);
  });

  it("réutilise le texte de buildCoachMessage pour un coup notable, même côté adversaire", () => {
    const line = buildLiveCommentaryLine(
      ply({ side: "b", san: "Qxd8+", analysis: analysis({ byPlayer: false, quality: "brilliant" }) }),
    );
    expect(line.text).toContain("Coup brillant");
    expect(line.text).toContain("Les Noirs");
  });

  it("gaffe du joueur : reprend le message de buildCoachMessage", () => {
    const line = buildLiveCommentaryLine(
      ply({
        side: "w",
        san: "d4",
        uci: "d2d4",
        fenBefore: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        analysis: analysis({ byPlayer: true, quality: "blunder", bestSan: "Nf3" }),
      }),
    );
    expect(line.text).toContain("Gaffe");
  });

  it("coup sain sans analyse : retombe sur la forme du coup (roque/capture/développement/neutre)", () => {
    const castle = buildLiveCommentaryLine(ply({ san: "O-O", analysis: null }));
    expect(castle.text).toMatch(/Roi|Roque/);

    const capture = buildLiveCommentaryLine(ply({ san: "Nxe5", analysis: null }));
    expect(capture.text).toContain("Nxe5");
  });

  it("annonce une déviation de répertoire au bon ply, comme la bulle du Coach", () => {
    const line = buildLiveCommentaryLine(
      ply({ ply: 5, san: "O-O", analysis: analysis({ ply: 5, byPlayer: true, quality: "okay" }) }),
      { ply: 5, expectedSan: "Bxc6", openingName: "Ruy Lopez" },
    );
    expect(line.text).toContain("dévié");
  });
});

describe("buildLiveCommentaryFeed", () => {
  it("s'arrête pile à uptoPly, jamais au-delà", () => {
    const timeline = [ply({ ply: 1 }), ply({ ply: 2, side: "b" }), ply({ ply: 3 })];
    expect(buildLiveCommentaryFeed(timeline, 2)).toHaveLength(2);
    expect(buildLiveCommentaryFeed(timeline, 0)).toHaveLength(0);
  });
});
