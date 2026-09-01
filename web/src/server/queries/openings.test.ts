import { describe, expect, it } from "vitest";
import { OPENINGS } from "@/core/curriculum/openings";
import {
  annotateOpeningLine,
  formatMovePreview,
  getOpeningDetail,
  listBookContinuations,
  listOpenings,
  listOpeningVariations,
} from "./openings";

describe("annotateOpeningLine", () => {
  it("annote chaque coup avec son FEN et son UCI, dans l'ordre — sur toute la profondeur de l'arbre `pgn`, pas seulement `moves`", () => {
    // Régression (audit UI du 2026-08-29) : `annotateOpeningLine` rejouait
    // `opening.moves` — la ligne courte du catalogue — même pour un chapitre
    // dont l'arbre `pgn` va bien plus loin, ce qui faisait terminer le script
    // de "Ligne principale" du Mode Entraînement après seulement quelques
    // coups (`use-opening-drill.ts`). Elle DOIT désormais suivre `mainLine()`
    // de l'arbre authored en entier.
    const opening = OPENINGS.find((o) => o.id === "ruy-lopez")!;
    const plies = annotateOpeningLine(opening);

    // `moves` (5 plies) n'est plus le total, seulement un PRÉFIXE de la vraie ligne.
    expect(plies.length).toBeGreaterThan(opening.moves.length);
    expect(plies.length).toBeGreaterThanOrEqual(15); // au moins 15 plies de théorie, voir le cahier des charges.
    expect(plies.slice(0, opening.moves.length).map((p) => p.san)).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5"]);
    expect(plies.slice(0, opening.moves.length).map((p) => p.uci)).toEqual([
      "e2e4",
      "e7e5",
      "g1f3",
      "b8c6",
      "f1b5",
    ]);
    expect(plies[plies.length - 1].fen).toContain(" w "); // ligne principale : Blancs au trait après Qc7.
  });

  it("reconnaît la position finale de la ligne courte (`moves`) de la Ruy Lopez dans la base ECO", () => {
    const opening = OPENINGS.find((o) => o.id === "ruy-lopez")!;
    const plies = annotateOpeningLine(opening);
    expect(plies[opening.moves.length - 1].book?.name).toMatch(/Ruy Lopez/);
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

  it("priorise l'arbre curaté et EN PLUS de la ligne scriptée accepte ses embranchements réels", () => {
    // Position après 1.e4 e5 2.Nf3 Nc6 3.Bb5 (fin de la ligne de référence de
    // la Ruy Lopez) — l'arbre authored propose deux réponses théoriques
    // distinctes (3...a6 ET 3...Nf6, la Berlinoise) : aucune des deux ne doit
    // être rejetée comme hors-théorie.
    const ruyLopez = OPENINGS.find((o) => o.id === "ruy-lopez")!;
    // Position après `moves` (fin de la ligne COURTE, 3.Bb5) — `annotateOpeningLine`
    // va désormais bien plus loin (voir le test de régression ci-dessus), donc
    // `.at(-1)` ne pointerait plus du tout sur cette position.
    const afterBb5 = annotateOpeningLine(ruyLopez)[ruyLopez.moves.length - 1]!.fen;
    const sans = listBookContinuations(afterBb5).map((c) => c.san);
    expect(sans).toContain("a6");
    expect(sans).toContain("Nf6");
  });
});

describe("getOpeningDetail", () => {
  it("renvoie l'ouverture et ses coups annotés pour un slug connu, sur toute la profondeur de son arbre `pgn`", () => {
    const detail = getOpeningDetail("caro-kann");
    expect(detail?.opening.id).toBe("caro-kann");
    // `caro-kann` porte un arbre `pgn` bien plus profond que sa ligne courte
    // `moves` (4 plies) — voir le test de régression `annotateOpeningLine`.
    expect(detail!.plies.length).toBeGreaterThan(detail!.opening.moves.length);
    expect(detail!.plies.length).toBeGreaterThanOrEqual(15);
  });

  it("inclut les variantes nommées découvertes en base ECO", () => {
    const detail = getOpeningDetail("ruy-lopez");
    expect(detail?.variations.length).toBeGreaterThan(0);
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(getOpeningDetail("does-not-exist")).toBeNull();
  });
});

describe("listOpeningVariations", () => {
  const ruyLopez = OPENINGS.find((o) => o.id === "ruy-lopez")!;

  it("trouve des branches nommées qui prolongent réellement la ligne de référence", () => {
    const variations = listOpeningVariations(ruyLopez);
    expect(variations.length).toBeGreaterThan(0);
    for (const variation of variations) {
      // Chaque variante doit strictement prolonger la ligne de référence, pas
      // seulement la recouper par transposition.
      expect(variation.sanMoves.length).toBeGreaterThan(ruyLopez.moves.length);
      expect(variation.sanMoves.slice(0, ruyLopez.moves.length)).toEqual(ruyLopez.moves);
      expect(variation.eco).toMatch(/^[A-E]\d\d$/);
      expect(variation.uciMoves.length).toBe(variation.sanMoves.length);
    }
  });

  it("reconnaît la Défense Berlinoise parmi les variantes de la Ruy Lopez", () => {
    const variations = listOpeningVariations(ruyLopez);
    expect(variations.some((v) => /Berlin/i.test(v.name))).toBe(true);
  });

  it("ne garde qu'une entrée par nom, la plus longue rencontrée", () => {
    const variations = listOpeningVariations(ruyLopez);
    const names = variations.map((v) => `${v.eco}|${v.name}`);
    expect(new Set(names).size).toBe(names.length);
  });

  it("ne plante jamais, même sur une ligne de référence poussée hors théorie", () => {
    // Suite volontairement absurde mais entièrement légale (poussées de pions
    // de bord) — l'important est que la récursion s'arrête proprement une
    // fois sortie de la base ECO, sans exception.
    const outOfBook = { ...ruyLopez, moves: [...ruyLopez.moves, "a6", "a4", "a5", "h3", "h6"] };
    expect(() => listOpeningVariations(outOfBook)).not.toThrow();
  });
});
