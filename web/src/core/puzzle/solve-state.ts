/**
 * Machine à états pure de la résolution d'un puzzle multi-coups.
 *
 * Aucune dépendance à React, à `chess.js`, à un minuteur ou au moteur : ce
 * module ne manipule que des chaînes UCI/SAN et des données déjà connues de
 * l'appelant — exactement testable avec `vitest` seul, sur le modèle de
 * `core/analysis/evaluate-move.test.ts`. C'est ce qui permet à `use-puzzle-solver.ts`
 * (le hook, impur : timers, appels moteur, `chess.js`) de brancher `applyPuzzleEvent`
 * directement dans un `useReducer` sans aucune adaptation.
 *
 * Vocabulaire : un « pli » (`ply`) est un demi-coup. `puzzle.solution` alterne
 * plis du joueur (indices pairs) et plis adverses rejoués automatiquement
 * (indices impairs) — voir `server/queries/reviews.ts`.
 *
 * ## Les 3 tentatives, et pourquoi elles ont remplacé la réfutation active
 *
 * Cette machine classait autrefois chaque coup hors-solution au moteur et,
 * s'il s'agissait d'une vraie gaffe, enchaînait seule une punition scriptée
 * (voir l'historique de ce fichier). Un coup incorrect coûtait donc le puzzle
 * immédiatement, sans recours. Ici, trois essais sont accordés
 * (`attemptsLeft`, voir `MAX_PUZZLE_ATTEMPTS`) : un coup hors-solution joué
 * avec des essais restants ne touche jamais le plateau — l'appelant le
 * remet en place — et se contente de décrémenter le compteur et de garder
 * `lastWrongUci` pour l'indice affiché. Ce n'est qu'au troisième essai raté
 * que le puzzle bascule en `"failed"`. Depuis cet état, l'appelant peut
 * demander la révélation de la solution (`REVEAL_REQUESTED`) : elle est
 * rejouée pli par pli à partir de `puzzle.solution`, déjà connue, sans aucun
 * appel moteur.
 */
import { type MoveQuality, type WrongMoveHint } from "../chess/types";

/**
 * Ce qu'il faut, et rien de plus, pour faire tourner un puzzle multi-coups —
 * indépendant de sa provenance (`DeckPuzzle` pour Entraîner/FSRS, `ThemePuzzle`
 * pour Apprendre/curriculum n'ont pas d'autre point commun que ces quatre
 * champs). `usePuzzleSolver` et `PuzzleBoard` (`client/features/board/`) ne
 * connaissent que cette forme : n'importe quel écran peut leur fournir un
 * puzzle sans dépendre du vocabulaire d'un autre.
 */
export interface SolvablePuzzle {
  id: string;
  fenBefore: string;
  /** Suite attendue en UCI, coups adverses inclus aux rangs impairs. */
  solution: string[];
  solutionSan: string[];
}

export type SolvePhase =
  /** Au joueur de trouver le prochain coup de la solution. */
  | "solving"
  /** Rejeu automatique (minuté) du prochain coup adverse enregistré. */
  | "opponent-reply"
  /** Les 3 essais sont épuisés — voir `REVEAL_*` pour la suite (bouton de révélation, puis rejeu scripté). */
  | "failed"
  | "solved";

/** Un coup joué sur l'échiquier, de quelque phase qu'il vienne — de quoi surligner + badger la case d'arrivée. */
export interface PlyMark {
  from: string;
  to: string;
  uci: string;
  san: string;
  /** `null` = surbrillance neutre, pas de badge (coup adverse, pli de révélation). */
  quality: MoveQuality | null;
}

/** Nombre d'essais accordés par puzzle avant que le statut ne bascule en `"failed"`. */
export const MAX_PUZZLE_ATTEMPTS = 3;

export interface PuzzleSolveState {
  phase: SolvePhase;
  /** Plis de `puzzle.solution` déjà consommés (joueur + adversaire confondus). */
  moveIndex: number;
  totalPlies: number;
  lastMove: PlyMark | null;
  /** Premier coup joué, quelle que soit son issue — pour la télémétrie de notation FSRS. */
  firstPlayedUci: string | null;

  /** Essais restants avant `"failed"` — voir `MAX_PUZZLE_ATTEMPTS`. */
  attemptsLeft: number;
  /**
   * UCI du dernier coup hors-solution joué tant qu'il reste des essais —
   * alimente l'indice ambre affiché par `PuzzleBoard`. Remis à `null` dès
   * qu'un coup correct est joué.
   */
  lastWrongUci: string | null;
  /**
   * Nature de ce même coup hors-solution (`chess/coach-hints.ts`) — c'est ce
   * qui permet à `PuzzleBoard` de qualifier l'erreur (« pièce en prise »,
   * « sécurité du roi ») plutôt que d'afficher un « coup incorrect » muet.
   * Même cycle de vie que `lastWrongUci` : remis à `null` sur coup correct.
   */
  lastWrongHint: WrongMoveHint | null;

  // Renseignés une fois la révélation demandée en phase "failed" (voir REVEAL_*).
  /** Nombre de plis à rejouer pour la révélation ; `0` tant qu'elle n'a pas été demandée. */
  revealTotalPlies: number;
  /** Plis de la révélation déjà rejoués. */
  revealPlyIndex: number;
  /** `true` une fois la séquence de révélation entièrement rejouée. */
  revealed: boolean;
}

