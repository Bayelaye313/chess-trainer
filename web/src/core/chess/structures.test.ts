import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import {
  STRUCTURE_TAGS,
  describeStructures,
  parsePosition,
  hasBackwardPawn,
  hasBadBishop,
  hasKnightOutpost,
  hasProtectedPassedPawn,
  hasBlockadedPasser,
  hasSymmetricPawns,
} from "./structures";

/** Toutes les FEN de ce fichier passent par chess.js : un test qui s'appuierait sur une position illégale ne prouverait rien. */
function legal(fen: string): string {
  expect(() => new Chess(fen)).not.toThrow();
  return fen;
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const CARLSBAD = "r1bq1rk1/pp3ppp/2p1pn2/3p4/3P4/2P1PN2/PP3PPP/R1BQ1RK1 w - - 0 1";
const MINORITY_ATTACK = "r1bq1rk1/p4ppp/2p1pn2/3p4/1P1P4/2P1PN2/P4PPP/R1BQ1RK1 w - - 0 1";
const MAROCZY = "r1bq1rk1/pp2ppbp/2np1np1/8/2P1P3/2N1BP2/PP4PP/R2QKB1R w - - 0 1";
const HEDGEHOG = "r2q1rk1/4bppp/pp1ppn2/8/2P1P3/2N5/PP3PPP/R1BQ1RK1 w - - 0 1";
const FRENCH_CHAIN = "r1bqkbnr/pp3ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR w - - 0 1";
const KINGS_INDIAN_CHAIN = "r1bq1rk1/ppp2pbp/3p1np1/3Pp3/2P1P3/2N5/PP3PPP/R1BQ1RK1 w - - 0 1";
const ISOLANI = "r1bq1rk1/pp3ppp/2n1pn2/8/3P4/5N2/PP3PPP/R1BQ1RK1 w - - 0 1";
const HANGING_PAWNS = "r1bq1rk1/p4ppp/2n1pn2/8/2PP4/5N2/P4PPP/R1BQ1RK1 w - - 0 1";

describe("parsePosition", () => {
  it("lit le placement d'une FEN et compte le matériel", () => {
    const position = parsePosition(START);
    expect(position).not.toBeNull();
    expect(position!.pieceCount).toBe(32);
    expect(position!.counts.P).toBe(8);
    expect(position!.counts.k).toBe(1);
    // pawns.w[0] = colonne a : un pion blanc, rangée index 1 (= rangée 2).
    expect(position!.pawns.w[0]).toEqual([1]);
    expect(position!.pawns.b[0]).toEqual([6]);
  });

  it("rejette un placement malformé plutôt que de deviner", () => {
    expect(parsePosition("rnbqkbnr/pppppppp/8/8/8 w - - 0 1")).toBeNull();
    expect(parsePosition("rnbqkbnr/ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1")).toBeNull();
  });
});

describe("squelettes de pions nommés", () => {
  it("reconnaît la structure Carlsbad et la distingue d'un centre classique", () => {
    expect(describeStructures(legal(CARLSBAD))).toContain("carlsbad");
    // Même squelette mais pion blanc poussé en e4 : ce n'est plus un Carlsbad.
    expect(describeStructures(legal("r1bq1rk1/pp3ppp/2p1pn2/3p4/3PP3/2P2N2/PP3PPP/R1BQ1RK1 w - - 0 1"))).not.toContain(
      "carlsbad",
    );
    expect(describeStructures(START)).not.toContain("carlsbad");
  });

  it("ne signale l'attaque de minorité que lorsque le pion b est en marche", () => {
    expect(describeStructures(legal(MINORITY_ATTACK))).toContain("minority_attack");
    // Le Carlsbad seul autorise le plan, il ne l'engage pas.
    expect(describeStructures(CARLSBAD)).not.toContain("minority_attack");
  });

  it("reconnaît le bind Maroczy à ses pions c4+e4 sans colonne d", () => {
    expect(describeStructures(legal(MAROCZY))).toContain("maroczy");
    expect(describeStructures(START)).not.toContain("maroczy");
  });

  it("exige les quatre pions du hérisson, pas trois", () => {
    expect(describeStructures(legal(HEDGEHOG))).toContain("hedgehog");
    // a6-b6-d6 sans e6 : une Sicilienne ordinaire, pas un hérisson.
    expect(describeStructures(legal("r2q1rk1/4bppp/pp1p1n2/4p3/2P1P3/2N5/PP3PPP/R1BQ1RK1 w - - 0 1"))).not.toContain(
      "hedgehog",
    );
  });

  it("distingue la chaîne française de la chaîne est-indienne", () => {
    const french = describeStructures(legal(FRENCH_CHAIN));
    const kingsIndian = describeStructures(legal(KINGS_INDIAN_CHAIN));
    expect(french).toContain("french_chain");
    expect(french).not.toContain("kings_indian_chain");
    expect(kingsIndian).toContain("kings_indian_chain");
    expect(kingsIndian).not.toContain("french_chain");
  });

  it("reconnaît le pion dame isolé et les pions pendants", () => {
    expect(describeStructures(legal(ISOLANI))).toContain("isolani");
    expect(describeStructures(legal(HANGING_PAWNS))).toContain("hanging_pawns");
    // Les pendants ne sont pas un isolani : ils ont un voisin l'un pour l'autre.
    expect(describeStructures(HANGING_PAWNS)).not.toContain("isolani");
  });
});

describe("traits de structure", () => {
  it("ne voit un pion passé protégé que s'il est réellement épaulé", () => {
    // Pions blancs b5+c6 : c6 est passé et protégé par b5.
    expect(hasProtectedPassedPawn(parsePosition(legal("8/8/2P5/1P6/8/8/6k1/6K1 w - - 0 1"))!)).toBe(true);
    // Le même pion passé, seul.
    expect(hasProtectedPassedPawn(parsePosition(legal("8/8/2P5/8/8/8/6k1/6K1 w - - 0 1"))!)).toBe(false);
  });

  it("reconnaît le blocus d'un pion passé par une pièce adverse", () => {
    // Cavalier noir posé en d6, juste devant le pion passé blanc d5.
    expect(hasBlockadedPasser(parsePosition(legal("8/8/3n4/3P4/8/8/6k1/6K1 w - - 0 1"))!)).toBe(true);
    expect(hasBlockadedPasser(parsePosition(legal("8/8/8/3P4/8/3n4/6k1/6K1 w - - 0 1"))!)).toBe(false);
  });

  it("reconnaît un pion arriéré sur colonne semi-ouverte", () => {
    // Pion blanc d3 arriéré : pas de pion blanc en c/e pour l'épauler, et le
    // pion noir e5 tient la case d4. (Le pion noir e5 est lui-même épaulé par
    // f6, sans quoi il serait arriéré à son tour et le test ne prouverait rien.)
    expect(hasBackwardPawn(parsePosition(legal("6k1/8/5p2/4p3/8/3P4/8/6K1 w - - 0 1"))!)).toBe(true);
    // Épaulé par c2 : plus arriéré.
    expect(hasBackwardPawn(parsePosition(legal("6k1/8/5p2/4p3/8/3P4/2P5/6K1 w - - 0 1"))!)).toBe(false);
  });

  it("ne déclare symétrique qu'un vrai reflet, pion par pion", () => {
    expect(hasSymmetricPawns(parsePosition(START)!)).toBe(true);
    // Le Carlsbad EST un reflet exact (c3-d4-e3 contre c6-d5-e6) : c'est bien
    // une structure symétrique, ce qui n'en fait pas une position équilibrée.
    expect(hasSymmetricPawns(parsePosition(CARLSBAD)!)).toBe(true);
    // La chaîne française, elle, est franchement asymétrique.
    expect(hasSymmetricPawns(parsePosition(FRENCH_CHAIN)!)).toBe(false);
  });

  it("reconnaît un centre fermé et un centre ouvert", () => {
    // Chaînes bloquées d4/d5 et e5/e6 : deux couples verrouillés.
    expect(describeStructures(FRENCH_CHAIN)).toContain("closed_center");
    expect(describeStructures(START)).not.toContain("closed_center");
    expect(describeStructures(legal("r3k2r/pp3ppp/8/8/8/8/PP3PPP/R3K2R w - - 0 1"))).toContain("open_center");
  });
});

describe("configurations de pièces", () => {
  it("exige d'un avant-poste qu'il soit protégé ET inchassable", () => {
    // Cavalier d5 protégé par e4, aucun pion noir en c/e pour le chasser.
    expect(hasKnightOutpost(parsePosition(legal("6k1/pp6/8/3N4/4P3/8/8/6K1 w - - 0 1"))!)).toBe(true);
    // Le pion noir e6 peut jouer e6xd5 — ce n'est plus un avant-poste.
    expect(hasKnightOutpost(parsePosition(legal("6k1/pp6/4p3/3N4/4P3/8/8/6K1 w - - 0 1"))!)).toBe(false);
    // Non protégé : un cavalier avancé, rien de plus.
    expect(hasKnightOutpost(parsePosition(legal("6k1/pp6/8/3N4/8/8/8/6K1 w - - 0 1"))!)).toBe(false);
  });

  it("ne qualifie de mauvais fou qu'un fou étouffé par ses propres pions", () => {
    // Fou blanc de cases sombres (d2) derrière quatre pions blancs sombres
    // (b2, c3, e3, d4) : il bute sur son propre camp.
    expect(hasBadBishop(parsePosition(legal("6k1/8/8/8/3P4/2P1P3/1P1B4/6K1 w - - 0 1"))!)).toBe(true);
    // Les mêmes pions, mais le fou tenu sur le complexe clair (e2) : bon fou.
    expect(hasBadBishop(parsePosition(legal("6k1/8/8/8/3P4/2P1P3/1P2B3/6K1 w - - 0 1"))!)).toBe(false);
  });

  it("reconnaît tour en 7e, fous opposés, paire de fous et fianchetto", () => {
    expect(describeStructures(legal("6k1/R6p/8/8/8/8/7P/6K1 w - - 0 1"))).toContain("rook_seventh");
    // Fou blanc e2 (case claire) contre fou noir f6 (case sombre).
    expect(describeStructures(legal("6k1/8/5b2/8/8/8/4B3/6K1 w - - 0 1"))).toContain("opposite_bishops");
    expect(describeStructures(legal("6k1/5n2/8/8/8/8/3BB3/6K1 w - - 0 1"))).toContain("bishop_pair");
    expect(describeStructures(legal("6k1/6bp/6p1/8/8/8/8/6K1 w - - 0 1"))).toContain("fianchetto");
  });
});

describe("types de finale", () => {
  it("classe les finales par matériel restant", () => {
    expect(describeStructures(legal("6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1"))).toContain("pawn_endgame");
    expect(describeStructures(legal("6k1/r4ppp/8/8/8/8/5PPP/R5K1 w - - 0 1"))).toContain("rook_endgame");
    expect(describeStructures(legal("6k1/5ppp/5b2/8/8/5B2/5PPP/6K1 w - - 0 1"))).toContain("bishop_endgame");
    expect(describeStructures(legal("6k1/5ppp/5n2/8/8/5B2/5PPP/6K1 w - - 0 1"))).toContain("knight_vs_bishop");
  });
});

describe("façade", () => {
  it("renvoie les tags dans l'ordre déclaré, sans doublon", () => {
    const tags = describeStructures(CARLSBAD);
    expect(new Set(tags).size).toBe(tags.length);
    const order = tags.map((tag) => STRUCTURE_TAGS.indexOf(tag));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("renvoie un tableau vide sur une FEN illisible plutôt que de lever", () => {
    expect(describeStructures("pas une fen")).toEqual([]);
  });
});
