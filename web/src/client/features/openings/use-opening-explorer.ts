"use client";

/**
 * État de l'échiquier de la page `/ouvertures/[slug]` : navigation le long de
 * la ligne de référence (annotée côté serveur, voir `server/queries/openings.ts`)
 * plus un bac à sable d'exploration libre — même schéma que
 * `board/use-explore-mode.ts` pour la revue de partie, réutilisé quasiment à
 * l'identique (même profondeur d'analyse, même garde-fou par identifiant de
 * requête), avec deux différences :
 *
 *  1. Deux sources de score selon le mode : tant qu'on reste sur la ligne de
 *     référence, un simple appel `analyse()` suffit (nul besoin de juger un
 *     coup qu'on sait déjà théorique — CLAUDE.md, règle « Book Moves »). Ce
 *     n'est qu'au premier coup qui dévie que `evaluateMove` prend le relais,
 *     coup après coup, exactement comme le bac à sable de la revue de partie.
 *  2. Chaque coup d'exploration est jugé ET surclassé « Théorique » si sa
 *     position d'arrivée est elle-même cataloguée en base ECO (transposition),
 *     via `checkBookMove` — la même vérification server-only que la ligne de
 *     référence, mais côté client cette fois (voir le docstring de
 *     `applyBookOverride`, qui anticipait exactement ce second point d'appel).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, type Move } from "chess.js";
import type { PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import type { EvalScore } from "@/client/features/board/evaluation-bar";
import { EXPLORE_ANALYSIS_DEPTH } from "@/client/features/board/use-explore-mode";
import {
  applyBookOverride,
  evaluateMove,
  moveInputFromUci,
  uciOf,
  type EvaluatedMove,
} from "@/core/analysis/evaluate-move";
import type { PositionAnalyser } from "@/core/analysis/types";
import { checkBookMove } from "@/server/actions/openings";
import type { AnnotatedPly } from "@/server/queries/openings";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export type MoveEvaluation =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; evaluated: EvaluatedMove }
  | { status: "error"; message: string };

/** Un coup d'exploration et son verdict — porté par la liste "Exploration" de `OpeningExplorer`. */
export interface SandboxPly {
  move: Move;
  evaluation: MoveEvaluation;
}

