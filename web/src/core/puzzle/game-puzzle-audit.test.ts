import { describe, expect, it } from "vitest";
import {
  buildGameErrorComment,
  isAccusationRefuted,
  isForcedReply,
  judgeSolverPly,
  materialSwingAlong,
  recalibrateGamePuzzleDeck,
  type EngineLine,
} from "./game-puzzle-audit";
import { parseCoachComment } from "@/core/chess/move-tree";

const cp = (v: number, ...pv: string[]): EngineLine => ({ kind: "cp", v, pv });
const mate = (v: number, ...pv: string[]): EngineLine => ({ kind: "mate", v, pv });

describe("judgeSolverPly", () => {
  it("accepte le meilleur coup avec une nette avance sur le 2e", () => {
    expect(judgeSolverPly("e2e4", [cp(300, "e2e4"), cp(20, "d2d4")])).toEqual({ ok: true, reason: "unique", alternatives: [] });
  });

  it("refuse un coup qui n'est pas le premier choix du moteur", () => {
    expect(judgeSolverPly("d2d4", [cp(300, "e2e4"), cp(20, "d2d4")])).toEqual({ ok: false, reason: "not-best" });
  });

  it("refuse une solution ambiguë (deux coups gagnent autant)", () => {
    expect(judgeSolverPly("e2e4", [cp(800, "e2e4"), cp(700, "d2d4")])).toEqual({ ok: false, reason: "ambiguous" });
  });

  it("tolère uniquement des mats forcés équivalents, rangés en alternatives", () => {
    expect(judgeSolverPly("h5f7", [mate(2, "h5f7"), mate(2, "h5h7")])).toEqual({
      ok: true,
      reason: "mate-equivalent",
      alternatives: ["h5h7"],
    });
  });

  it("un mat unique reste unique même si le 2e coup gagne largement", () => {
    expect(judgeSolverPly("h5f7", [mate(1, "h5f7"), cp(900, "h5h7")]).ok).toBe(true);
  });

  it("refuse un coup qui ne mate pas quand le mat existe", () => {
    expect(judgeSolverPly("h5h7", [mate(1, "h5f7"), cp(900, "h5h7")]).ok).toBe(false);
  });
});

describe("isForcedReply", () => {
  it("accepte la meilleure défense ou une défense à peine moins bonne", () => {
    expect(isForcedReply("e7e5", [cp(-50, "e7e5")])).toBe(true);
    expect(isForcedReply("c7c5", [cp(-50, "e7e5"), cp(-70, "c7c5")])).toBe(true);
    expect(isForcedReply("g7g5", [cp(-50, "e7e5")], cp(-600, "g7g5"))).toBe(false);
  });
});

describe("isAccusationRefuted", () => {
  it("réfute une « erreur » qui ne coûte presque rien", () => {
    expect(isAccusationRefuted(cp(40), cp(-20))).toBe(true);
  });

  it("confirme une vraie gaffe", () => {
    expect(isAccusationRefuted(cp(40), cp(450))).toBe(false);
  });

  it("confirme toujours un mat qui s'évapore", () => {
    expect(isAccusationRefuted(mate(3), cp(-900))).toBe(false);
  });
});

describe("materialSwingAlong", () => {
  it("compte la dame gagnée au bout de la PV", () => {
    // La tour d8 prend la dame d1, le roi reprend : +9 -5 pour les Noirs.
    const fen = "3r2k1/8/8/8/8/8/8/3QK3 b - - 0 1";
    expect(materialSwingAlong(fen, ["d8d1", "e1d1"], "b")).toBe(4);
  });
});

describe("recalibrateGamePuzzleDeck", () => {
  const middlegame = "r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 12";

  it("un mat manqué prime sur tout", () => {
    expect(recalibrateGamePuzzleDeck({ fenBefore: middlegame, mateMissed: true, materialLostByPlayed: 5, materialWonByBest: 0 })).toBe(
      "missed_checkmates",
    );
  });

  it("une erreur au coup 4 va dans les erreurs d'ouverture", () => {
    const fen = "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 4";
    expect(recalibrateGamePuzzleDeck({ fenBefore: fen, mateMissed: false, materialLostByPlayed: 3, materialWonByBest: 0 })).toBe(
      "opening_mistakes",
    );
  });

  it("une gaffe matérielle en milieu de partie va dans les erreurs tactiques", () => {
    expect(recalibrateGamePuzzleDeck({ fenBefore: middlegame, mateMissed: false, materialLostByPlayed: 3, materialWonByBest: 0 })).toBe(
      "tactical_mistakes",
    );
  });

  it("un gain matériel raté va dans les tactiques manquées, sinon positionnel", () => {
    expect(recalibrateGamePuzzleDeck({ fenBefore: middlegame, mateMissed: false, materialLostByPlayed: 0, materialWonByBest: 3 })).toBe(
      "missed_tactics",
    );
    expect(recalibrateGamePuzzleDeck({ fenBefore: middlegame, mateMissed: false, materialLostByPlayed: 1, materialWonByBest: 1 })).toBe(
      "positional_mistakes",
    );
  });
});

describe("buildGameErrorComment", () => {
  it("nomme la pièce perdue, sa case et le bon coup, au format [%txt]", () => {
    // Blancs : Dd1-h5 ?? laisse la dame à la merci du cavalier f6 ; il fallait Cf3.
    const fen = "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 2 3";
    const comment = buildGameErrorComment({
      fenBefore: fen,
      playedUci: "d1h5",
      best: cp(30, "g1f3"),
      afterPlayed: cp(800, "f6h5"),
      deck: "opening_mistakes",
    });
    expect(comment).not.toBeNull();
    expect(comment!.text).toContain("ta dame part de d1 vers h5");
    expect(comment!.text).toContain("prend ta dame en h5");
    expect(comment!.text).toContain("Il fallait Nf3");
    const parsed = parseCoachComment(comment!.raw);
    expect(parsed.freeze).toBe(true);
    expect(parsed.text).toBe(comment!.text);
    expect(parsed.highlights).toContainEqual({ square: "h5", color: "red" });
    expect(parsed.arrows).toContainEqual({ from: "g1", to: "f3", color: "green" });
  });
});
