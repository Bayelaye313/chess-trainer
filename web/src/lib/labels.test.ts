import { describe, expect, it } from "vitest";
import { encodeTrainingReason } from "@/core/training/reasons";
import { formatTrainingHeadline, formatTrainingProof } from "./labels";

/**
 * La carte « Séance du jour » promet une preuve locale par carte
 * (`TrainingRecommendationsCard`) : ces tests verrouillent la traduction de
 * chaque `reason_code` en titre + ligne de preuve vérifiables.
 */
describe("formatTrainingHeadline", () => {
  it("cite le motif et le nombre d'occurrences pour un motif manqué", () => {
    const reasonCode = encodeTrainingReason("motif-missed", { motif: "fork", missCount: 3, avgCpLoss: 120 });
    expect(formatTrainingHeadline(reasonCode)).toBe("Motif Fourchette manqué 3 fois");
  });

  it("distingue une erreur décisive d'une erreur chiffrée en centipions", () => {
    const decisive = encodeTrainingReason("game-error", { avgCpLoss: 1500 });
    expect(formatTrainingHeadline(decisive)).toBe("Erreur décisive (mat ou perte lourde)");
    const bounded = encodeTrainingReason("game-error", { avgCpLoss: 80 });
    expect(formatTrainingHeadline(bounded)).toBe("Erreur de partie (−80 cp)");
  });

  it("ne répète plus le compte de parties dans le titre d'un piège du répertoire", () => {
    const reasonCode = encodeTrainingReason("trap-family-played", {
      trapFamily: "Italienne",
      eco: "C50",
      gameCount: 12,
    });
    expect(formatTrainingHeadline(reasonCode)).toBe("Piège de ton répertoire (Italienne)");
  });
});

describe("formatTrainingProof", () => {
  it("puzzle dû : motif + deck rendent deux cartes « en retard de X j » distinctes", () => {
    const reasonCode = encodeTrainingReason("puzzle-due", {
      daysOverdue: 53,
      motif: "back_rank_mate",
      deck: "missed_checkmates",
    });
    expect(formatTrainingHeadline(reasonCode)).toBe("Puzzle en retard de 53 j");
    expect(formatTrainingProof({ entityId: "p1", reasonCode })).toBe("Mat du couloir · deck Mats manqués");
  });

  it("puzzle dû sans motif : le deck seul reste une preuve de provenance", () => {
    const reasonCode = encodeTrainingReason("puzzle-due", { daysOverdue: 2, deck: "positional_mistakes" });
    expect(formatTrainingProof({ entityId: "p1", reasonCode })).toBe("deck Erreurs positionnelles");
  });

  it("variante dûe : famille + variante + retard + dernier score, tout local", () => {
    const reasonCode = encodeTrainingReason("opening-due", {
      daysOverdue: 5,
      openingName: "Ruy Lopez (Espagnole)",
      variation: "Ligne principale",
      accuracy: 72,
    });
    expect(formatTrainingProof({ entityId: "ruy-lopez:main_line", reasonCode })).toBe(
      "Ruy Lopez (Espagnole) · Ligne principale · 5 j de retard · 72 % au dernier passage",
    );
  });

  it("sortie de théorie : cite la perte en centipions sur le coup", () => {
    const reasonCode = encodeTrainingReason("theory-exit", {
      theoryExitPly: 13,
      openingName: "Sicilienne",
      avgCpLoss: 95,
    });
    expect(formatTrainingProof({ entityId: "g1:13", reasonCode })).toBe("−95 cp sur le coup");
  });

  it("erreur de partie : localise le coup fautif et nomme l'ouverture", () => {
    const reasonCode = encodeTrainingReason("game-error", { avgCpLoss: 240, openingName: "Sicilienne" });
    expect(formatTrainingProof({ entityId: "game-42:17", reasonCode })).toBe("Coup 9 · Sicilienne");
  });

  it("erreur de partie sans ouverture : le coup seul suffit, jamais de texte inventé", () => {
    const reasonCode = encodeTrainingReason("game-error", { avgCpLoss: 240 });
    expect(formatTrainingProof({ entityId: "game-42:4", reasonCode })).toBe("Coup 2");
    expect(formatTrainingProof({ entityId: "sans-ply", reasonCode })).toBeNull();
  });

  it("piège à entretenir : famille + ECO + ancienneté", () => {
    const reasonCode = encodeTrainingReason("trap-due", {
      trapName: "Fried Liver",
      trapFamily: "Italienne",
      eco: "C58",
      daysOverdue: 21,
    });
    expect(formatTrainingProof({ entityId: "fried-liver", reasonCode })).toBe(
      "Italienne · ECO C58 · 21 j sans révision",
    );
  });

  it("réfutation oubliée : famille + ECO + indice utilisé le cas échéant", () => {
    const withHints = encodeTrainingReason("trap-refutation-forgotten", {
      trapName: "Fried Liver",
      trapFamily: "Italienne",
      eco: "C58",
      hintsUsed: 2,
    });
    expect(formatTrainingProof({ entityId: "fried-liver", reasonCode: withHints })).toBe(
      "Italienne · ECO C58 · 2 indices utilisés",
    );
    const noHints = encodeTrainingReason("trap-refutation-forgotten", {
      trapName: "Fried Liver",
      trapFamily: "Italienne",
      eco: "C58",
    });
    expect(formatTrainingProof({ entityId: "fried-liver", reasonCode: noHints })).toBe(
      "Italienne · ECO C58 · réponse ratée à la dernière séance",
    );
  });

  it("piège du répertoire : ECO + fréquence de jeu, déplacés hors du titre", () => {
    const reasonCode = encodeTrainingReason("trap-family-played", {
      trapFamily: "Italienne",
      eco: "C50",
      gameCount: 12,
    });
    expect(formatTrainingProof({ entityId: "fried-liver", reasonCode })).toBe("ECO C50 · 12 parties jouées");
  });

  it("raison inconnue ou preuve absente : null, jamais de chaîne inventée", () => {
    expect(formatTrainingProof({ entityId: "x", reasonCode: "code-inconnu" })).toBeNull();
    expect(formatTrainingProof({ entityId: "x", reasonCode: "motif-missed|motif=fork" })).toBeNull();
  });
});
