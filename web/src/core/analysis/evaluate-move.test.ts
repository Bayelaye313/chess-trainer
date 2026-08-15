import { describe, expect, it } from "vitest";
import { applyBookOverride, evaluateMove, type EvaluatedMove } from "./evaluate-move";
import type { PositionAnalyser, PositionEvaluation } from "./types";

const NO_LIMIT = { depth: 1 };

function evaluation(partial: Partial<PositionEvaluation>): PositionEvaluation {
  return { cp: 0, mate: null, bestMoveUci: null, pv: [], depth: 1, secondBest: null, ...partial };
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

  it("un sacrifice qui était le SEUL coup valable reste critique, pas brillant", async () => {
    // Même position, mais cette fois le moteur expose un second choix bien
    // pire (secondBest) : la position est critique. Le sacrifice ne relevait
    // d'aucune inventivité — c'était le seul coup qui tienne. Régression du
    // bug signalé : « ce que tu appelles Brillant est en fait Critique ».
    const fen = "4k2r/5ppp/8/4N3/8/8/8/4K3 w k - 0 20";
    const afterNxf7 = "4k2r/5Npp/8/8/8/8/8/4K3 b k - 0 20";

    const analyser = stubAnalyser({
      [fen]: evaluation({ cp: 30, bestMoveUci: "e5f7", secondBest: { cp: -600, mate: null } }),
      [afterNxf7]: evaluation({ cp: 40 }),
    });

    const result = await evaluateMove(analyser, fen, "e5f7", NO_LIMIT);

    expect(result.quality).toBe("critical");
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
});

describe("applyBookOverride", () => {
  const evaluated: EvaluatedMove = {
    fenBefore: START,
    fenAfter: AFTER_E4,
    uci: "e2e4",
    san: "e4",
    bestUci: "d2d4",
    bestSan: "d4",
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
