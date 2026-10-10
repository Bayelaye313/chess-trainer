"use client";

/**
 * Hook fin qui orchestre `core/puzzle/solve-state.ts` (le reducer pur) : lit
 * la position via une seule instance `chess.js` mutable (plus de split
 * ancre/bac-à-sable comme `use-explore-mode.ts` — ici tout coup solution est
 * permanent, il n'y a jamais de retour à une position antérieure — sauf le
 * coup hors-solution lui-même, toujours annulé, voir `onPieceDrop`), pilote
 * les minuteries d'animation (réponse adverse enregistrée, rejeu scripté de
 * la révélation) et les appels moteur (jauge live, flèches au survol).
 *
 * `PuzzleBoard` ne connaît plus que la sortie de ce hook — toute la logique
 * d'état vit dans `applyPuzzleEvent`, testée indépendamment de React.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Chess, type Move } from "chess.js";
import type {
  PieceDropHandlerArgs,
  PieceHandlerArgs,
  SquareHandlerArgs,
} from "react-chessboard";
import { moveInputFromUci, uciOf } from "@/core/analysis/evaluate-move";
import type { PositionAnalyser } from "@/core/analysis/types";
import { classifyWrongMove } from "@/core/chess/coach-hints";
import {
  applyPuzzleEvent,
  initialSolveState,
  isAcceptedPlayerMove,
  isHoverArrowsEnabled,
  type PlyMark,
  type PuzzleSolveState,
  type SolvablePuzzle,
} from "@/core/puzzle/solve-state";
import { arrowsFromEngineLines, ENGINE_ARROW_LINE_COUNT, REVEAL_ARROW_COLOR } from "@/lib/labels";
import type { EvalScore } from "./evaluation-bar";
import { OPPONENT_MOVE_ANIMATION_MS } from "./move-animation";

const OPPONENT_REPLY_DELAY_MS = 500;
/** Pause avant de jouer le coup adverse d'introduction — le temps de voir la position d'avant. */
const SETUP_MOVE_DELAY_MS = 450;
/** Même ordre de grandeur que le reste de l'appli (jauge). */
const BASELINE_ANALYSIS_DEPTH = 16;
/** Même ordre de grandeur que le Mode Exploration (`use-explore-mode.ts`). */
const HOVER_ANALYSIS_DEPTH = 16;