export type PuzzleEvent =
  | {
      type: "PLAYER_MOVED";
      move: PlyMark;
      matchesSolution: boolean;
      fenBefore: string;
      /** Nature de l'erreur — voir `PuzzleSolveState.lastWrongHint`. Ignoré quand `matchesSolution`. */
      hint: WrongMoveHint;
    }
  | { type: "OPPONENT_REPLY_PLAYED"; move: PlyMark }
  /** Bouton « Révéler la solution » — `totalPlies` = plis restants de `puzzle.solution` à partir de `moveIndex`. */
  | { type: "REVEAL_REQUESTED"; totalPlies: number }
  | { type: "REVEAL_PLY_PLAYED"; ply: PlyMark };

export function initialSolveState(totalPlies: number): PuzzleSolveState {
  return {
    phase: "solving",
    moveIndex: 0,
    totalPlies,
    lastMove: null,
    firstPlayedUci: null,
    attemptsLeft: MAX_PUZZLE_ATTEMPTS,
    lastWrongUci: null,
    lastWrongHint: null,
    revealTotalPlies: 0,
    revealPlyIndex: 0,
    revealed: false,
  };
}

/**
 * Directive « flèches au survol » : jamais pendant la résolution active (ça
 * spoilerait la solution) — seulement une fois le puzzle sorti du mode
 * « trouve le coup ».
 */
export function isHoverArrowsEnabled(phase: SolvePhase): boolean {
  return phase === "solved" || phase === "failed";
}

/** `true` si `moveIndex` a atteint la fin de `puzzle.solution` après avoir consommé un pli de plus. */
function isLastPly(moveIndex: number, totalPlies: number): boolean {
  return moveIndex + 1 >= totalPlies;
}

export function applyPuzzleEvent(state: PuzzleSolveState, event: PuzzleEvent): PuzzleSolveState {
  switch (state.phase) {
    case "solving":
      return applyWhileSolving(state, event);
    case "opponent-reply":
      return applyWhileOpponentReplying(state, event);
    case "failed":
      return applyWhileFailed(state, event);
    case "solved":
      // État terminal : tout événement résiduel (timer non annulé à temps,
      // requête qui revient tard) est ignoré plutôt que de rouvrir un puzzle
      // déjà noté.
      return state;
  }
}

function applyWhileSolving(state: PuzzleSolveState, event: PuzzleEvent): PuzzleSolveState {
  if (event.type !== "PLAYER_MOVED") return state;

  const firstPlayedUci = state.firstPlayedUci ?? event.move.uci;

  if (!event.matchesSolution) {
    // Le coup n'a jamais touché le plateau — l'appelant l'a déjà annulé
    // (`chess.undo()`) avant de dispatcher cet événement. Seul le compteur
    // d'essais et l'indice bougent.
    const attemptsLeft = state.attemptsLeft - 1;
    if (attemptsLeft > 0) {
      return { ...state, attemptsLeft, firstPlayedUci, lastWrongUci: event.move.uci, lastWrongHint: event.hint };
    }
    return {
      ...state,
      phase: "failed",
      attemptsLeft: 0,
      firstPlayedUci,
      lastWrongUci: event.move.uci,
      lastWrongHint: event.hint,
    };
  }

  const nextIndex = state.moveIndex + 1;
  const done = isLastPly(state.moveIndex, state.totalPlies);
  return {
    ...state,
    phase: done ? "solved" : "opponent-reply",
    firstPlayedUci,
    lastMove: { ...event.move, quality: "best" },
    lastWrongUci: null,
    lastWrongHint: null,
    moveIndex: nextIndex,
  };
}

function applyWhileOpponentReplying(state: PuzzleSolveState, event: PuzzleEvent): PuzzleSolveState {
  if (event.type !== "OPPONENT_REPLY_PLAYED") return state;

  const nextIndex = state.moveIndex + 1;
  const done = isLastPly(state.moveIndex, state.totalPlies);
  return {
    ...state,
    phase: done ? "solved" : "solving",
    lastMove: { ...event.move, quality: null },
    moveIndex: nextIndex,
  };
}

function applyWhileFailed(state: PuzzleSolveState, event: PuzzleEvent): PuzzleSolveState {
  switch (event.type) {
    case "REVEAL_REQUESTED": {
      // Ignore une seconde demande (double clic) une fois la révélation lancée ou terminée.
      if (state.revealTotalPlies > 0 || state.revealed) return state;
      if (event.totalPlies <= 0) return { ...state, revealed: true };
      return { ...state, revealTotalPlies: event.totalPlies, revealPlyIndex: 0 };
    }
    case "REVEAL_PLY_PLAYED": {
      if (state.revealTotalPlies === 0 || state.revealed) return state;
      const nextIndex = state.revealPlyIndex + 1;
      const done = nextIndex >= state.revealTotalPlies;
      return {
        ...state,
        // Chaque pli révélé EST la solution enregistrée — badge honnête sans appel moteur.
        lastMove: { ...event.ply, quality: "best" },
        revealPlyIndex: nextIndex,
        revealed: done,
      };
    }
    default:
      return state;
  }
}
