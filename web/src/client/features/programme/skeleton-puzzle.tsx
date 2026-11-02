"use client";

/**
 * Un puzzle du programme, en deux temps OBLIGATOIRES (chunking) :
 *
 * 1. **Squelette** — l'utilisateur désigne, en cliquant sur les cases, les
 *    éléments qui portent la combinaison (pièces non défendues, roi exposé,
 *    pièces clouées, lignes de force, cases faibles, pions passés). Noté par
 *    `scoreSkeleton` contre le squelette calculé par le générateur.
 * 2. **Solution** — le même solveur que le reste de l'application
 *    (`usePuzzleSolver` : 3 essais, coups équivalents acceptés, révélation).
 *
 * Le puzzle n'est une réussite complète que si les deux étapes le sont.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Chessboard, type SquareRenderer } from "react-chessboard";
import { LAST_MOVE_TINT, LICHESS_BRUSH, SquareCircle } from "@/client/features/board/board-theme";
import { usePuzzleSolver } from "@/client/features/board/use-puzzle-solver";
import { OPPONENT_MOVE_ANIMATION_MS } from "@/client/features/board/move-animation";
import { useEngine } from "@/client/engine/engine-context";
import { uciSequenceToSan } from "@/core/chess/replay";
import type { SessionPuzzle } from "@/core/programme/dto";
import { scoreSkeleton, type SkeletonScore } from "@/core/programme/skeleton";
import type { SkeletonKind } from "@/core/programme/types";
import type { VisualHackRender } from "@/core/programme/visual-hacks";
import { BASE_BOARD_OPTIONS, hackedBoard, hiddenPiecesLabel } from "./hack-board";

export interface PuzzleResult {
  skeletonOk: boolean;
  solved: boolean;
  markedSquares: string[];
  seconds: number;
}

const KIND_LABEL: Record<SkeletonKind, string> = {
  non_defendue: "pièce non défendue",
  roi_expose: "roi exposé",
  piece_clouee: "pièce clouée",
  ligne_de_force: "ligne de force",
  case_faible: "cible défendue / surchargée",
  pion_passe: "pion passé / promotion",
  case_cle: "case clé",
};

const MARK_COLOR = "#e6c200";

export function SkeletonPuzzle({
  item,
  hack,
  onDone,
}: {
  item: SessionPuzzle;
  hack: VisualHackRender | null;
  onDone: (result: PuzzleResult) => void;
}) {
  const { puzzle } = item;
  const [stage, setStage] = useState<"squelette" | "bilan" | "solution">("squelette");
  const [marked, setMarked] = useState<string[]>([]);
  const [score, setScore] = useState<SkeletonScore | null>(null);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const playerColor = puzzle.fen.split(" ")[1] === "b" ? "b" : "w";
  const board = hackedBoard(hack, playerColor);
  const hiddenLabel = hiddenPiecesLabel(puzzle.fen, hack);
  const setup = puzzle.coup_installation;
  const expected = useMemo(() => new Map(puzzle.squelette_cases.map((s) => [s.case, s.type])), [puzzle.squelette_cases]);

  function toggle(square: string) {
    if (stage !== "squelette") return;
    setMarked((m) => (m.includes(square) ? m.filter((s) => s !== square) : [...m, square]));
  }

  function validate() {
    setScore(scoreSkeleton(puzzle.squelette_cases, puzzle.squelette_coeur, marked));
    setStage("bilan");
  }

  const ringFor = (square: string): string | null => {
    if (stage === "squelette") return marked.includes(square) ? MARK_COLOR : null;
    if (!score) return null;
    if (score.hits.includes(square)) return LICHESS_BRUSH.green;
    if (score.wrong.includes(square)) return LICHESS_BRUSH.red;
    if (puzzle.squelette_coeur.includes(square)) return LICHESS_BRUSH.yellow;
    if (expected.has(square)) return LICHESS_BRUSH.blue;
    return null;
  };

  const squareRenderer: SquareRenderer = ({ square, children }) => {
    const ring = ringFor(square);
    const tinted = setup && (setup.uci.slice(0, 2) === square || setup.uci.slice(2, 4) === square);
    return (
      <div style={{ width: "100%", height: "100%", ...(tinted ? { backgroundColor: LAST_MOVE_TINT } : {}) }}>
        {children}
        {ring && <SquareCircle color={ring} />}
      </div>
    );
  };

  if (stage === "solution") {
    return (
      <SolutionStage
        item={item}
        hack={hack}
        onFinished={(solved) =>
          onDone({ skeletonOk: score?.ok ?? false, solved, markedSquares: marked, seconds: Math.round((Date.now() - startedAt.current) / 1000) })
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start">
      <div className="w-full shrink-0 md:w-[440px]" style={board.wrapperStyle}>
        <Chessboard
          options={{
            ...BASE_BOARD_OPTIONS,
            ...board.options,
            id: `squelette-${puzzle.puzzle_id}`,
            position: puzzle.fen,
            boardOrientation: board.orientation,
            allowDragging: false,
            onSquareClick: ({ square }) => toggle(square),
            squareRenderer,
          }}
        />
        {hiddenLabel && <p className="mt-2 text-xs text-foreground-muted">{hiddenLabel}</p>}
      </div>
      <div className="min-w-0 flex-1 space-y-3 text-sm">
        <p className="text-xs uppercase tracking-wide text-foreground-muted">
          {playerColor === "w" ? "Les Blancs" : "Les Noirs"} jouent{setup ? ` — dernier coup adverse : ${setup.san}` : ""} · {puzzle.rating_lichess}
        </p>
        {stage === "squelette" ? (
          <>
            <h3 className="text-base font-semibold">Étape 1 — Désigne le squelette du pattern</h3>
            <p className="text-foreground-muted">
              Clique sur les cases qui portent la combinaison : pièces non défendues, roi exposé, pièces clouées, lignes de force, cases
              faibles, pions passés. Pas encore le coup : seulement les faiblesses et les forces.
            </p>
            <p className="text-foreground-muted">{marked.length} case{marked.length > 1 ? "s" : ""} désignée{marked.length > 1 ? "s" : ""}.</p>
            <div className="flex gap-2">
              <button type="button" onClick={validate} disabled={marked.length === 0} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground disabled:opacity-40">
                Valider le squelette
              </button>
              <button type="button" onClick={() => setMarked([])} className="rounded-md border border-border px-4 py-2">
                Effacer
              </button>
            </div>
          </>
        ) : (
          score && (
            <>
              <h3 className={`text-base font-semibold ${score.ok ? "text-best" : "text-blunder"}`}>
                {score.ok ? "Squelette juste" : "Squelette incomplet"} — précision {Math.round(score.precision * 100)} %
              </h3>
              <ul className="space-y-1 text-foreground-muted">
                <li><span style={{ color: LICHESS_BRUSH.green }}>●</span> trouvées : {score.hits.join(", ") || "—"}</li>
                <li><span style={{ color: LICHESS_BRUSH.red }}>●</span> hors squelette : {score.wrong.join(", ") || "—"}</li>
                <li><span style={{ color: LICHESS_BRUSH.yellow }}>●</span> cases cœur manquées : {score.missedCore.join(", ") || "—"}</li>
                <li><span style={{ color: LICHESS_BRUSH.blue }}>●</span> contexte non désigné</li>
              </ul>
              <ul className="space-y-0.5 text-xs">
                {puzzle.squelette_cases.map((s) => (
                  <li key={s.case}>
                    <span className="font-mono">{s.case}</span> — {KIND_LABEL[s.type]}
                    {puzzle.squelette_coeur.includes(s.case) ? " (cœur)" : ""}
                  </li>
                ))}
              </ul>
              <p className="rounded-md bg-surface-muted p-3 text-xs">{puzzle.squelette_attendu}</p>
              <button type="button" onClick={() => setStage("solution")} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
                Étape 2 — Résoudre
              </button>
            </>
          )
        )}
        <SourceLine item={item} />
      </div>
    </div>
  );
}

function SolutionStage({ item, hack, onFinished }: { item: SessionPuzzle; hack: VisualHackRender | null; onFinished: (solved: boolean) => void }) {
  const { engine } = useEngine();
  const { puzzle } = item;
  const solvable = useMemo(
    () => ({
      id: puzzle.puzzle_id,
      fenBefore: puzzle.fen,
      solution: puzzle.solution_uci,
      solutionSan: uciSequenceToSan(puzzle.fen, puzzle.solution_uci),
      alternatives: puzzle.alternatives,
    }),
    [puzzle],
  );
  const solver = usePuzzleSolver({ engine, puzzle: solvable });
  const board = hackedBoard(hack, solver.playerColor);
  const [sent, setSent] = useState(false);
  const terminal = solver.phase === "solved" || solver.phase === "failed";
  const status =
    solver.phase === "solved"
      ? "Résolu."
      : solver.phase === "failed"
        ? solver.revealed
          ? "Solution révélée."
          : "Plus d'essai."
        : solver.phase === "opponent-reply"
          ? "L'adversaire répond…"
          : solver.lastWrongUci
            ? `Ce n'est pas le coup. Il reste ${solver.attemptsLeft} essai${solver.attemptsLeft > 1 ? "s" : ""}.`
            : `Trouve la suite (${Math.ceil(puzzle.solution_uci.length / 2)} coup${puzzle.solution_uci.length > 2 ? "s" : ""}).`;
  const lastMove = solver.lastMove;

  const squareRenderer: SquareRenderer = ({ square, children }) => (
    <div style={{ width: "100%", height: "100%", ...(lastMove && (lastMove.from === square || lastMove.to === square) ? { backgroundColor: LAST_MOVE_TINT } : {}) }}>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start">
      <div className="w-full shrink-0 md:w-[440px]" style={board.wrapperStyle}>
        <Chessboard
          options={{
            ...BASE_BOARD_OPTIONS,
            ...board.options,
            id: `solution-${puzzle.puzzle_id}`,
            position: solver.fen,
            boardOrientation: board.orientation,
            onPieceDrop: solver.onPieceDrop,
            canDragPiece: solver.canDragPiece,
            arrows: solver.boardArrows,
            squareRenderer,
            animationDurationInMs: OPPONENT_MOVE_ANIMATION_MS,
          }}
        />
        {hiddenPiecesLabel(solver.fen, hack) && <p className="mt-2 text-xs text-foreground-muted">{hiddenPiecesLabel(solver.fen, hack)}</p>}
      </div>
      <div className="min-w-0 flex-1 space-y-3 text-sm">
        <h3 className="text-base font-semibold">Étape 2 — Résous</h3>
        <p className={solver.phase === "solved" ? "text-best" : solver.phase === "failed" ? "text-blunder" : "text-foreground-muted"}>{status}</p>
        {solver.lastAlternative && <p className="text-xs text-foreground-muted">Coup équivalent accepté : l&apos;échiquier joue la ligne de référence.</p>}
        {terminal && <p className="rounded-md bg-surface-muted p-3 font-mono text-xs">{puzzle.solution_pgn}</p>}
        <div className="flex gap-2">
          {solver.canReveal && (
            <button type="button" onClick={solver.requestReveal} className="rounded-md border border-border px-4 py-2">
              Voir la solution
            </button>
          )}
          {terminal && (
            <button
              type="button"
              disabled={sent}
              onClick={() => {
                setSent(true);
                onFinished(solver.phase === "solved");
              }}
              className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground disabled:opacity-40"
            >
              Continuer
            </button>
          )}
        </div>
        <SourceLine item={item} />
      </div>
    </div>
  );
}

function SourceLine({ item }: { item: SessionPuzzle }) {
  const { puzzle } = item;
  const label = puzzle.source === "position_pedagogique" ? "Position pédagogique construite, vérifiée par la tablebase Syzygy" : `Lichess #${puzzle.puzzle_id}`;
  return (
    <p className="text-xs text-foreground-muted">
      Source : {puzzle.url ? <a href={puzzle.url} target="_blank" rel="noreferrer" className="underline">{label}</a> : label} · vérifié {puzzle.verification.moteur}
      {puzzle.verification.profondeur ? ` (prof. ${puzzle.verification.profondeur})` : ""} · jour d&apos;origine {item.sourceDayKey}
    </p>
  );
}
