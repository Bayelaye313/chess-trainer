import { describe, expect, it } from "vitest";
import { computeHintArrow, decideOpponentStep, HINT_ARROW_SUCCESS_THRESHOLD } from "./drill-engine";

/**
 * Régression directe de l'audit UI du 2026-08-29 : "je n'ai toujours AUCUNE
 * flèche de guide, la machine NE RÉPOND PAS automatiquement à mes coups".
 *
 * Aucun jsdom/@testing-library n'est installé dans ce projet (sandbox sans
 * accès registre au moment de l'audit — voir `npm ping`) : on ne peut donc
 * pas monter `useOpeningDrill`/`OpeningDrill` dans un vrai DOM ici. Ce test
 * couvre à la place, en pur Node, EXACTEMENT les deux décisions que
 * `use-opening-drill.ts` délègue à `drill-engine.ts` (voir son docstring) —
 * la seule partie de la mécanique interactive qui puisse l'être sans
 * navigateur. Si un jour `jsdom`/`@testing-library/react` deviennent
 * installables, un test de rendu réel (montage de `OpeningDrill`, avance des
 * timers avec `vi.useFakeTimers()`, assertion sur les props DOM du plateau)
 * resterait la vérification la plus proche de "l'utilisateur voit la flèche
 * à l'écran" — celui-ci n'en est qu'un succédané volontairement rapproché.
 */
describe("computeHintArrow", () => {
  const base = {
    status: "playing" as const,
    hintsAllowed: true,
    hintBehavior: "until_played_twice" as const,
    isPlayerTurn: true,
    useScript: true,
    diverged: false,
    expectedUci: "e2e4",
    hintMoveSuccessCount: 0,
  };

  it("s'affiche dès le premier coup d'une Manche 1 fraîche (jamais réussi avant)", () => {
    expect(computeHintArrow(base)).toEqual({ from: "e2", to: "e4" });
  });

  it("reste affichée tant que le seuil de réussite n'est pas atteint", () => {
    expect(computeHintArrow({ ...base, hintMoveSuccessCount: HINT_ARROW_SUCCESS_THRESHOLD - 1 })).not.toBeNull();
  });

  it("s'éteint une fois le coup réussi HINT_ARROW_SUCCESS_THRESHOLD fois (méthode Listudy)", () => {
    expect(computeHintArrow({ ...base, hintMoveSuccessCount: HINT_ARROW_SUCCESS_THRESHOLD })).toBeNull();
  });

  it("reste affichée indéfiniment en mode 'always', même le coup déjà maîtrisé", () => {
    expect(computeHintArrow({ ...base, hintBehavior: "always", hintMoveSuccessCount: 99 })).not.toBeNull();
  });

  it("ne s'affiche jamais en mode 'never'", () => {
    expect(computeHintArrow({ ...base, hintBehavior: "never" })).toBeNull();
  });

  it("ne s'affiche pas hors du tour du joueur (l'IA/l'autoplay est en train de jouer)", () => {
    expect(computeHintArrow({ ...base, isPlayerTurn: false })).toBeNull();
  });

  it("ne s'affiche pas tant que le drill n'est pas en cours (sélecteur, autoplay, fin de manche)", () => {
    expect(computeHintArrow({ ...base, status: "select" })).toBeNull();
    expect(computeHintArrow({ ...base, status: "autoplaying" })).toBeNull();
    expect(computeHintArrow({ ...base, status: "finished" })).toBeNull();
  });

  it("reste masquée en Manche 2 (`hintsAllowed: false`) — test à l'aveugle strict", () => {
    expect(computeHintArrow({ ...base, hintsAllowed: false, hintMoveSuccessCount: 0 })).toBeNull();
  });

  it("ne s'affiche jamais en mode Aléatoire (`useScript: false`), aucun coup fixe à indiquer", () => {
    expect(computeHintArrow({ ...base, useScript: false })).toBeNull();
  });

  it("ne s'affiche plus une fois la manche divergée sur un autre embranchement théorique", () => {
    expect(computeHintArrow({ ...base, diverged: true })).toBeNull();
  });

  it("ne plante jamais si `expectedUci` est `null` (script épuisé/vide) — repli sûr, pas de flèche", () => {
    expect(computeHintArrow({ ...base, expectedUci: null })).toBeNull();
  });
});

