import { describe, expect, it } from "vitest";
import { buildMistakeRound, type MistakeRoundSource } from "./opening-mistake-round";

function source(partial: Partial<MistakeRoundSource>): MistakeRoundSource {
  return {
    ply: 3,
    fenBefore: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    expectedSan: "Bb5",
    expectedUci: "f1b5",
    actualSan: "Bc4",
    actualUci: "f1c4",
    leadInUci: ["e2e4", "e7e5", "g1f3", "b8c6"],
    openingName: "Ruy Lopez (Espagnole)",
    ...partial,
  };
}

describe("buildMistakeRound", () => {
  it("emballe fenBefore/leadInUci/expectedUci tels quels, sans les recalculer", () => {
    const deviation = source({});
    const { round, leadInUci } = buildMistakeRound(deviation);

    expect(leadInUci).toBe(deviation.leadInUci); // aucune recopie/recalcul — la même référence transite.
    expect(round.startFen).toBe(deviation.fenBefore);
    expect(round.startPly).toBe(2); // ply - 1
    expect(round.label).toBe("Ruy Lopez (Espagnole)");
  });

  it("le script ne contient QUE le coup de correction — un exercice ciblé, pas une continuation entière", () => {
    const { round } = buildMistakeRound(source({ expectedUci: "f1b5" }));
    expect(round.script).toEqual(["f1b5"]);
  });

  it("fonctionne identiquement pour une déviation dès le tout premier coup (lead-in vide)", () => {
    const deviation = source({
      ply: 1,
      fenBefore: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      expectedUci: "e2e4",
      leadInUci: [],
    });
    const { round, leadInUci } = buildMistakeRound(deviation);
    expect(leadInUci).toEqual([]);
    expect(round.startPly).toBe(0);
    expect(round.script).toEqual(["e2e4"]);
  });

  it("fonctionne pour une ouverture hors catalogue — aucune dépendance à `OpeningLine`", () => {
    const deviation = source({ openingName: "Une ouverture hors catalogue" });
    const { round } = buildMistakeRound(deviation);
    expect(round.label).toBe("Une ouverture hors catalogue");
  });
});
