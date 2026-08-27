"use client";

/**
 * Mode « Exploration libre » (bac à sable) pendant la revue de partie.
 *
 * Branché sur la position réelle courante (`anchorFen`, fournie par l'écran
 * de revue à partir de `currentPly`) : tant qu'aucun coup divergent n'a été
 * joué, ce hook reste inerte et le plateau affiche la partie réelle. Dès
 * qu'un glisser-déposer diffère du coup réellement joué ensuite
 * (`realNextUci`), une position sandbox indépendante démarre et tout coup
 * suivant s'y empile — jamais sur la partie réelle.
 *
 * `currentPly` n'est JAMAIS modifié par ce hook : c'est ce qui permet à
 * l'écran de revue de « repositionner exactement où l'utilisateur s'était
 * arrêté » en sortant — il suffit d'arrêter d'explorer, la position réelle
 * réapparaît d'elle-même puisqu'elle n'a jamais bougé.
 */
import { useCallback, useRef, useState } from "react";
import { Chess, type Move } from "chess.js";
import type { PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import { evaluateMove, uciOf, type EvaluatedMove } from "@/core/analysis/evaluate-move";
import type { PositionAnalyser } from "@/core/analysis/types";
import { ENGINE_ARROW_LINE_COUNT } from "@/lib/labels";

/**
 * Même ordre de grandeur que la partie live (`play/constants.ts`) : assez
 * profond pour un verdict fiable, assez rapide pour rester interactif coup
 * après coup pendant qu'on tâtonne des alternatives.
 */
const EXPLORE_ANALYSIS_DEPTH = 16;

export type ExploreEvaluation =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; evaluated: EvaluatedMove }
  | { status: "error"; message: string };

export function useExploreMode({
  engine,
  anchorFen,
  realNextUci,
  onPlayRealMove,
}: {
  /** Moteur client partagé (voir `useEngine()`) — `null` tant qu'il n'est pas prêt. */
  engine: PositionAnalyser | null;
  /** Position de la revue réelle à l'instant présent — la racine d'où une exploration peut partir. */
  anchorFen: string;
  /** Coup UCI réellement joué ensuite dans la partie ; `null` en fin de partie. */
  realNextUci: string | null;
  /** Appelé quand le coup glissé EST le coup réel : navigation normale, jamais d'exploration. */
  onPlayRealMove: () => void;
}) {
  // Instance chess.js de la ligne explorée, distincte de toute position réelle
  // — recréée à chaque nouvelle exploration, jamais partagée avec l'écran de revue.
  const sandboxRef = useRef<Chess | null>(null);
  // Compteur de requête : une évaluation qui revient après que l'exploration a
  // été quittée (ou dépassée par un coup suivant) ne doit jamais s'appliquer.
  const requestIdRef = useRef(0);

  const [isExploring, setIsExploring] = useState(false);
  const [explorerMoves, setExplorerMoves] = useState<Move[]>([]);
  const [sandboxFen, setSandboxFen] = useState(anchorFen);
  const [evaluation, setEvaluation] = useState<ExploreEvaluation>({ status: "idle" });

  const exit = useCallback(() => {
    requestIdRef.current += 1;
    sandboxRef.current = null;
    setIsExploring(false);
    setExplorerMoves((prev) => (prev.length ? [] : prev));
    setEvaluation((prev) => (prev.status === "idle" ? prev : { status: "idle" }));
  }, []);

  const runEvaluation = useCallback(
    (fenBeforeMove: string, uci: string) => {
      const requestId = ++requestIdRef.current;
      if (!engine) {
        setEvaluation({ status: "error", message: "Moteur indisponible." });
        return;
      }
      setEvaluation({ status: "loading" });
      // `lines` : au-delà du strict nécessaire à la qualité du coup, alimente
      // aussi les flèches directionnelles (voir `arrowsFromEngineLines`) sans
      // appel moteur supplémentaire — c'est la même recherche qui sert les deux.
      evaluateMove(engine, fenBeforeMove, uci, { depth: EXPLORE_ANALYSIS_DEPTH, lines: ENGINE_ARROW_LINE_COUNT })
        .then((evaluated) => {
          if (requestIdRef.current !== requestId) return;
          setEvaluation({ status: "ready", evaluated });
        })
        .catch((cause: unknown) => {
          if (requestIdRef.current !== requestId) return;
          setEvaluation({
            status: "error",
            message: cause instanceof Error ? cause.message : "Échec de l'analyse.",
          });
        });
    },
    [engine],
  );

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;

      // En exploration, on empile sur la ligne déjà en cours ; sinon on part
      // toujours de la position réelle affichée — jamais d'une sandbox périmée.
      const chess = isExploring && sandboxRef.current ? sandboxRef.current : new Chess(anchorFen);
      const fenBeforeMove = chess.fen();

      let move: Move;
      try {
        move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      } catch {
        return false;
      }

      const uci = uciOf(move);

      if (!isExploring && uci === realNextUci) {
        // Le coup glissé est exactement celui de la partie réelle : on reste
        // en lecture normale, aucune bascule en exploration (consigne : seul
        // un coup QUI DIFFÈRE du coup réel déclenche le bac à sable).
        onPlayRealMove();
        return true;
      }

      sandboxRef.current = chess;
      setSandboxFen(chess.fen());
      setExplorerMoves((prev) => [...prev, move]);
      setIsExploring(true);
      runEvaluation(fenBeforeMove, uci);
      return true;
    },
    [isExploring, anchorFen, realNextUci, onPlayRealMove, runEvaluation],
  );

  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs): boolean => {
      // Le trait, pas la couleur du joueur suivi : explorer, c'est aussi
      // pouvoir tester ce qu'aurait dû jouer l'adversaire.
      const fen = isExploring ? sandboxFen : anchorFen;
      const turn = fen.split(" ")[1] === "b" ? "b" : "w";
      return piece.pieceType.startsWith(turn);
    },
    [isExploring, sandboxFen, anchorFen],
  );

  return {
    isExploring,
    explorerMoves,
    evaluation,
    /** Position à afficher sur l'échiquier : sandbox en exploration, réelle sinon. */
    fen: isExploring ? sandboxFen : anchorFen,
    onPieceDrop,
    canDragPiece,
    exit,
  };
}
