import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { MATE_PATTERNS, analyseMate, describeMatePatterns, type MatePattern } from "./mate-patterns";

/**
 * Une position matée par motif. Chacune a été vérifiée mat par `chess.js`
 * (`positions réellement matées` ci-dessous) : un détecteur validé sur une
 * position qui n'est pas un mat ne prouverait rien.
 *
 * Ces fixtures sont des SQUELETTES du motif — le matériel strictement
 * nécessaire à la figure — et non des positions de partie. C'est délibéré : on
 * teste ici la géométrie que le détecteur doit reconnaître, isolée de tout ce
 * qui l'entoure d'habitude. La confrontation aux vraies parties, elle, se fait
 * à l'ingestion, où le rendement par motif est rapporté thème par thème.
 */
const FIXTURES: Record<MatePattern, string> = {
  // Tour sur la 8e, roi muré par ses propres pions.
  back_rank: "4R1k1/5ppp/8/8/8/8/8/6K1 b - - 0 1",
  // Deux tours en tenaille, roi acculé sans écran.
  ladder: "R6k/1R6/8/8/8/8/8/6K1 b - - 0 1",
  // Cavalier e7 et tour h5 : le roi h7 n'a plus ni g8 ni g6.
  anastasia: "8/4N1pk/8/7R/8/8/8/6K1 b - - 0 1",
  // Tour au contact dans le coin, défendue par le cavalier f6.
  arabian: "7k/7R/5N2/8/8/8/8/6K1 b - - 0 1",
  // Les deux fous se croisent sur un roi enfermé (d7, d8).
  boden: "2kr4/3p4/B7/8/5B2/8/8/6K1 b - - 0 1",
  // Dame au contact adossée au pion g6, la tour f8 bouchant la fuite.
  damiano: "5rk1/7Q/6P1/8/8/8/8/6K1 b - - 0 1",
  // Même dame au contact, défendue cette fois par le fou b2.
  damiano_bishop: "5rk1/6Q1/8/8/8/8/1B6/6K1 b - - 0 1",
  // Les deux fous ET le cavalier g5, roi encore flanqué de sa tour.
  blackburne: "5rk1/7B/8/6N1/8/8/1B6/6K1 b - - 0 1",
  // Le roi e8 est pris entre ses deux tours — ses épaulettes.
  epaulette: "3rkr2/8/4Q3/8/8/8/8/6K1 b - - 0 1",
  // Dame h7 soutenue par le fou d3, roi muré par ses pions f7/g7.
  greco: "5rk1/5ppQ/8/8/8/3B4/8/6K1 b - - 0 1",
  // Tour h7 défendue par le cavalier f6, lui-même défendu par le pion e5.
  hook: "7k/7R/5N2/4P3/8/8/8/6K1 b - - 0 1",
  // C'est le cavalier qui mate, les deux fous fermant les issues.
  legall: "rn1q1bnr/ppp1kB1p/3p2p1/3NN3/4P3/8/PPPP1PPP/R1BbK2R b - - 0 1",
  // Dame g7 épaulée par le pion f6, sur un roque éventré.
  lolli: "6k1/6Q1/5P2/8/8/8/8/6K1 b - - 0 1",
  // Le fou b2 mate sur la grande diagonale, la tour g1 verrouillant la fuite.
  morphy: "7k/7p/8/8/8/8/1B6/6RK b - - 0 1",
  // La position finale de la partie de l'Opéra (Morphy - Brunswick, Paris 1858).
  opera: "1n1Rkb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2K5 b k - 1 17",
  // Tour sur la colonne g, fou de la grande diagonale sur le coin.
  pillsbury: "6Rk/7p/8/8/8/1B6/1B6/6K1 b - - 0 1",
  // Fou au contact, roi emmuré par ses pièces, la dame fermant la dernière case.
  reti: "5rk1/5p1B/8/6N1/8/8/8/QK6 b - - 0 1",
  // Cavalier f7 : le roi h8 est enterré sous ses propres pièces.
  smothered: "6rk/5Npp/8/8/8/8/8/6K1 b - - 0 1",
  // Dame au contact, les deux bloqueurs c7/e7 posés en diagonale.
  dovetail: "8/2p1p3/3k4/1B1Q4/2K5/8/8/8 b - - 0 1",
  // Même dame au contact, mais les bloqueurs d5/d7 sont alignés sur la colonne du roi.
  cozio: "8/3n3R/2Qk4/1K1p4/8/5N2/8/8 b - - 0 1",
  // Tour au contact soutenue par le PION g6, le cavalier e7 ôtant g8.
  vukovic: "7k/4N2R/6P1/8/8/8/8/6K1 b - - 0 1",
  // Les deux fous seuls sur un roi acculé au bord.
  double_bishop: "7k/7p/8/8/8/8/BB6/6K1 b - - 0 1",
  // Roi et tour contre roi nu.
  box: "R6k/8/7K/8/8/8/8/8 b - - 0 1",
  // Dame à distance sur la colonne du roi, défendue par la tour h1.
  triangle: "7k/8/8/5N1Q/8/8/B7/2K4R b - - 0 1",
  // Dame au contact défendue par la tour a7.
  queen_rook: "6k1/R5Q1/8/8/8/8/8/6K1 b - - 0 1",
  // Les deux tours seules, sans dame.
  two_rooks: "R6k/1R6/8/8/8/8/8/6K1 b - - 0 1",
  // Roi et dame contre roi nu.
  king_queen: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1",
  // Dame au contact soutenue par un fou, la tour f8 coinçant le roi sur sa rangée.
  max_lange: "5rk1/6Q1/8/8/8/8/1B6/6K1 b - - 0 1",
  // Le roi est pris en plein échiquier : ni bord, ni pièce à lui autour.
  net: "8/8/8/5Q2/4k1P1/8/7K/3R2B1 b - - 0 1",
};

