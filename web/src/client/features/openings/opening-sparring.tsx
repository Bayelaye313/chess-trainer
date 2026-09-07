"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, type Move } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";
import { useEngine } from "@/client/engine/engine-context";
import { BookOpponentPolicy } from "@/core/engine/opponent-policy";
import { useBookContinuations } from "./use-book-continuations";
import { useSparringMoveBias } from "./use-sparring-move-bias";
import { finishSparringSession, recordSparringMove, startSparringSession } from "@/server/actions/sparring";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function applyUci(board: Chess, uci: string): Move {
  return board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
}

export function OpeningSparring({
  openingId,
  openingName,
  variationKey,
  script,
  playerSide,
}: {
  openingId: string;
  openingName: string;
  variationKey: string;
  script: readonly string[];
  playerSide: "white" | "black";
}) {
  const { engine, status: engineStatus } = useEngine();
  const boardRef = useRef(new Chess(START_FEN));
  const pendingAiRef = useRef(false);
  const sessionRef = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "playing" | "thinking" | "finished">("idle");
  const [fen, setFen] = useState(START_FEN);
  const [historyLength, setHistoryLength] = useState(0);
  const [theoryExitPly, setTheoryExitPly] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const playerColor = playerSide === "white" ? "w" : "b";
  const continuations = useBookContinuations(fen);
  const userBias = useSparringMoveBias(openingId, variationKey);
  const policy = useRef(new BookOpponentPolicy({ temperature: 0.35, deviationRate: 0.18 }));

  const finish = useCallback(async (outcome: string) => {
    const sessionId = sessionRef.current;
    if (sessionId) {
      await finishSparringSession({ sessionId, result: outcome, theoryExitPly: theoryExitPly ?? undefined });
    }
    setResult(outcome);
    setStatus("finished");
    pendingAiRef.current = false;
  }, [theoryExitPly]);

  const playAi = useCallback(async () => {
    if (!active || status !== "playing" || boardRef.current.turn() === playerColor || pendingAiRef.current) return;
    pendingAiRef.current = true;
    setStatus("thinking");
    const board = boardRef.current;
    const before = board.fen();
    let uci: string | null = null;
    if (continuations.status === "ready" && continuations.fen === before && continuations.continuations.length > 0) {
      uci = policy.current.choose(
        continuations.continuations.map((move) => ({
          uci: move.uci,
          games: move.weight,
          userBias: userBias.bias[move.uci],
        })),
      );
    } else if (engine && engineStatus === "ready") {
      await engine.configure({ elo: 1500 });
      uci = await engine.play(before, { movetimeMs: 500 });
    }
    if (!uci) {
      pendingAiRef.current = false;
      setStatus("playing");
      return;
    }
    try {
      applyUci(board, uci);
      const ply = board.history().length;
      if (theoryExitPly === null && script.length > 0 && (ply > script.length || script[ply - 1] !== uci)) {
        setTheoryExitPly(ply);
      }
      setFen(board.fen());
      setHistoryLength(ply);
      void recordSparringMove({ sessionId: sessionRef.current!, ply, fenBefore: before, uci, byPlayer: false });
      if (board.isGameOver()) await finish(board.isCheckmate() ? "loss" : "draw");
      else setStatus("playing");
    } catch {
      await finish("aborted");
    } finally {
      pendingAiRef.current = false;
    }
  }, [active, status, playerColor, continuations, engine, engineStatus, script, theoryExitPly, finish, userBias]);

  useEffect(() => {
    void playAi();
  }, [playAi, fen]);

  async function start() {
    boardRef.current = new Chess(START_FEN);
    const sessionId = await startSparringSession({ openingId, variationKey, policy: "book", targetElo: 1500 });
    sessionRef.current = sessionId;
    setActive(true);
    setStatus("playing");
    setFen(START_FEN);
    setHistoryLength(0);
    setTheoryExitPly(null);
    setResult(null);
  }

  async function stop() {
    if (sessionRef.current) await finishSparringSession({ sessionId: sessionRef.current, result: "aborted" });
    sessionRef.current = null;
    setActive(false);
    setStatus("idle");
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!targetSquare || !active || status !== "playing" || boardRef.current.turn() !== playerColor) return false;
    const board = boardRef.current;
    const before = board.fen();
    let move: Move;
    try {
      move = board.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    const uci = move.from + move.to + (move.promotion ?? "");
    const ply = board.history().length;
    if (theoryExitPly === null && script.length > 0 && (ply > script.length || script[ply - 1] !== uci)) {
      setTheoryExitPly(ply);
    }
    setFen(board.fen());
    setHistoryLength(ply);
    void recordSparringMove({ sessionId: sessionRef.current!, ply, fenBefore: before, uci, byPlayer: true });
    if (board.isGameOver()) void finish(board.isCheckmate() ? "win" : "draw");
    return true;
  }

  function canDragPiece({ piece }: PieceHandlerArgs): boolean {
    return active && status === "playing" && piece.pieceType.startsWith(playerColor);
  }

  return (
    <section className="rounded-lg border border-accent/30 bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Jouer cette ligne</h2>
          <p className="mt-1 text-xs text-foreground-muted">
            Sparring local contre l&apos;arbre ECO, puis Stockfish après la sortie de théorie.
          </p>
        </div>
        {!active ? (
          <button type="button" onClick={() => void start()} className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90">
            Lancer le sparring
          </button>
        ) : (
          <button type="button" onClick={() => void stop()} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-surface-muted">
            Quitter
          </button>
        )}
      </div>
      {active && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="mx-auto w-full max-w-[420px]">
            <Chessboard options={{ id: "opening-sparring-board", position: fen, boardOrientation: playerColor === "w" ? "white" : "black", onPieceDrop, canDragPiece }} />
          </div>
          <div className="flex flex-col justify-center gap-3 text-sm">
            <p className="font-medium text-foreground">{openingName}</p>
            {userBias.sessions > 0 && (
              <p className="rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-foreground-muted">
                Adapté à ton historique : {userBias.losses} défaite{userBias.losses > 1 ? "s" : ""} sur {userBias.sessions} session{userBias.sessions > 1 ? "s" : ""}, {userBias.reinforcedMoves} branche{userBias.reinforcedMoves > 1 ? "s" : ""} renforcée{userBias.reinforcedMoves > 1 ? "s" : ""}.
              </p>
            )}
            <p className="text-foreground-muted">Coup {historyLength} · {status === "thinking" ? "L&apos;adversaire réfléchit…" : result ? `Résultat : ${result}` : theoryExitPly ? `Hors théorie au ply ${theoryExitPly}` : "Dans la théorie locale"}</p>
          </div>
        </div>
      )}
    </section>
  );
}