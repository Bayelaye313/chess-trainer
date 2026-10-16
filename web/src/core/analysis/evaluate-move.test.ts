import { describe, expect, it } from "vitest";
import { applyBookOverride, evaluateMove, type EvaluatedMove } from "./evaluate-move";
import type { PositionAnalyser, PositionEvaluation } from "./types";

const NO_LIMIT = { depth: 1 };

function evaluation(partial: Partial<PositionEvaluation>): PositionEvaluation {
  return { cp: 0, mate: null, bestMoveUci: null, pv: [], depth: 1, secondBest: null, lines: [], ...partial };
}

/**
 * Moteur factice : renvoie l'évaluation associée à chaque FEN.
 * Permet de tester toute la logique de qualification sans lancer Stockfish.
 */
function stubAnalyser(byFen: Record<string, PositionEvaluation>): PositionAnalyser {
  return {
    async analyse(fen) {
      const found = byFen[fen];
      if (!found) throw new Error(`FEN non prévu par le stub : ${fen}`);
      return found;
    },
  };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AFTER_E4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";

describe("evaluateMove", () => {
  it("qualifie de meilleur coup un coup qui matche exactement celui du moteur", async () => {
    const analyser = stubAnalyser({
      [START]: evaluation({ cp: 30, bestMoveUci: "e2e4" }),
      [AFTER_E4]: evaluation({ cp: 25 }),
    });

    const result = await evaluateMove(analyser, START, "e2e4", NO_LIMIT);

    expect(result.san).toBe("e4");
    expect(result.cpLoss).toBe(5);
    expect(result.quality).toBe("best");
    expect(result.deck).toBeNull();
  });

  it("compte la perte du point de vue du joueur, pas des Blancs", async () => {
    // Trait aux Noirs : les scores sont stockés POV Blancs, une hausse du score
    // blanc est une perte pour les Noirs.
    const blackToMove = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    const afterA6 = "rnbqkbnr/1ppppppp/p7/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

    const analyser = stubAnalyser({
      [blackToMove]: evaluation({ cp: 20, bestMoveUci: "e7e5" }),
      [afterA6]: evaluation({ cp: 140 }),
    });

    const result = await evaluateMove(analyser, blackToMove, "a7a6", NO_LIMIT);

    expect(result.cpLoss).toBe(120);
    // 20cp (48.2%) → -140cp (37.4%) POV Noirs : perte de ~10.8 points de gain,
    // dans la tranche Imprécision (voir OKAY_MAX_LOSS/BLUNDER_MIN_LOSS).
    expect(result.quality).toBe("inaccuracy");
  });

  it("qualifie de critique le meilleur coup quand l'alternative est bien pire (MultiPV)", async () => {
    const analyser = stubAnalyser({
      [START]: evaluation({ cp: 30, bestMoveUci: "e2e4", secondBest: { cp: -500, mate: null } }),
      [AFTER_E4]: evaluation({ cp: 25 }),
    });

    const result = await evaluateMove(analyser, START, "e2e4", NO_LIMIT);

    expect(result.quality).toBe("critical");
  });

  it("propage les lignes candidates du moteur (bestLines) pour l'affichage des flèches", async () => {
    const lines = [
      { uci: "e2e4", cp: 30, mate: null },
      { uci: "d2d4", cp: 20, mate: null },
      { uci: "g1f3", cp: 10, mate: null },
    ];
    const analyser = stubAnalyser({
      [START]: evaluation({ cp: 30, bestMoveUci: "e2e4", lines }),
      [AFTER_E4]: evaluation({ cp: 25 }),
    });

    const result = await evaluateMove(analyser, START, "e2e4", NO_LIMIT);

    // Telles quelles, aucune transformation : ce sont les lignes de la position
    // AVANT le coup joué (`evalBefore.lines`), pas celles d'après.
    expect(result.bestLines).toEqual(lines);
  });

  it("propage la variante principale complète du moteur (bestPv), pas seulement le premier coup", async () => {
    // Sert à construire un puzzle multi-coups (voir
    // `spaced-repetition.ts#extendPuzzleSolution`) : la PV entière, pas
    // seulement `bestMoveUci`.
    const pv = ["e2e4", "e7e5", "g1f3"];
    const analyser = stubAnalyser({
      [START]: evaluation({ cp: 30, bestMoveUci: "e2e4", pv }),
      [AFTER_E4]: evaluation({ cp: 25 }),
    });

    const result = await evaluateMove(analyser, START, "e2e4", NO_LIMIT);

    expect(result.bestPv).toEqual(pv);
  });

  it("surclasse en brillant un sacrifice quand il y avait une alternative", async () => {
    // Nxf7 : le cavalier est repris par le roi, mais ce n'est pas le seul bon
    // coup (pas de secondBest fourni → pas critique) — la définition même du
    // « Brillant » : un don de matériel qu'on n'était pas obligé de jouer.
    const fen = "4k2r/5ppp/8/4N3/8/8/8/4K3 w k - 0 20";
    const afterNxf7 = "4k2r/5Npp/8/8/8/8/8/4K3 b k - 0 20";

    const analyser = stubAnalyser({
      [fen]: evaluation({ cp: 30, bestMoveUci: "e5f7" }),
      [afterNxf7]: evaluation({ cp: 40 }),
    });

    const result = await evaluateMove(analyser, fen, "e5f7", NO_LIMIT);

    expect(result.quality).toBe("brilliant");
  });

  it("reste brillant même quand le second choix moteur (MultiPV) est nettement plus bas — régression du bug « Brillant absorbé par Critique »", async () => {
    // Repro du bug rapporté : avec MultiPV actif, le second choix (ne pas
    // sacrifier) est presque toujours nettement moins bon que le sacrifice
    // gagnant — ce qui produisait systématiquement un gros `secondBestGap` et
    // faisait retomber le coup en `critical` avant même qu'`isBrilliantSacrifice`
    // ait pu se prononcer. Ici le second choix (cp 50, POV Blancs) reste tout
    // à fait tenable pour les Blancs (~55% de gain, au-dessus de l'égalité)
    // malgré un gros écart avec le sacrifice (cp 900) — ce n'était donc PAS la
    // seule façon de sauver la position, juste une idée bien plus forte : la
    // vraie définition du Brillant.
    const fen = "4k2r/5ppp/8/4N3/8/8/8/4K3 w k - 0 20";
    const afterNxf7 = "4k2r/5Npp/8/8/8/8/8/4K3 b k - 0 20";

    const analyser = stubAnalyser({
      [fen]: evaluation({ cp: 900, bestMoveUci: "e5f7", secondBest: { cp: 50, mate: null } }),
      [afterNxf7]: evaluation({ cp: 850 }),
    });

    const result = await evaluateMove(analyser, fen, "e5f7", NO_LIMIT);

    expect(result.quality).toBe("brilliant");
  });

  it("ne surclasse PAS en brillant un sacrifice qui est le meilleur coup mais laisse la position perdante", async () => {
    // Régression du bug rapporté : un coup « proche du sommet du classement
    // moteur » (ici même l'exact meilleur coup) ne suffit pas si ce sommet
    // reste perdant. Position déjà très mauvaise pour les Blancs (-500) ;
    // Nxf7 est le meilleur coup possible (le moins pire) et sacrifie bien un
    // cavalier, mais la position qui suit reste largement perdante (-450,
    // ~16% de gain) — le moteur ne confirme pas un retournement, donc pas de
    // Brillant. Reste « best » : c'est objectivement le bon coup à jouer,
    // juste pas un éclair de génie qui change l'issue de la partie.
    const fen = "4k2r/5ppp/8/4N3/8/8/8/4K3 w k - 0 20";
    const afterNxf7 = "4k2r/5Npp/8/8/8/8/8/4K3 b k - 0 20";

    const analyser = stubAnalyser({
      [fen]: evaluation({ cp: -500, bestMoveUci: "e5f7" }),
      [afterNxf7]: evaluation({ cp: -450 }),
    });

    const result = await evaluateMove(analyser, fen, "e5f7", NO_LIMIT);

    expect(result.quality).toBe("best");
  });

  it("un sacrifice qui était le SEUL coup valable devient quand même brillant — Brillant prime sur Critique", async () => {
    // Même position, avec un second choix bien pire (secondBest) : sans le
    // sacrifice, la position s'effondrerait (`critical` au sens de
    // classify.ts). Cahier des charges explicite (2026-09-03) : Brillant a
    // priorité ABSOLUE sur Critique, peu importe l'écart avec le second
    // coup — un don de matériel volontaire qui reste gagnant reste plus
    // impressionnant qu'un simple coup forcé, même quand ce même coup était
    // aussi, techniquement, le seul qui tienne.
    const fen = "4k2r/5ppp/8/4N3/8/8/8/4K3 w k - 0 20";
    const afterNxf7 = "4k2r/5Npp/8/8/8/8/8/4K3 b k - 0 20";

    const analyser = stubAnalyser({
      [fen]: evaluation({ cp: 30, bestMoveUci: "e5f7", secondBest: { cp: -600, mate: null } }),
      [afterNxf7]: evaluation({ cp: 40 }),
    });

    const result = await evaluateMove(analyser, fen, "e5f7", NO_LIMIT);

    expect(result.quality).toBe("brilliant");
  });

  it("une reprise forcée (seul coup légal) qui n'est pas un sacrifice reste meilleur coup, jamais critique", async () => {
    // Un unique coup légal disponible (reprise de la Dame qui vient de mettre
    // le Roi en échec) ; le pion noir sert juste à garder assez de matériel
    // sur l'échiquier après la reprise pour que la partie ne se termine pas
    // (K+p vs K n'est pas nul par manque de matériel, contrairement à K vs K).
    // Avant la correction, `onlyLegalMove` forçait `critical` à tort — une
    // reprise évidente, sans aucun choix possible, n'a rien d'une trouvaille.
    const fen = "7k/8/8/8/8/p7/6q1/7K w - - 0 1";
    const afterKxg2 = "7k/8/8/8/8/p7/6K1/8 b - - 0 1";

    const analyser = stubAnalyser({
      [fen]: evaluation({ cp: -50, bestMoveUci: "h1g2" }),
      [afterKxg2]: evaluation({ cp: -20 }),
    });

    const result = await evaluateMove(analyser, fen, "h1g2", NO_LIMIT);

    expect(result.quality).toBe("best");
  });

  it("range une gaffe dans un deck", async () => {
    const analyser = stubAnalyser({
      [START]: evaluation({ cp: 30, bestMoveUci: "d2d4" }),
      [AFTER_E4]: evaluation({ cp: -500 }),
    });

    const result = await evaluateMove(analyser, START, "e2e4", NO_LIMIT);

    expect(result.quality).toBe("blunder");
    // Coup 1 : on est dans l'ouverture, quel que soit le motif.
    expect(result.deck).toBe("opening_mistakes");
  });

  it("ne signale pas un mat manqué quand le mat est conservé", async () => {
    // Mat en 2 disponible ; le coup joué garde un mat en 1 pour le camp au trait.
    const fen = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 40";
    const afterRa8 = "R5k1/5ppp/8/8/8/8/8/6K1 b - - 1 40";

    const analyser = stubAnalyser({
      [fen]: evaluation({ cp: null, mate: 2, bestMoveUci: "a1a8" }),
      [afterRa8]: evaluation({ cp: null, mate: 1 }),
    });

    const result = await evaluateMove(analyser, fen, "a1a8", NO_LIMIT);

    expect(result.mateMissed).toBe(false);
  });

  it("signale un mat manqué quand le mat disparaît", async () => {
    const fen = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 40";
    const afterRb1 = "6k1/5ppp/8/8/8/8/8/1R4K1 b - - 1 40";

    const analyser = stubAnalyser({
      [fen]: evaluation({ cp: null, mate: 2, bestMoveUci: "a1a8" }),
      [afterRb1]: evaluation({ cp: 300, mate: null }),
    });

    const result = await evaluateMove(analyser, fen, "a1b1", NO_LIMIT);

    expect(result.mateMissed).toBe(true);
    expect(result.deck).toBe("missed_checkmates");
  });

  it("rejette un coup illégal", async () => {
    const analyser = stubAnalyser({});
    await expect(evaluateMove(analyser, START, "e2e5", NO_LIMIT)).rejects.toThrow(
      /Coup illégal/,
    );
  });

  it("ne qualifie JAMAIS de théorique un raté d'analyse moteur — book ne vient que d'applyBookOverride", async () => {
    // Ni centipions ni mat des deux côtés : le moteur n'a rien renvoyé
    // d'exploitable pour une position qui n'a pourtant rien de théorique
    // (régression du bug « book » utilisé comme fourre-tout pour l'absence de
    // score, voir CLAUDE.md « Book Moves »). Le coup reste neutre (`okay`),
    // jamais étiqueté théorique sans vraie vérification ECO.
    const analyser = stubAnalyser({
      [START]: evaluation({ cp: null, mate: null, bestMoveUci: "d2d4" }),
      [AFTER_E4]: evaluation({ cp: null, mate: null }),
    });

    const result = await evaluateMove(analyser, START, "e2e4", NO_LIMIT);

    expect(result.quality).toBe("okay");
  });

  it("reprise évidente (previousMove fourni) → meilleur coup, jamais critique, même si l'alternative s'effondre", async () => {
    // Le cavalier blanc en d5 vient (par hypothèse, voir `previousMove` passé
    // ci-dessous) de capturer une pièce noire ; les Noirs reprennent avec leur
    // cavalier f6. Sans le garde-fou `isObviousRecapture`, ce gros écart avec
    // une alternative qui s'effondre (ne pas reprendre laisse le matériel
    // perdu) classerait ce coup « Critique » — exactement le bug utilisateur
    // signalé (« une reprise évidente n'est pas un coup critique »).
    // Un pion blanc en plus (e2) évite que chess.js ne classe la position
    // d'arrivée comme nulle par matériel insuffisant (K+N vs K nu le serait).
    const fenBefore = "4k3/8/5n2/3N4/8/8/4P3/4K3 b - - 0 1";
    const fenAfter = "4k3/8/8/3n4/8/8/4P3/4K3 w - - 0 2";

    const analyser = stubAnalyser({
      [fenBefore]: evaluation({
        cp: -20,
        bestMoveUci: "f6d5",
        secondBest: { cp: 900, mate: null },
      }),
      [fenAfter]: evaluation({ cp: -10 }),
    });

    const result = await evaluateMove(analyser, fenBefore, "f6d5", NO_LIMIT, {
      to: "d5",
      wasCapture: true,
    });

    expect(result.quality).toBe("best");
  });
});

describe("applyBookOverride", () => {
  const evaluated: EvaluatedMove = {
    fenBefore: START,
    fenAfter: AFTER_E4,
    uci: "e2e4",
    san: "e4",
    bestUci: "d2d4",
    bestSan: "d4",
    bestPv: ["d2d4"],
    bestLines: [],
    quality: "blunder",
    cpLoss: 500,
    cpBefore: 30,
    mateBefore: null,
    cpAfter: -470,
    mateAfter: null,
    phase: "opening",
    mateMissed: false,
    tactical: false,
    motifs: [],
    deck: "opening_mistakes",
  };

  it("laisse le coup intact hors théorie", () => {
    expect(applyBookOverride(evaluated, false)).toEqual(evaluated);
  });

  it("surclasse en théorique quel que soit le score moteur — même une gaffe apparente", () => {
    // Règle CLAUDE.md explicite : « If a move is in the book theory, its
    // evaluation score doesn't matter ; it must be labeled book. »
    const result = applyBookOverride(evaluated, true);
    expect(result.quality).toBe("book");
    expect(result.deck).toBeNull();
    // Le reste (scores, SAN...) n'est pas altéré — seule l'étiquette change.
    expect(result.cpLoss).toBe(evaluated.cpLoss);
  });
});
