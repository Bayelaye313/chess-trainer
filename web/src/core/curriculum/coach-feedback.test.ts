import { describe, expect, it } from "vitest";
import { attachEngineSuggestion, mainLine, parseMoveTree, plyOffsetOf } from "@/core/chess/move-tree";
import { buildCoachFeedback, moveNumberLabel } from "./coach-feedback";

describe("moveNumberLabel", () => {
  it("numérote les Blancs avec « . » et les Noirs avec « … »", () => {
    expect(moveNumberLabel(1)).toBe("1.");
    expect(moveNumberLabel(2)).toBe("1…");
    expect(moveNumberLabel(23)).toBe("12.");
    expect(moveNumberLabel(24)).toBe("12…");
  });
});

describe("buildCoachFeedback", () => {
  it("renvoie un modèle vide mais valide pour la racine du chapitre", () => {
    const root = parseMoveTree("1. e4 e5");
    expect(buildCoachFeedback(root)).toEqual({ moveNumber: null, san: null, comment: null, tip: null, engine: null, isEmpty: true });
  });

  it("assemble commentaire, conseil et suggestion moteur en un seul modèle", () => {
    const root = parseMoveTree("1. d4 { Coup central. PRO TIP : vise e5. } d5");
    const d4 = mainLine(root)[0];
    attachEngineSuggestion(root, d4.id, { san: "d5", uci: "d7d5", cp: 25, mate: null });
    const feedback = buildCoachFeedback(d4);
    expect(feedback.moveNumber).toBe("1.");
    expect(feedback.san).toBe("d4");
    expect(feedback.comment).toBe("Coup central.");
    expect(feedback.tip).toBe("vise e5.");
    expect(feedback.engine).toMatchObject({ san: "d5", uci: "d7d5", cp: 25, mate: null });
    expect(feedback.isEmpty).toBe(false);
  });

  it("marque vide un coup sans commentaire, conseil ni moteur", () => {
    const d5 = mainLine(parseMoveTree("1. d4 d5"))[1];
    const feedback = buildCoachFeedback(d5);
    expect(feedback.moveNumber).toBe("1…");
    expect(feedback.isEmpty).toBe(true);
  });

  it("affiche le vrai numéro de coup d'un chapitre qui démarre en milieu de partie", () => {
    const fen = "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4";
    const root = parseMoveTree("Qxf7#", fen);
    expect(plyOffsetOf(fen)).toBe(6);
    expect(buildCoachFeedback(mainLine(root)[0], plyOffsetOf(fen)).moveNumber).toBe("4.");
    expect(plyOffsetOf("8/8/8/8/8/8/8/K6k b - - 0 24")).toBe(47);
  });
});
