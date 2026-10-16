/**
 * Le "moteur" pur du Mode Entraînement (`use-opening-drill.ts`) : les deux
 * décisions interactives que le joueur perçoit directement sur l'échiquier —
 * quelle flèche d'indice afficher, et quel coup l'IA doit jouer ensuite —
 * extraites hors de tout hook React pour rester testables SANS navigateur.
 *
 * AUDIT UI DU 2026-08-29 : avant cette extraction, les deux décisions
 * vivaient uniquement dans le corps d'un `useEffect`/d'un `useMemo` de
 * `use-opening-drill.ts`. Le reste du catalogue (`core/curriculum/openings.ts`,
 * `server/queries/openings.ts`, `core/chess/pgn-tree.ts`) est solidement
 * couvert par des tests, mais AUCUN test ne touchait jamais la mécanique
 * interactive elle-même (flèche affichée, coup de l'IA déclenché) — ce
 * fichier ferme ce trou : `use-opening-drill.test.ts` l'exerce directement,
 * en pur Node, sans DOM (aucun jsdom/@testing-library dans ce projet à ce
 * jour — voir le docstring de ce test pour la marche à suivre si on veut un
 * jour un test de rendu réel).
 */
import type { PopularMove } from "@/server/import/lichess-explorer";

/**
 * Pilotage de la flèche d'indice automatique (voir `use-opening-drill.ts`) :
 * `"until_played_twice"` (défaut, méthode Listudy) l'éteint dès qu'un coup
 * précis a été réussi `HINT_ARROW_SUCCESS_THRESHOLD` fois, `"always"` l'affiche
 * sans condition tant que les indices sont autorisés, `"never"` la coupe
 * entièrement (repli défensif/tests — le bouton d'indice texte reste, lui,
 * toujours disponible indépendamment de ce réglage).
 */
export type HintArrowBehavior = "until_played_twice" | "always" | "never";

/** Nombre de réussites, toutes sessions confondues, au-delà duquel la flèche d'indice cesse de s'afficher en `"until_played_twice"`. */
export const HINT_ARROW_SUCCESS_THRESHOLD = 2;

export type DrillFinishReason = "line-complete" | "no-more-theory";

/**
 * Choisit le coup de l'IA parmi les continuations théoriques connues
 * (`continuations`, jamais vide ici — voir l'appelant) — pondéré par le
 * volume de parties humaines Lichess (`popularity`) quand cette donnée est
 * disponible pour CETTE position précise, tirage uniforme sinon (position
 * inconnue de Lichess, réseau lent/en échec — voir `use-move-popularity.ts`).
 * Un coup théorique mais absent de `popularity` (Lichess ne le recense pas,
 * rare mais possible sur une branche très confidentielle) reçoit un poids nul
 * plutôt que de faire planter le tirage.
 */
export function pickOpponentContinuation<T extends { uci: string }>(
  continuations: readonly T[],
  popularity: readonly PopularMove[] | null,
): T {
  if (!popularity || popularity.length === 0) {
    return continuations[Math.floor(Math.random() * continuations.length)];
  }
  const gamesByUci = new Map(popularity.map((p) => [p.uci, p.games]));
  const weights = continuations.map((c) => gamesByUci.get(c.uci) ?? 0);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) {
    // Aucun des coups théoriques connus n'est recensé par Lichess à cette
    // position — dégrade vers le tirage uniforme plutôt que de diviser par 0.
    return continuations[Math.floor(Math.random() * continuations.length)];
  }
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < continuations.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return continuations[i];
  }
  return continuations[continuations.length - 1]; // garde-fou arrondi flottant
}

/**
 * Coup à pointer par la flèche de secours (voir `computeHintArrow`) quand
 * aucun coup scripté n'est disponible — `diverged`, ou plus généralement une
 * position sans script (mode Aléatoire). DÉTERMINISTE, à la différence de
 * `pickOpponentContinuation` : une flèche d'indice ne doit jamais changer de
 * cible d'un rendu à l'autre pour la MÊME position, alors que le coup
 * réellement joué par l'IA peut légitimement varier. Le plus joué par de
 * vrais humains (Lichess Opening Explorer) l'emporte quand cette donnée est
 * disponible ; à défaut, le premier coup théorique connu (ordre stable, pas
 * de tirage) — jamais `null` tant que `continuations` n'est pas vide.
 */
export function mostPopularContinuation<T extends { uci: string }>(
  continuations: readonly T[],
  popularity: readonly PopularMove[] | null,
): T | null {
  if (continuations.length === 0) return null;
  if (!popularity || popularity.length === 0) return continuations[0];
  const gamesByUci = new Map(popularity.map((p) => [p.uci, p.games]));
  return continuations.reduce((best, candidate) =>
    (gamesByUci.get(candidate.uci) ?? 0) > (gamesByUci.get(best.uci) ?? 0) ? candidate : best,
  );
}