describe("decideOpponentStep", () => {
  const base = {
    isGameOver: false,
    isOpponentTurn: true,
    useScript: true,
    script: ["e2e4", "e7e5", "g1f3", "b8c6"] as readonly string[],
    diverged: false,
    relativePlyIndex: 0,
    freshContinuations: null as readonly { uci: string }[] | null,
    freshPopularity: null,
  };

  it("joue le prochain coup du script dès que c'est le tour de l'IA (réponse automatique)", () => {
    expect(decideOpponentStep(base)).toEqual({ type: "play", uci: "e2e4" });
  });

  it("continue de jouer le script jusqu'à SA PROFONDEUR RÉELLE, jamais un arrêt prématuré", () => {
    // Régression directe : avant la correction de `annotateOpeningLine`
    // (`server/queries/openings.ts`), le script de la « Ligne principale »
    // s'arrêtait après `opening.moves` (souvent 4-10 plies) même quand
    // l'arbre `pgn` du chapitre allait bien plus loin — ici on vérifie que le
    // moteur d'IA lui-même suit fidèlement N'IMPORTE QUELLE longueur de
    // script fournie, sans jamais le tronquer de son propre chef.
    const longScript = Array.from({ length: 22 }, (_, i) => `script-move-${i}`);
    for (let ply = 0; ply < longScript.length; ply += 1) {
      expect(decideOpponentStep({ ...base, script: longScript, relativePlyIndex: ply })).toEqual({
        type: "play",
        uci: longScript[ply],
      });
    }
    // Une fois SEULEMENT la vraie fin du script atteinte, la manche se termine.
    expect(decideOpponentStep({ ...base, script: longScript, relativePlyIndex: longScript.length })).toEqual({
      type: "complete",
      reason: "line-complete",
    });
  });

  it("attend (`wait`) tant que c'est le tour du joueur — ne joue jamais à sa place", () => {
    expect(decideOpponentStep({ ...base, isOpponentTurn: false })).toEqual({ type: "wait" });
  });

  it("termine la manche dès que le script est épuisé, MÊME si c'est déjà le tour du joueur (audit UX du 2026-08-30)", () => {
    // Régression directe : un script dont le DERNIER ply appartient à l'IA
    // (longueur paire) épuise `script` pendant le coup de l'IA — la main
    // revient ensuite au joueur (`isOpponentTurn: false`), qui n'a plus
    // aucun coup "attendu" à jouer. Avant cette correction, la fin de manche
    // n'était détectée QUE depuis la branche `isOpponentTurn`, jamais
    // réévaluée une fois le tour repassé au joueur — la manche restait
    // bloquée indéfiniment (aucun `completeRound`, aucune sauvegarde de
    // progression), reproduit en direct sur la Ruy Lopez (22 plies).
    expect(
      decideOpponentStep({ ...base, isOpponentTurn: false, relativePlyIndex: base.script.length }),
    ).toEqual({ type: "complete", reason: "line-complete" });
  });

  it("termine la manche dès que le plateau est en mat/pat, même en plein script", () => {
    expect(decideOpponentStep({ ...base, isGameOver: true })).toEqual({ type: "complete", reason: "line-complete" });
  });

  it("bascule sur les continuations théoriques une fois la manche `diverged`", () => {
    const continuations = [{ uci: "d2d4" }];
    expect(decideOpponentStep({ ...base, diverged: true, freshContinuations: continuations })).toEqual({
      type: "play",
      uci: "d2d4",
    });
  });

  it("attend en mode Aléatoire/divergé tant que les continuations ne sont pas encore prêtes pour cette position", () => {
    expect(decideOpponentStep({ ...base, useScript: false, freshContinuations: null })).toEqual({ type: "wait" });
  });

  it("termine avec 'no-more-theory' quand la position est sortie de toute théorie connue", () => {
    expect(decideOpponentStep({ ...base, useScript: false, freshContinuations: [] })).toEqual({
      type: "complete",
      reason: "no-more-theory",
    });
  });

  it("pioche parmi les continuations théoriques en mode Aléatoire", () => {
    const continuations = [{ uci: "c2c4" }];
    expect(decideOpponentStep({ ...base, useScript: false, freshContinuations: continuations })).toEqual({
      type: "play",
      uci: "c2c4",
    });
  });
});