function turnOf(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

/**
 * Position de départ de l'introduction animée : la position AVANT le coup
 * adverse (`setupMove.fenBefore`), seulement si ce coup y est légal et mène
 * bien à `puzzle.fenBefore` — sinon `null` et le puzzle s'ouvre comme avant,
 * directement sur sa position.
 */
function introStartFen(puzzle: SolvablePuzzle): string | null {
  const setup = puzzle.setupMove;
  if (!setup?.fenBefore) return null;
  try {
    const replay = new Chess(setup.fenBefore);
    replay.move(moveInputFromUci(setup.uci));
    return replay.fen().split(" ")[0] === puzzle.fenBefore.split(" ")[0] ? setup.fenBefore : null;
  } catch {
    return null;
  }
}

function markOf(move: Move, uci: string, quality: PlyMark["quality"] = null): PlyMark {
  return { from: move.from, to: move.to, uci, san: move.san, quality };
}

export function usePuzzleSolver({
  engine,
  puzzle,
}: {
  /** Moteur client partagé (voir `useEngine()`) — `null` tant qu'il n'est pas prêt. */
  engine: PositionAnalyser | null;
  puzzle: SolvablePuzzle;
}) {
  // Une seule instance, mutable, jamais remplacée pour ce puzzle — recréée à
  // neuf par le parent via `key={puzzle.id}` (voir PuzzleSession).
  const [chess] = useState(() => new Chess(puzzle.fenBefore));
  // Introduction : l'échiquier s'ouvre sur la position d'AVANT le coup
  // adverse, puis la pièce adverse glisse jusqu'à sa case — le dernier coup se
  // VOIT jouer au lieu d'être déjà figé. Le joueur ne peut rien toucher avant.
  const [introFen] = useState(() => introStartFen(puzzle));
  const [fen, setFen] = useState(introFen ?? puzzle.fenBefore);
  const [introPlaying, setIntroPlaying] = useState(introFen !== null);
  const [state, dispatch] = useReducer(applyPuzzleEvent, puzzle.solution.length, initialSolveState);
  // Position juste AVANT le dernier coup DU JOUEUR accepté (jamais une réponse
  // adverse rejouée automatiquement) — alimente `buildProgressCoachMessage`
  // (`core/puzzle/progress-coach.ts`), qui a besoin du avant/après pour lire
  // ce que CE coup précis vient de changer (colonne ouverte, promotion,
  // matériel gagné). `null` tant qu'aucun coup joueur n'a encore été accepté.
  const [lastPlayerTransition, setLastPlayerTransition] = useState<{ fenBefore: string; fenAfter: string; uci: string } | null>(
    null,
  );
  const [liveEval, setLiveEval] = useState<EvalScore | null>(null);
  const [hovering, setHovering] = useState(false);
  const [hoverArrows, setHoverArrows] = useState<ReturnType<typeof arrowsFromEngineLines>>([]);

  // Un compteur par famille d'appel moteur asynchrone : une réponse qui revient
  // après que l'état a évolué entretemps ne doit jamais s'appliquer — même
  // stratégie que `use-explore-mode.ts` (`requestIdRef`).
  const evalRequestIdRef = useRef(0);
  const hoverRequestIdRef = useRef(0);
  /** Seconde phase de la réplique adverse (feuille de route Zone 2) : dispatch `OPPONENT_REPLY_PLAYED` différé jusqu'à la fin de l'animation de la pièce — tracké par ref pour être nettoyé à chaque cleanup. */
  const opponentStatusTimerRef = useRef<number | null>(null);

  const playerColor: "w" | "b" = turnOf(puzzle.fenBefore);

  // 0. Coup adverse d'introduction — même schéma en deux phases que la
  //    réponse adverse ci-dessous : la pièce part, puis le statut (surbrillance,
  //    droit de jouer) suit une fois l'animation terminée.
  useEffect(() => {
    if (!introPlaying) return;
    let endTimer: number | null = null;
    const timer = window.setTimeout(() => {
      setFen(puzzle.fenBefore);
      endTimer = window.setTimeout(() => setIntroPlaying(false), OPPONENT_MOVE_ANIMATION_MS);
    }, SETUP_MOVE_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      if (endTimer !== null) window.clearTimeout(endTimer);
    };
  }, [introPlaying, puzzle.fenBefore]);

  // 1. Rejoue automatiquement le prochain coup adverse enregistré — en DEUX
  //    phases (feuille de route Zone 2, micro-animations) : le coup part à
  //    `OPPONENT_REPLY_DELAY_MS` (la pièce anime pendant
  //    `OPPONENT_MOVE_ANIMATION_MS`, ease-in-out via `globals.css`), puis le
  //    dispatch `OPPONENT_REPLY_PLAYED` — qui déplace la surbrillance des
  //    cases — n'a lieu qu'une fois l'animation terminée. Le second
  //    minutageur est tracké par ref et nettoyé à chaque cleanup : jamais de
  //    `setState` synchrone en tête d'effet (`react-hooks/set-state-in-effect`).
  useEffect(() => {
    if (state.phase !== "opponent-reply") return;
    const uci = puzzle.solution[state.moveIndex];
    const timer = setTimeout(() => {
      const move = chess.move(moveInputFromUci(uci));
      setFen(chess.fen()); // phase 1 — la pièce adverse démarre sa trajectoire
      opponentStatusTimerRef.current = window.setTimeout(() => {
        opponentStatusTimerRef.current = null;
        dispatch({ type: "OPPONENT_REPLY_PLAYED", move: markOf(move, uci) }); // phase 2 — statut des cases APRÈS l'animation
      }, OPPONENT_MOVE_ANIMATION_MS);
    }, OPPONENT_REPLY_DELAY_MS);
    return () => {
      clearTimeout(timer);
      if (opponentStatusTimerRef.current !== null) {
        window.clearTimeout(opponentStatusTimerRef.current);
        opponentStatusTimerRef.current = null;
      }
    };
  }, [state.phase, state.moveIndex, chess, puzzle.solution]);

  // 2. Rejoue la révélation, un pli à la fois — demandée par `requestReveal`,
  // jamais automatique. La suite est déjà connue (`puzzle.solution`) : aucun
  // appel moteur, contrairement à l'ancienne réfutation scriptée.
  useEffect(() => {
    if (state.phase !== "failed" || state.revealTotalPlies === 0 || state.revealed) return;
    const uci = puzzle.solution[state.moveIndex + state.revealPlyIndex];
    const timer = setTimeout(() => {
      const move = chess.move(moveInputFromUci(uci));
      setFen(chess.fen());
      dispatch({ type: "REVEAL_PLY_PLAYED", ply: markOf(move, uci) });
    }, OPPONENT_REPLY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.phase, state.revealTotalPlies, state.revealPlyIndex, state.revealed, state.moveIndex, chess, puzzle.solution]);

  // 3. Jauge live : re-analyse à chaque position affichée (coup solution,
  // réponse adverse, ou pli de révélation — `fen` change dans les trois cas).
  useEffect(() => {
    if (!engine) return;
    const requestId = ++evalRequestIdRef.current;
    engine
      .analyse(fen, { depth: BASELINE_ANALYSIS_DEPTH })
      .then((evaluation) => {
        if (evalRequestIdRef.current !== requestId) return;
        setLiveEval({ cp: evaluation.cp, mate: evaluation.mate });
      })
      .catch(() => {
        // Échec silencieux : la jauge reste sur sa dernière valeur connue,
        // comme n'importe quelle évaluation indisponible ailleurs dans l'appli.
      });
  }, [fen, engine]);

  // 4. Flèches dégradées au survol — jamais pendant la résolution active
  // (`isHoverArrowsEnabled`, spoilerait la solution), seulement une fois le
  // puzzle sorti du mode « trouve le coup ». Le déclenchement ne fait AUCUN
  // `setState` synchrone : quand les conditions ne sont pas réunies, l'effet
  // ne fait rien — c'est `activeHoverArrows` ci-dessous, une valeur dérivée,
  // qui masque les flèches immédiatement plutôt que de vider `hoverArrows`
  // dans le corps de l'effet.
  const hoverEnabled = hovering && !introPlaying && isHoverArrowsEnabled(state.phase);
  useEffect(() => {
    if (!hoverEnabled || !engine) return;
    const requestId = ++hoverRequestIdRef.current;
    engine
      .analyse(fen, { depth: HOVER_ANALYSIS_DEPTH, lines: ENGINE_ARROW_LINE_COUNT })
      .then((evaluation) => {
        if (hoverRequestIdRef.current !== requestId) return;
        setHoverArrows(arrowsFromEngineLines(evaluation.lines));
      })
      .catch(() => {
        if (hoverRequestIdRef.current !== requestId) return;
        setHoverArrows([]);
      });
  }, [hoverEnabled, fen, engine]);
  const activeHoverArrows = hoverEnabled ? hoverArrows : [];

  // Flèche verte pleine tant que la révélation est en cours — trace le pli en
  // train d'être rejoué, jamais mêlée aux flèches (dégradées) du survol.
  const revealArrows =
    state.phase === "failed" && state.revealTotalPlies > 0 && !state.revealed
      ? (() => {
          const uci = puzzle.solution[state.moveIndex + state.revealPlyIndex];
          return [{ startSquare: uci.slice(0, 2), endSquare: uci.slice(2, 4), color: REVEAL_ARROW_COLOR }];
        })()
      : [];

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (introPlaying || state.phase !== "solving" || !targetSquare) return false;
      const fenBefore = chess.fen();
      let move: Move;
      try {
        move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      } catch {
        return false;
      }
      const uci = uciOf(move);
      const matchesSolution = isAcceptedPlayerMove(puzzle.solution, state.moveIndex, uci, chess.isCheckmate());
      // Nature de l'erreur — calculée AVANT l'annulation, pendant que `chess`
      // reflète encore la position résultant du coup faux (voir
      // `classifyWrongMove`). Sans objet quand le coup est correct : la
      // machine d'état l'ignore alors (voir `applyWhileSolving`).
      const hint = matchesSolution ? "generic" : classifyWrongMove(new Chess(fenBefore), chess, playerColor);
      if (matchesSolution) {
        const fenAfter = chess.fen();
        setFen(fenAfter);
        setLastPlayerTransition({ fenBefore, fenAfter, uci });
      } else {
        // Coup incorrect : jamais rendu visible — la position affichée
        // (`fen`) n'a pas bougé, on annule juste l'instance interne pour
        // qu'elle reste synchrone avec elle.
        chess.undo();
      }
      dispatch({
        type: "PLAYER_MOVED",
        move: markOf(move, uci),
        matchesSolution,
        fenBefore,
        hint,
      });
      return matchesSolution;
    },
    [chess, introPlaying, state.phase, state.moveIndex, puzzle.solution, playerColor],
  );

  const requestReveal = useCallback(() => {
    dispatch({ type: "REVEAL_REQUESTED", totalPlies: puzzle.solution.length - state.moveIndex });
  }, [puzzle.solution.length, state.moveIndex]);

  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs): boolean => !introPlaying && state.phase === "solving" && piece.pieceType.startsWith(playerColor),
    [introPlaying, state.phase, playerColor],
  );

  const onMouseOverSquare = useCallback(
    ({ piece }: SquareHandlerArgs) => {
      // « Pièce active » = appartient au camp au trait dans la position
      // affichée — survoler une case vide ou une pièce qui ne peut pas bouger
      // ne déclenche rien.
      if (piece && piece.pieceType.startsWith(turnOf(fen))) setHovering(true);
    },
    [fen],
  );

  const onMouseOutSquare = useCallback(() => setHovering(false), []);

  return {
    phase: state.phase,
    fen,
    /** Vrai pendant l'animation du coup adverse d'introduction — surbrillance et coach attendent qu'elle finisse. */
    introPlaying,
    lastMove: state.lastMove,
    lastPlayerTransition,
    /** Plis de `puzzle.solution` restants après le dernier coup consommé — voir `buildProgressCoachMessage`. */
    movesRemaining: puzzle.solution.length - state.moveIndex,
    firstPlayedUci: state.firstPlayedUci,
    attemptsLeft: state.attemptsLeft,
    lastWrongUci: state.lastWrongUci,
    lastWrongHint: state.lastWrongHint,
    canReveal: state.phase === "failed" && state.revealTotalPlies === 0 && !state.revealed,
    revealing: state.phase === "failed" && state.revealTotalPlies > 0 && !state.revealed,
    revealed: state.revealed,
    requestReveal,
    currentScore: liveEval,
    /** Flèches du survol (mode exploré) ET, en cours de révélation, la flèche verte pleine du pli en train d'être rejoué. */
    boardArrows: [...activeHoverArrows, ...revealArrows],
    playerColor,
    onPieceDrop,
    canDragPiece,
    onMouseOverSquare,
    onMouseOutSquare,
  };
}

export type PuzzleSolver = ReturnType<typeof usePuzzleSolver>;
export type { PuzzleSolveState };