/** Ce que l'effet appelant (`use-opening-drill.ts`) doit faire MAINTENANT — voir `decideOpponentStep`. */
export type OpponentStep =
  | { type: "wait" } // tour du joueur, ou continuations pas encore prêtes pour la position courante.
  | { type: "complete"; reason: DrillFinishReason }
  | { type: "play"; uci: string };

/**
 * Décision "que doit faire l'IA MAINTENANT ?" — la mécanique de la réponse
 * AUTOMATIQUE de l'IA après un coup accepté du joueur ("Force la machine à
 * jouer SON coup AUTOMATIQUEMENT", cahier des charges). Pure : ne mute rien,
 * ne programme aucun timer — `use-opening-drill.ts` se charge de l'effet de
 * bord (délai cosmétique + mutation du plateau) à partir du résultat.
 */
export function decideOpponentStep({
  isGameOver,
  isOpponentTurn,
  useScript,
  script,
  diverged,
  relativePlyIndex,
  freshContinuations,
  freshPopularity,
  continuationsFailed,
}: {
  isGameOver: boolean;
  /** `true` si c'est au tour de l'IA de jouer (pas celui du joueur). */
  isOpponentTurn: boolean;
  useScript: boolean;
  script: readonly string[] | null;
  diverged: boolean;
  /** Ply depuis le début de la partie INTERACTIVE (hors autoplay) — index dans `script`. */
  relativePlyIndex: number;
  /** `null` : pas encore prêt pour la position courante (voir `freshContinuations` dans le hook). */
  freshContinuations: readonly { uci: string }[] | null;
  freshPopularity: readonly PopularMove[] | null;
  /**
   * La requête théorique (`useBookContinuations`) a échoué pour LA POSITION
   * COURANTE — filet de sécurité (cahier des charges : lignes rares comme
   * Zukertort/Défense Benima qui « figent » le plateau). Sans lui,
   * `freshContinuations: null` seul ne distingue pas « pas encore arrivé »
   * de « n'arrivera jamais » : le plateau attendait alors indéfiniment une
   * réponse de l'IA qui ne viendrait jamais, une fois `diverged` (ou en mode
   * Aléatoire). Traité comme une théorie épuisée (`"no-more-theory"`) plutôt
   * que comme une erreur bloquante — la manche se termine proprement, ce qui
   * enchaîne la Manche 2 comme n'importe quelle fin de ligne normale (voir
   * `completeRound` dans `use-opening-drill.ts`).
   */
  continuationsFailed: boolean;
}): OpponentStep {
  if (isGameOver) {
    // Rare en théorie d'ouverture, mais certains pièges cataloguent un mat
    // rapide — sans ce garde-fou, le joueur resterait bloqué sur un plateau
    // qui n'accepte plus aucun coup, sans explication.
    return { type: "complete", reason: "line-complete" };
  }

  // BUG CORRIGÉ (audit UX du 2026-08-30, "les variantes avancées buguent sur
  // leur dernier coup, bloquant la sauvegarde") : ce garde-fou de fin de
  // script doit se vérifier AVANT `isOpponentTurn`, pas seulement quand
  // c'est justement le tour de l'IA. Un script dont le TOUT DERNIER ply
  // appartient à l'IA (parité paire) épuise `script` PENDANT le coup de
  // l'IA — la main revient ensuite au joueur, dont c'est alors le tour, mais
  // `expectedUci` est `null` (plus rien dans `script`) : sans ce check ICI,
  // l'ancienne version ne détectait la fin QUE depuis la branche
  // `isOpponentTurn`, jamais réévaluée une fois que le tour est repassé au
  // joueur — la manche restait bloquée pour toujours, aucun coup ne pouvant
  // plus jamais être "attendu", `completeRound`/la sauvegarde de progression
  // n'étaient jamais atteints. Reproduit en direct (Playwright) sur la Ruy
  // Lopez (22 plies, dernier coup joué par les noirs).
  if (useScript && script && !diverged && relativePlyIndex >= script.length) {
    return { type: "complete", reason: "line-complete" };
  }

  // BUG CORRIGÉ (retour utilisateur direct, « Défense Benoni, reste bloqué —
  // plus de guide, plus de coup valable, aucune conclusion ») : une fois la
  // manche `diverged` (ou en mode Aléatoire, `!useScript`), la théorie peut
  // s'épuiser des DEUX côtés, pas seulement pendant le tour de l'IA. Ce check
  // vivait auparavant APRÈS `if (!isOpponentTurn) return wait` — quand
  // l'impasse tombait tout juste sur le tour du JOUEUR (une position sur deux,
  // pile ou face selon la parité du ply où la théorie s'arrête), la manche
  // répondait `wait` pour toujours : plus aucun coup du joueur n'était jamais
  // reconnu comme théorique (`freshContinuations` vide, voir `onPieceDrop`),
  // mais rien ne détectait jamais cette impasse pour terminer proprement la
  // manche — le plateau restait figé sans la moindre flèche de secours
  // (`fallbackHintUci`, lui aussi tributaire d'une liste vide) ni conclusion.
  // Symétrique à l'ancien filet de sécurité còté IA : la théorie épuisée met
  // fin à la manche quel que soit le camp au trait.
  if (!useScript || diverged) {
    if (freshContinuations !== null) {
      if (freshContinuations.length === 0) return { type: "complete", reason: "no-more-theory" };
    } else if (continuationsFailed) {
      // `continuationsFailed` : la requête a bien répondu, mais en échec, pour
      // CETTE position — jamais un simple "pas encore arrivé", voir son
      // docstring. Termine la manche plutôt que d'attendre pour toujours.
      return { type: "complete", reason: "no-more-theory" };
    }
  }

  if (!isOpponentTurn) return { type: "wait" }; // tour du joueur, théorie pas épuisée (voir ci-dessus) : on attend `onPieceDrop`.

  if (useScript && script && !diverged) {
    return { type: "play", uci: script[relativePlyIndex] };
  }

  if (!freshContinuations) return { type: "wait" }; // pas encore prêt pour CETTE position, l'effet se redéclenchera.
  // Priorise les coups les plus joués par de vrais humains à cette position
  // (Lichess Opening Explorer) quand cette donnée est prête pour CETTE
  // position précise — sinon tirage uniforme, voir `pickOpponentContinuation`.
  const pick = pickOpponentContinuation(freshContinuations, freshPopularity);
  return { type: "play", uci: pick.uci };
}