export function useOpeningExplorer({
  engine,
  plies,
}: {
  /** Moteur client partagé (voir `useEngine()`) — `null` tant qu'il n'est pas prêt. */
  engine: PositionAnalyser | null;
  plies: readonly AnnotatedPly[];
}) {
  const [viewPly, setViewPly] = useState(0);

  const sandboxRef = useRef<Chess | null>(null);
  const [isSandboxed, setIsSandboxed] = useState(false);
  const [sandboxFen, setSandboxFen] = useState(START_FEN);
  const [sandboxLine, setSandboxLine] = useState<SandboxPly[]>([]);

  // Score de la ligne de référence — un simple `analyse()`, jamais un jugement
  // de coup (voir point 1 du docstring). Périmé dès qu'on quitte la ligne.
  // Pas de statut « loading » distinct : comme `plyEval` dans
  // `use-post-solve-analysis.ts`, la dernière valeur connue reste affichée
  // pendant qu'une nouvelle arrive plutôt que de clignoter vers un trou —
  // et une remise à zéro synchrone en tête d'effet déclencherait de toute
  // façon un rendu en cascade inutile (react-hooks/set-state-in-effect).
  const [lineScore, setLineScore] = useState<EvalScore | null>(null);

  // Un seul compteur pour toutes les requêtes asynchrones de ce hook (score de
  // ligne ET évaluations de coups d'exploration) : une réponse qui revient
  // après un `goToPly`/`returnToLine` ou un coup suivant ne doit jamais
  // s'appliquer — même garde-fou que `use-explore-mode.ts`.
  const requestIdRef = useRef(0);

  const referenceFen = viewPly > 0 ? plies[viewPly - 1].fen : START_FEN;
  const fen = isSandboxed ? sandboxFen : referenceFen;
  const currentBook = !isSandboxed && viewPly > 0 ? plies[viewPly - 1].book : null;

  // Score affiché par la barre d'évaluation : celui du dernier coup
  // d'exploration jugé en bac à sable, sinon celui de la ligne de référence.
  const lastSandboxPly = sandboxLine[sandboxLine.length - 1] ?? null;
  const score: EvalScore | null =
    isSandboxed && lastSandboxPly
      ? lastSandboxPly.evaluation.status === "ready"
        ? { cp: lastSandboxPly.evaluation.evaluated.cpAfter, mate: lastSandboxPly.evaluation.evaluated.mateAfter }
        : null
      : lineScore;

  useEffect(() => {
    if (isSandboxed || !engine) return;
    const requestId = ++requestIdRef.current;
    engine
      .analyse(referenceFen, { depth: EXPLORE_ANALYSIS_DEPTH })
      .then((evaluation) => {
        if (requestIdRef.current !== requestId) return;
        setLineScore({ cp: evaluation.cp, mate: evaluation.mate });
      })
      .catch(() => {
        // Échec silencieux, comme `use-post-solve-analysis.ts` : la dernière
        // valeur connue reste affichée plutôt qu'un trou.
      });
  }, [engine, isSandboxed, referenceFen]);

  const returnToLine = useCallback(() => {
    requestIdRef.current += 1;
    sandboxRef.current = null;
    setIsSandboxed(false);
    setSandboxLine((prev) => (prev.length ? [] : prev));
  }, []);

  const goToPly = useCallback(
    (ply: number) => {
      returnToLine();
      setViewPly(Math.max(0, Math.min(plies.length, ply)));
    },
    [plies.length, returnToLine],
  );

  // Ajoute un coup d'exploration au bac à sable et lance son jugement moteur
  // — appelé une fois par coup, jamais ré-exécuté pour un coup déjà jugé.
  const evaluateSandboxMove = useCallback(
    (fenBeforeMove: string, move: Move) => {
      const requestId = ++requestIdRef.current;
      const targetIndex = sandboxLine.length; // capturé avant le `setSandboxLine` ci-dessous

      if (!engine) {
        setSandboxLine((prev) => [
          ...prev,
          { move, evaluation: { status: "error", message: "Moteur indisponible." } },
        ]);
        return;
      }

      setSandboxLine((prev) => [...prev, { move, evaluation: { status: "loading" } }]);

      const uci = uciOf(move);
      evaluateMove(engine, fenBeforeMove, uci, { depth: EXPLORE_ANALYSIS_DEPTH })
        .then(async (evaluated) => {
          const book = await checkBookMove(evaluated.fenAfter);
          if (requestIdRef.current !== requestId) return;
          const withBookOverride = applyBookOverride(evaluated, book !== null);
          setSandboxLine((prev) =>
            prev.map((ply, index) =>
              index === targetIndex ? { ...ply, evaluation: { status: "ready", evaluated: withBookOverride } } : ply,
            ),
          );
        })
        .catch((cause: unknown) => {
          if (requestIdRef.current !== requestId) return;
          const message = cause instanceof Error ? cause.message : "Échec de l'analyse.";
          setSandboxLine((prev) =>
            prev.map((ply, index) => (index === targetIndex ? { ...ply, evaluation: { status: "error", message } } : ply)),
          );
        });
    },
    [engine, sandboxLine.length],
  );

  const playMove = useCallback(
    (uci: string): boolean => {
      const chess = isSandboxed && sandboxRef.current ? sandboxRef.current : new Chess(referenceFen);
      const fenBeforeMove = chess.fen();

      let move: Move;
      try {
        move = chess.move(moveInputFromUci(uci.length > 4 ? uci : `${uci}q`));
      } catch {
        return false;
      }

      if (!isSandboxed && viewPly < plies.length && uciOf(move) === plies[viewPly].uci) {
        // Coup identique à la ligne de référence : simple navigation, jamais de bac à sable.
        setViewPly(viewPly + 1);
        return true;
      }

      sandboxRef.current = chess;
      setSandboxFen(chess.fen());
      setIsSandboxed(true);
      evaluateSandboxMove(fenBeforeMove, move);
      return true;
    },
    [isSandboxed, referenceFen, viewPly, plies, evaluateSandboxMove],
  );

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;
      // `q` inconditionnel comme `use-explore-mode.ts` : chess.js ignore ce
      // champ pour un coup qui n'est pas une promotion, pas besoin de le
      // détecter nous-mêmes ; un choix de promotion dédié resterait hors de
      // portée de cette fonctionnalité.
      return playMove(`${sourceSquare}${targetSquare}q`);
    },
    [playMove],
  );

  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs): boolean => {
      const turn = fen.split(" ")[1] === "b" ? "b" : "w";
      return piece.pieceType.startsWith(turn);
    },
    [fen],
  );

  return {
    viewPly,
    totalPlies: plies.length,
    fen,
    isSandboxed,
    sandboxLine,
    currentBook,
    score,
    canGoPrevious: !isSandboxed && viewPly > 0,
    canGoNext: !isSandboxed && viewPly < plies.length,
    goToPly,
    returnToLine,
    /** Joue un coup UCI directement — utilisé par l'arbre des variantes (clic) en plus du glisser-déposer. */
    playMove,
    onPieceDrop,
    canDragPiece,
  };
}
