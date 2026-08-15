"use client";

/**
 * État et logique d'une partie contre le moteur.
 *
 * Le worker Stockfish sert deux usages qu'il ne faut pas confondre : analyser
 * objectivement le coup du joueur (pleine force) et jouer la réplique de
 * l'adversaire (force bridée sur l'ELO choisi). `ensureEngineMode` évite de
 * reconfigurer le moteur quand le mode demandé est déjà actif.
 */
import { useCallback, useRef, useState } from "react";
import { Chess, DEFAULT_POSITION, type Move } from "chess.js";
import type { PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import { evaluateMove, uciOf, type EvaluatedMove } from "@/core/analysis/evaluate-move";
import { gameOutcome, type GameOutcome } from "@/core/chess/termination";
import type { Motif, MoveQuality } from "@/core/chess/types";
import { useEngine } from "@/client/engine/engine-context";
import { OPPONENT_MOVE_SQUARE_COLOR, qualitySquareColor } from "@/lib/labels";
import { createGame, finishGame, recordPlayerMove } from "@/server/actions/play";
import { AI_MOVE_TIME_MS, ANALYSIS_DEPTH } from "./constants";

export type PlayStatus = "setup" | "loading" | "playing" | "evaluating" | "thinking" | "over";

export interface FeedEntry {
  by: "player" | "ai";
  san: string;
  quality?: MoveQuality;
  cpLoss?: number | null;
  bestSan?: string | null;
  motifs?: Motif[];
}

interface MoveHighlight {
  from: string;
  to: string;
  color: string;
}

/** Mode de force actuellement configuré sur le moteur partagé. */
type EngineMode = "full" | number;

function playMoveUci(chess: Chess, uci: string): Move {
  return chess.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.slice(4, 5) || undefined,
  });
}

export function usePlayGame() {
  const { engine, status: engineStatus } = useEngine();

  const chessRef = useRef(new Chess());
  const engineModeRef = useRef<EngineMode | null>(null);
  const eloRef = useRef(1500);
  const gameIdRef = useRef<string | null>(null);

  // Constante, pas une lecture de ref : chessRef démarre déjà sur cette position.
  const [fen, setFen] = useState(DEFAULT_POSITION);
  const [status, setStatus] = useState<PlayStatus>("setup");
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [highlight, setHighlight] = useState<MoveHighlight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const appendFeed = useCallback((entry: FeedEntry) => {
    setFeed((prev) => [...prev, entry]);
  }, []);

  const ensureEngineMode = useCallback(
    async (mode: EngineMode) => {
      if (!engine || engineModeRef.current === mode) return;
      await engine.configure(mode === "full" ? {} : { elo: mode });
      engineModeRef.current = mode;
    },
    [engine],
  );

  const finalize = useCallback(async (chess: Chess, gameId: string, result: GameOutcome) => {
    await finishGame({ gameId, finalFen: chess.fen(), pgn: chess.pgn(), outcome: result });
    setOutcome(result);
    setStatus("over");
  }, []);

  const startNewGame = useCallback(
    async (color: "w" | "b", elo: number) => {
      if (!engine) return;
      setError(null);
      setOutcome(null);
      setFeed([]);
      setHighlight(null);
      setPlayerColor(color);
      eloRef.current = elo;

      const chess = chessRef.current;
      chess.reset();
      setFen(chess.fen());
      setStatus("loading");

      try {
        const { gameId } = await createGame({
          playerColor: color,
          engineElo: elo,
          initialFen: chess.fen(),
        });
        gameIdRef.current = gameId;

        await engine.newGame();
        engineModeRef.current = null;

        if (color === "b") {
          setStatus("thinking");
          await ensureEngineMode(elo);
          const aiUci = await engine.play(chess.fen(), { movetimeMs: AI_MOVE_TIME_MS });
          if (aiUci) {
            const move = playMoveUci(chess, aiUci);
            setFen(chess.fen());
            appendFeed({ by: "ai", san: move.san });
            setHighlight({ from: move.from, to: move.to, color: OPPONENT_MOVE_SQUARE_COLOR });
          }
        }

        setStatus("playing");
      } catch (cause) {
        // Repasser par "setup" plutôt que de rester bloqué sur "loading"/"thinking" :
        // l'utilisateur peut relancer une partie sans recharger la page.
        setError(cause instanceof Error ? cause.message : String(cause));
        setStatus("setup");
      }
    },
    [engine, appendFeed, ensureEngineMode],
  );

  /**
   * Suite complète après le dépôt d'un coup joueur, déjà joué sur `chessRef` :
   * évaluation, persistance, puis réplique du moteur si la partie continue.
   */
  const commitPlayerMove = useCallback(
    async (fenBeforeMove: string, move: Move) => {
      const chess = chessRef.current;
      const gameId = gameIdRef.current;
      if (!engine || !gameId) return;

      try {
        setStatus("evaluating");
        await ensureEngineMode("full");

        const evaluated: EvaluatedMove = await evaluateMove(
          engine,
          fenBeforeMove,
          uciOf(move),
          { depth: ANALYSIS_DEPTH },
        );

        appendFeed({
          by: "player",
          san: evaluated.san,
          quality: evaluated.quality,
          cpLoss: evaluated.cpLoss,
          bestSan: evaluated.bestSan,
          motifs: evaluated.motifs,
        });
        setHighlight({ from: move.from, to: move.to, color: qualitySquareColor(evaluated.quality) });

        await recordPlayerMove({
          gameId,
          ply: chess.history().length,
          side: playerColor,
          evaluated,
        });

        const afterPlayer = gameOutcome(chess);
        if (afterPlayer) {
          await finalize(chess, gameId, afterPlayer);
          return;
        }

        setStatus("thinking");
        await ensureEngineMode(eloRef.current);
        const aiUci = await engine.play(chess.fen(), { movetimeMs: AI_MOVE_TIME_MS });
        if (!aiUci) {
          setError("Le moteur n'a proposé aucun coup.");
          setStatus("playing");
          return;
        }

        const aiMove = playMoveUci(chess, aiUci);
        setFen(chess.fen());
        appendFeed({ by: "ai", san: aiMove.san });
        setHighlight({ from: aiMove.from, to: aiMove.to, color: OPPONENT_MOVE_SQUARE_COLOR });

        const afterAi = gameOutcome(chess);
        if (afterAi) {
          await finalize(chess, gameId, afterAi);
          return;
        }

        setStatus("playing");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause));
        setStatus("playing");
      }
    },
    [engine, playerColor, appendFeed, ensureEngineMode, finalize],
  );

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (status !== "playing" || !targetSquare) return false;

      const chess = chessRef.current;
      const fenBeforeMove = chess.fen();
      let move: Move;
      try {
        move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      } catch {
        return false;
      }

      setFen(chess.fen());
      void commitPlayerMove(fenBeforeMove, move);
      return true;
    },
    [status, commitPlayerMove],
  );

  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs): boolean => {
      if (status !== "playing") return false;
      const pieceColor = piece.pieceType.startsWith("w") ? "w" : "b";
      return pieceColor === playerColor && chessRef.current.turn() === playerColor;
    },
    [status, playerColor],
  );

  const squareStyles = highlight
    ? {
        [highlight.from]: { backgroundColor: highlight.color },
        [highlight.to]: { backgroundColor: highlight.color },
      }
    : {};

  return {
    engineReady: engineStatus === "ready",
    status,
    fen,
    playerColor,
    feed,
    outcome,
    error,
    squareStyles,
    startNewGame,
    onPieceDrop,
    canDragPiece,
  };
}