/**
 * Flèche d'indice automatique façon Listudy ("Force l'affichage immédiat de
 * la flèche d'indice dès le coup 1 en Manche 1", cahier des charges) — `null`
 * tant qu'elle ne doit PAS s'afficher : hors sélection scriptée (mode
 * Aléatoire, aucun coup fixe à indiquer), hors tour du joueur (l'IA/l'autoplay
 * joue, rien à indiquer), en Manche 2 (`hintsAllowed`, test à l'aveugle STRICT
 * — voir `use-opening-drill.ts`), avec `hintBehavior: "never"`.
 *
 * Deux sources, jamais les deux à la fois :
 *  - `expectedUci` (le script) tant que la manche n'a pas divergé — flèche
 *    standard, qui s'éteint après `HINT_ARROW_SUCCESS_THRESHOLD` réussites
 *    (méthode Listudy) ;
 *  - `fallbackUci` (filet de sécurité, cahier des charges : lignes sans
 *    contenu rédigé dédié comme Zukertort/Défense Benima, ou une manche
 *    `diverged` vers un autre embranchement théorique réel) — le coup le plus
 *    joué par de vrais joueurs à cette position, voir
 *    `mostPopularContinuation`. TOUJOURS affichée dès qu'elle est
 *    disponible, sans le seuil de réussite : ce n'est pas la même flèche
 *    « pédagogique » suivie sur toute une ligne, juste une indication de
 *    secours pour ne jamais laisser le joueur sans AUCUN repère visuel.
 */
export function computeHintArrow({
  status,
  hintsAllowed,
  hintBehavior,
  isPlayerTurn,
  useScript,
  diverged,
  expectedUci,
  hintMoveSuccessCount,
  fallbackUci,
}: {
  /** `"round-gate"` (voir `DrillStatus` dans `use-opening-drill.ts`) traite comme n'importe quel statut hors `"playing"` : jamais de flèche hors du tour interactif du joueur. */
  status: "select" | "autoplaying" | "playing" | "round-gate" | "finished";
  hintsAllowed: boolean;
  hintBehavior: HintArrowBehavior;
  isPlayerTurn: boolean;
  useScript: boolean;
  diverged: boolean;
  expectedUci: string | null;
  hintMoveSuccessCount: number;
  /** Coup de secours (voir `mostPopularContinuation`) — `null` s'il n'y en a aucun à proposer pour l'instant. */
  fallbackUci: string | null;
}): { from: string; to: string } | null {
  if (status !== "playing" || !hintsAllowed || hintBehavior === "never" || !isPlayerTurn || !useScript) {
    return null;
  }
  if (!diverged && expectedUci) {
    if (hintBehavior === "always" || hintMoveSuccessCount < HINT_ARROW_SUCCESS_THRESHOLD) {
      return { from: expectedUci.slice(0, 2), to: expectedUci.slice(2, 4) };
    }
    return null;
  }
  if (fallbackUci) {
    return { from: fallbackUci.slice(0, 2), to: fallbackUci.slice(2, 4) };
  }
  return null;
}
