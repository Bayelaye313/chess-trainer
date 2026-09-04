import { describe, expect, it } from "vitest";
import { buildMotifIntro } from "./motif-intro";

describe("buildMotifIntro", () => {
  it("renvoie null pour un coup structurellement illégal (donnée corrompue)", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    expect(buildMotifIntro(fen, "e2e5", "e5")).toBeNull();
  });

  it("dérive une flèche de menace vers CHAQUE cible d'une fourchette réelle (2 étapes)", () => {
    // Ne6 attaque à la fois la Dame d8 et la Tour f8.
    const fen = "3q1rk1/8/8/2N5/8/8/8/4K3 w - - 0 1";
    const intro = buildMotifIntro(fen, "c5e6", "Ne6");

    expect(intro).not.toBeNull();
    expect(intro!.fen).toBe(fen);
    expect(intro!.steps).toHaveLength(2);

    const [threatStep, solutionStep] = intro!.steps;
    expect(threatStep.arrows).toHaveLength(2);
    expect(threatStep.arrows.every((a) => a.from === "e6" && a.kind === "threat")).toBe(true);
    expect(threatStep.arrows.map((a) => a.to).sort()).toEqual(["d8", "f8"]);
    expect(threatStep.caption).toMatch(/deux pièces/);

    expect(solutionStep.arrows).toEqual([{ from: "c5", to: "e6", kind: "solution" }]);
    expect(solutionStep.caption).toContain("Ne6");
  });

  it("une seule cible de valeur → une seule flèche de menace, caption au singulier", () => {
    const fen = "3qk3/8/8/1N6/8/8/8/4K3 w - - 0 1";
    const intro = buildMotifIntro(fen, "b5c7", "Nc7+");

    expect(intro!.steps).toHaveLength(2);
    const [threatStep] = intro!.steps;
    expect(threatStep.arrows).toEqual([{ from: "c7", to: "e8", kind: "threat" }]);
    expect(threatStep.caption).not.toMatch(/deux pièces/);
  });

  it("mat immédiat : flèche de menace dédiée vers le Roi, jamais une case vide", () => {
    const fen = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1";
    const intro = buildMotifIntro(fen, "a1a8", "Ra8#");

    expect(intro!.steps).toHaveLength(2);
    const [threatStep] = intro!.steps;
    expect(threatStep.arrows).toEqual([{ from: "a8", to: "g8", kind: "threat" }]);
    expect(threatStep.caption).toMatch(/mat/i);
  });

  it("aucune cible de valeur trouvée → une seule étape (le coup-clé seul), jamais de flèche vers une case vide au hasard", () => {
    // Développement calme, rien de neuf attaqué depuis la case d'arrivée.
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const intro = buildMotifIntro(fen, "g1f3", "Nf3");

    expect(intro!.steps).toHaveLength(1);
    expect(intro!.steps[0].arrows).toEqual([{ from: "g1", to: "f3", kind: "solution" }]);
  });

  it("ignore les pions attaqués — seule une pièce ≥ cavalier ou le Roi compte comme cible", () => {
    // Le cavalier d'arrivée attaque UNIQUEMENT le pion f6 — pas une cible qui compte.
    const fen = "k7/8/5p2/8/1N6/8/8/4K3 w - - 0 1";
    const intro = buildMotifIntro(fen, "b4d5", "Nd5");
    expect(intro!.steps).toHaveLength(1);
  });
});