describe("analyseMate", () => {
  it("ne décortique que de vraies positions matées", () => {
    expect(analyseMate("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")).toBeNull();
    // Échec simple, pas mat : le roi a f8.
    expect(analyseMate("4R1k1/5p1p/8/8/8/8/8/6K1 b - - 0 1")).toBeNull();
    expect(analyseMate("pas une fen")).toBeNull();
  });

  it("relève le roi maté, l'échec et les cases bouchées par son propre camp", () => {
    const shape = analyseMate(FIXTURES.back_rank)!;
    expect(shape.king).toBe("g8");
    expect(shape.loser).toBe("b");
    expect(shape.checkers).toEqual([{ square: "e8", type: "r" }]);
    expect(shape.ownBlockers.sort()).toEqual(["f7", "g7", "h7"]);
    expect(shape.onEdge).toBe(true);
    expect(shape.inCorner).toBe(false);
  });
});

describe("positions réellement matées", () => {
  it.each(Object.entries(FIXTURES))("%s est un mat légal", (_pattern, fen) => {
    const board = new Chess(fen);
    expect(board.isCheckmate()).toBe(true);
  });
});

describe("détecteurs", () => {
  it.each(Object.entries(FIXTURES))("reconnaît le motif %s sur sa position de référence", (pattern, fen) => {
    expect(describeMatePatterns(fen)).toContain(pattern as MatePattern);
  });

  it("couvre les trente motifs du catalogue, sans trou", () => {
    expect(Object.keys(FIXTURES).sort()).toEqual([...MATE_PATTERNS].sort());
  });

  it("ne renvoie rien sur une position qui n'est pas un mat", () => {
    expect(describeMatePatterns("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")).toEqual([]);
  });

  it("renvoie les motifs dans l'ordre déclaré, sans doublon", () => {
    for (const fen of Object.values(FIXTURES)) {
      const patterns = describeMatePatterns(fen);
      expect(new Set(patterns).size).toBe(patterns.length);
      const order = patterns.map((pattern) => MATE_PATTERNS.indexOf(pattern));
      expect(order).toEqual([...order].sort((a, b) => a - b));
    }
  });
});

describe("distinctions revendiquées", () => {
  it("sépare l'étouffé du couloir : le premier est un cavalier, le second une lourde", () => {
    expect(describeMatePatterns(FIXTURES.smothered)).toContain("smothered");
    expect(describeMatePatterns(FIXTURES.smothered)).not.toContain("back_rank");
    expect(describeMatePatterns(FIXTURES.back_rank)).not.toContain("smothered");
  });

  it("sépare le mat arabe du mat de Vukovic par le rôle du cavalier", () => {
    // Arabe : le cavalier défend la tour ET garde la fuite.
    expect(describeMatePatterns(FIXTURES.arabian)).toContain("arabian");
    expect(describeMatePatterns(FIXTURES.arabian)).not.toContain("vukovic");
    // Vukovic : la tour est tenue par un pion, le cavalier ne fait que garder.
    expect(describeMatePatterns(FIXTURES.vukovic)).toContain("vukovic");
    expect(describeMatePatterns(FIXTURES.vukovic)).not.toContain("arabian");
  });

  it("sépare la queue d'aronde du mat de Cozio par l'orientation des bloqueurs", () => {
    expect(describeMatePatterns(FIXTURES.dovetail)).toContain("dovetail");
    expect(describeMatePatterns(FIXTURES.dovetail)).not.toContain("cozio");
    expect(describeMatePatterns(FIXTURES.cozio)).toContain("cozio");
    expect(describeMatePatterns(FIXTURES.cozio)).not.toContain("dovetail");
  });

  it("sépare Damiano de son fou par la pièce qui soutient la dame", () => {
    expect(describeMatePatterns(FIXTURES.damiano)).toContain("damiano");
    expect(describeMatePatterns(FIXTURES.damiano)).not.toContain("damiano_bishop");
    expect(describeMatePatterns(FIXTURES.damiano_bishop)).toContain("damiano_bishop");
    expect(describeMatePatterns(FIXTURES.damiano_bishop)).not.toContain("damiano");
  });

  it("assume les recouvrements réels plutôt que de les masquer", () => {
    // Le mat de l'Opéra EST un mat du couloir — avec le fou en plus.
    expect(describeMatePatterns(FIXTURES.opera)).toEqual(expect.arrayContaining(["back_rank", "opera"]));
    // Le mat des deux tours EST un escalier.
    expect(describeMatePatterns(FIXTURES.two_rooks)).toEqual(expect.arrayContaining(["ladder", "two_rooks"]));
    // Le crochet est un mat arabe doublé d'un pion.
    expect(describeMatePatterns(FIXTURES.hook)).toEqual(expect.arrayContaining(["arabian", "hook"]));
  });
});
