import { describe, expect, it } from "vitest";
import { computeHeuristicCommentary } from "./heuristic-commentary";
import { GENERIC_BOOK_COMMENT } from "./opening-commentary";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Régression directe du retour utilisateur (« les hints ne sont jamais
 * adaptés, ex. Zukertort ») : `GENERIC_BOOK_COMMENT` était le seul repli
 * disponible hors des ~20 chapitres curatés à la main
 * (`opening-commentary.ts`) — un texte FIXE, identique quel que soit le coup
 * réel. Ce module analyse le coup lui-même (chess.js) pour produire un texte
 * spécifique, sur n'importe quelle position — voir son docstring.
 */
describe("computeHeuristicCommentary", () => {
  it("détecte le développement d'une pièce mineure depuis sa case de départ", () => {
    const result = computeHeuristicCommentary(START_FEN, "g1f3");
    expect(result.comment).toContain("Développe");
    expect(result.comment).toContain("cavalier");
    expect(result).not.toEqual(GENERIC_BOOK_COMMENT);
  });

  it("détecte une poussée de pion centrale", () => {
    const result = computeHeuristicCommentary(START_FEN, "e2e4");
    expect(result.comment).toContain("case centrale");
  });

  it("ne révèle jamais la case d'arrivée ni le coup lui-même dans le texte de l'indice", () => {
    const result = computeHeuristicCommentary(START_FEN, "e2e4");
    expect(result.hint).not.toContain("e4");
  });

  it("détecte le roque et distingue petit/grand roque", () => {
    const kingside = computeHeuristicCommentary(
      "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "e1g1",
    );
    expect(kingside.comment).toContain("aile roi");

    const queenside = computeHeuristicCommentary(
      "r3kbnr/pppqpppp/2np4/8/3P4/2N1PN2/PPPQ1PPP/R3KB1R b KQkq - 6 5",
      "e8c8",
    );
    expect(queenside.comment).toContain("aile dame");
  });

  it("détecte une capture et signale le gain de matériel", () => {
    const result = computeHeuristicCommentary(
      "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3",
      "e5d4",
    );
    expect(result.comment).toContain("Capture");
    expect(result.comment).toContain("matériel");
  });

  it("détecte un échec sans capture", () => {
    const result = computeHeuristicCommentary("4k3/8/8/8/8/8/8/R3K3 w - - 0 1", "a1a8");
    expect(result.comment).toContain("échec");
  });

  it("priorise la réponse à un échec sur toute autre analyse", () => {
    // Roi noir en échec par la tour blanche sur la colonne e — seule une
    // réponse à l'échec compte, peu importe que le coup développe par ailleurs.
    const result = computeHeuristicCommentary("4k3/8/8/8/8/8/4R3/4K3 b - - 0 1", "e8d8");
    expect(result.comment).toContain("échec");
    expect(result.hint).toContain("Réponds d'abord à l'échec");
  });

  it("détecte le fianchetto du fou-roi", () => {
    const result = computeHeuristicCommentary("rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQKBNR w KQkq - 0 1", "f1g2");
    expect(result.comment).toContain("Fianchetto");
  });

  it("détecte qu'un coup met en cause un pion adverse resté sans défenseur", () => {
    // 1.e4 e5 2.Nf3 : le cavalier attaque e5, qui n'a encore aucun défenseur.
    const result = computeHeuristicCommentary(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "g1f3",
    );
    expect(result.comment).toContain("Attaque le pion adverse");
  });

  it("détecte qu'une pièce propre est attaquée sans défense et que le coup l'éloigne du danger", () => {
    // Cavalier noir en e5 attaqué en diagonale par la dame blanche en b2, sans
    // aucun défenseur noir — Nc6 l'éloigne du danger.
    const result = computeHeuristicCommentary("4k3/8/8/4n3/8/8/1Q6/4K3 b - - 0 1", "e5c6");
    expect(result.comment).toContain("sans aucun défenseur");
    expect(result.hint).toContain("Une de tes pièces est attaquée sans défense");
  });

  it("détecte qu'une pièce propre attaquée est défendue sur place plutôt que déplacée", () => {
    const result = computeHeuristicCommentary("4k3/3p4/8/4n3/8/8/1Q6/4K3 b - - 0 1", "d7d6");
    expect(result.comment).toContain("sans avoir besoin de la déplacer");
  });

  it("retombe sur un texte encore spécifique au type de pièce si aucune catégorie ne correspond", () => {
    const result = computeHeuristicCommentary("7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4b5");
    expect(result.comment).toContain("cavalier");
    expect(result).not.toEqual(GENERIC_BOOK_COMMENT);
  });

  it("retombe sur GENERIC_BOOK_COMMENT si le coup fourni est illégal (donnée corrompue)", () => {
    expect(computeHeuristicCommentary(START_FEN, "e2e5")).toEqual(GENERIC_BOOK_COMMENT);
  });
});
