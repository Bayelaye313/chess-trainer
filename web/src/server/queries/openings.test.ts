import { describe, expect, it } from "vitest";
import { OPENINGS } from "@/core/curriculum/openings";
import { annotateOpeningLine, formatMovePreview, getOpeningDetail, listBookContinuations, listOpenings } from "./openings";

describe("annotateOpeningLine", () => {
  it("annote chaque coup avec son FEN et son UCI, dans l'ordre", () => {
    const opening = OPENINGS.find((o) => o.id === "ruy-lopez")!;
    const plies = annotateOpeningLine(opening);

    expect(plies).toHaveLength(opening.moves.length);
    expect(plies.map((p) => p.san)).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5"]);
    expect(plies.map((p) => p.uci)).toEqual(["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"]);
    expect(plies[plies.length - 1].fen).toContain("KQkq");
  });

  it("reconnaît la position finale de la Ruy Lopez dans la base ECO", () => {
    const opening = OPENINGS.find((o) => o.id === "ruy-lopez")!;
    const plies = annotateOpeningLine(opening);
    expect(plies[plies.length - 1].book?.name).toMatch(/Ruy Lopez/);
  });

  it("peut sortir de la théorie cataloguée avant la fin d'une ligne longue", () => {
    const opening = OPENINGS.find((o) => o.id === "sicilian-najdorf")!;
    const plies = annotateOpeningLine(opening);
    // Pas d'exigence que CHAQUE ply soit cataloguée : seule la présence d'au
    // moins une annotation de théorie tôt dans la ligne est garantie.
    expect(plies.some((p) => p.book !== null)).toBe(true);
  });
});

describe("formatMovePreview", () => {
  it("formate une ligne paire façon PGN", () => {
    expect(formatMovePreview(["e4", "e5", "Nf3", "Nc6"])).toBe("1. e4 e5 2. Nf3 Nc6");
  });

  it("gère un dernier coup blanc sans réponse noire", () => {
    expect(formatMovePreview(["e4", "e5", "f4"])).toBe("1. e4 e5 2. f4");
  });
});

describe("listOpenings", () => {
  it("renvoie une entrée par ouverture du catalogue, avec un aperçu", () => {
    const summaries = listOpenings();
    expect(summaries).toHaveLength(OPENINGS.length);
    expect(summaries.every((s) => s.preview.length > 0)).toBe(true);
  });
});

describe("listBookContinuations", () => {
  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("liste des coups théoriques distincts depuis la position de départ", () => {
    const continuations = listBookContinuations(START_FEN);
    expect(continuations.length).toBeGreaterThan(0);
    const sans = continuations.map((c) => c.san);
    expect(new Set(sans).size).toBe(sans.length);
    for (const continuation of continuations) {
      expect(continuation.eco).toMatch(/^[A-E]\d\d$/);
      expect(continuation.name.length).toBeGreaterThan(0);
    }
  });

  it("inclut 1.e4 et 1.d4 parmi les continuations depuis la position de départ", () => {
    const sans = listBookContinuations(START_FEN).map((c) => c.san);
    expect(sans).toContain("e4");
    expect(sans).toContain("d4");
  });

  it("renvoie un tableau vide sur une position hors théorie", () => {
    // Milieu de partie quelconque, très en aval — cf. `openings.test.ts` (server/import).
    const deepMiddlegame = "r2qk2r/ppp2ppp/2n1bn2/3p4/3P4/2N1BN2/PPP2PPP/R2QK2R w KQkq - 4 9";
    expect(listBookContinuations(deepMiddlegame)).toEqual([]);
  });
});

describe("getOpeningDetail", () => {
  it("renvoie l'ouverture et ses coups annotés pour un slug connu", () => {
    const detail = getOpeningDetail("caro-kann");
    expect(detail?.opening.id).toBe("caro-kann");
    expect(detail?.plies.length).toBe(detail?.opening.moves.length);
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(getOpeningDetail("does-not-exist")).toBeNull();
  });
});
