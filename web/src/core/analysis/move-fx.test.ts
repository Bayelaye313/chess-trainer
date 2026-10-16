import { describe, expect, it } from "vitest";
import type { AnalysedPly, TimelinePly } from "@/core/analysis/timeline";
import { classifyMoveFx } from "./move-fx";

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

describe("classifyMoveFx", () => {
  it("priorise la qualité analysée sur la forme du coup", () => {
    expect(classifyMoveFx(ply({ san: "Qxd8+", analysis: analysis({ quality: "brilliant" }) }))).toBe("brilliant");
    expect(classifyMoveFx(ply({ san: "Nf3", analysis: analysis({ quality: "critical" }) }))).toBe("critical");
    expect(classifyMoveFx(ply({ san: "Nf3", analysis: analysis({ quality: "best" }) }))).toBe("excellent");
    expect(classifyMoveFx(ply({ san: "Nf3", analysis: analysis({ quality: "blunder" }) }))).toBe("blunder");
  });

  it("retombe sur la forme du coup sans qualité remarquable", () => {
    expect(classifyMoveFx(ply({ san: "O-O", analysis: analysis({ quality: "okay" }) }))).toBe("castle");
    expect(classifyMoveFx(ply({ san: "Rxe5", analysis: analysis({ quality: "okay" }) }))).toBe("capture");
    expect(classifyMoveFx(ply({ san: "e4", analysis: analysis({ quality: "book" }) }))).toBe("neutral");
  });

  it("détecte le développement : pièce mineure quittant sa rangée de départ", () => {
    expect(classifyMoveFx(ply({ san: "Nf3", uci: "g1f3", side: "w", analysis: analysis({ quality: "okay" }) }))).toBe(
      "development",
    );
    expect(classifyMoveFx(ply({ san: "Bg7", uci: "f8g7", side: "b", analysis: analysis({ quality: "okay" }) }))).toBe(
      "development",
    );
  });

  it("une pièce mineure qui ne quitte PAS sa rangée de départ n'est pas un développement", () => {
    expect(classifyMoveFx(ply({ san: "Nf5", uci: "d4f5", side: "w", analysis: analysis({ quality: "okay" }) }))).toBe(
      "neutral",
    );
  });

  it("fonctionne sans analyse disponible (coup non encore évalué)", () => {
    expect(classifyMoveFx(ply({ san: "O-O-O", analysis: null }))).toBe("castle");
    expect(classifyMoveFx(ply({ san: "Nxe5", analysis: null }))).toBe("capture");
  });
});
