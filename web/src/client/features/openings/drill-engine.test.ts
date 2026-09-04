import { describe, expect, it } from "vitest";
import { computeHintArrow, decideOpponentStep, HINT_ARROW_SUCCESS_THRESHOLD, mostPopularContinuation } from "./drill-engine";

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
    fallbackUci: null as string | null,
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

  it("ne pointe plus le script une fois la manche divergée, mais RIEN si aucun coup de secours n'est encore connu", () => {
    expect(computeHintArrow({ ...base, diverged: true })).toBeNull();
  });

  it("reste sans flèche si `expectedUci` est `null` (script épuisé/vide) ET qu'aucun coup de secours n'est connu — repli sûr", () => {
    expect(computeHintArrow({ ...base, expectedUci: null })).toBeNull();
  });

  it("filet de sécurité : bascule sur le coup de secours une fois la manche divergée (lignes sans indice écrit, ex. Zukertort/Défense Benima)", () => {
    // Cahier des charges du 2026-09-03 : jamais laisser le joueur sans AUCUN
    // repère visuel juste parce que la manche a quitté le script initial.
    expect(computeHintArrow({ ...base, diverged: true, fallbackUci: "d2d4" })).toEqual({ from: "d2", to: "d4" });
  });

  it("le coup de secours ignore le seuil de réussite — jamais éteint, à la différence de la flèche scriptée", () => {
    expect(
      computeHintArrow({ ...base, diverged: true, fallbackUci: "d2d4", hintMoveSuccessCount: 99 }),
    ).toEqual({ from: "d2", to: "d4" });
  });

  it("le coup de secours prend le relais dès que `expectedUci` est `null`, même sans divergence explicite", () => {
    expect(computeHintArrow({ ...base, expectedUci: null, fallbackUci: "g1f3" })).toEqual({ from: "g1", to: "f3" });
  });

  it("le coup de secours reste soumis aux mêmes garde-fous globaux (Manche 2, mode 'never', hors tour du joueur...)", () => {
    expect(computeHintArrow({ ...base, diverged: true, fallbackUci: "d2d4", hintsAllowed: false })).toBeNull();
    expect(computeHintArrow({ ...base, diverged: true, fallbackUci: "d2d4", hintBehavior: "never" })).toBeNull();
    expect(computeHintArrow({ ...base, diverged: true, fallbackUci: "d2d4", isPlayerTurn: false })).toBeNull();
    expect(computeHintArrow({ ...base, diverged: true, fallbackUci: "d2d4", useScript: false })).toBeNull();
  });
});

describe("mostPopularContinuation", () => {
  it("renvoie null sans aucune continuation", () => {
    expect(mostPopularContinuation([], null)).toBeNull();
  });

  it("renvoie la première continuation sans donnée de popularité", () => {
    const continuations = [{ uci: "e2e4" }, { uci: "d2d4" }];
    expect(mostPopularContinuation(continuations, null)).toEqual({ uci: "e2e4" });
  });

  it("renvoie la continuation la plus jouée par de vrais joueurs", () => {
    const continuations = [{ uci: "e2e4" }, { uci: "d2d4" }, { uci: "c2c4" }];
    const popularity = [
      { uci: "e2e4", san: "e4", games: 100 },
      { uci: "d2d4", san: "d4", games: 500 },
      { uci: "c2c4", san: "c4", games: 50 },
    ];
    expect(mostPopularContinuation(continuations, popularity)).toEqual({ uci: "d2d4" });
  });

  it("est déterministe — deux appels sur la même position renvoient toujours le même coup", () => {
    const continuations = [{ uci: "e2e4" }, { uci: "d2d4" }];
    const popularity = [
      { uci: "e2e4", san: "e4", games: 10 },
      { uci: "d2d4", san: "d4", games: 10 },
    ];
    const first = mostPopularContinuation(continuations, popularity);
    const second = mostPopularContinuation(continuations, popularity);
    expect(first).toEqual(second);
  });

  it("ignore un coup théorique absent des données de popularité (poids nul)", () => {
    const continuations = [{ uci: "e2e4" }, { uci: "a2a3" }];
    const popularity = [{ uci: "e2e4", san: "e4", games: 1 }];
    expect(mostPopularContinuation(continuations, popularity)).toEqual({ uci: "e2e4" });
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
    continuationsFailed: false,
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

  it("termine proprement avec 'no-more-theory' quand la requête théorique échoue pour la position affichée (filet de sécurité, ex. Zukertort/Défense Benima)", () => {
    // Régression directe du plateau figé : `freshContinuations: null` seul ne
    // suffit pas à distinguer "pas encore arrivé" de "n'arrivera jamais" —
    // sans `continuationsFailed`, ce cas restait bloqué en `"wait"` pour
    // toujours.
    expect(
      decideOpponentStep({ ...base, useScript: false, freshContinuations: null, continuationsFailed: true }),
    ).toEqual({ type: "complete", reason: "no-more-theory" });
  });

  it("même filet de sécurité une fois la manche divergée du script initial", () => {
    expect(
      decideOpponentStep({ ...base, diverged: true, freshContinuations: null, continuationsFailed: true }),
    ).toEqual({ type: "complete", reason: "no-more-theory" });
  });

  it("continue d'attendre normalement quand la requête n'a simplement pas encore répondu (`continuationsFailed: false`)", () => {
    expect(
      decideOpponentStep({ ...base, useScript: false, freshContinuations: null, continuationsFailed: false }),
    ).toEqual({ type: "wait" });
  });
});
