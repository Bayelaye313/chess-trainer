"use client";

/**
 * L'échiquier d'un puzzle de révision : l'utilisateur joue le camp qui a fait
 * l'erreur (déduit du trait sur `fenBefore`) et doit retrouver `solution`,
 * coup par coup — les coups adverses (rangs impairs du tableau, voir
 * `puzzles.ts`) sont rejoués automatiquement après un court délai, jusqu'à
 * épuisement de la variante.
 *
 * Les 3 essais : un coup hors-solution n'est JAMAIS joué sur l'échiquier — la
 * pièce revient à sa case, un indice qualifie la nature de l'erreur (pièce en
 * prise, sécurité du roi — voir `core/chess/coach-hints.ts`) plutôt que de se
 * limiter au compte d'essais. Ce n'est qu'au 3e essai raté que le statut
 * bascule en « Failed » ; depuis là, un bouton épuré remplace les contrôles
 * habituels pour révéler la solution : flèche verte pleine et rejeu
 * automatique jusqu'au bout de la variante enregistrée. Toute cette logique
 * d'état vit dans `usePuzzleSolver` / `core/puzzle/solve-state.ts` (reducer
 * pur, testé indépendamment de React) ; ce composant ne fait que l'afficher.
 *
 * Une fois `solved`, ou `failed` ET révélé, l'échiquier ne se fige plus :
 * `usePostSolveAnalysis` (Mode Analyse Pro) prend le relais avec une
 * navigation ◀ Précédent / Suivant ▶ à travers la solution et, à partir de
 * n'importe quel pli, l'exploration libre déjà utilisée par la revue de
 * partie (`use-explore-mode.ts`, `ExplorePanel`, réutilisés tels quels) —
 * jauge d'évaluation comprise.
 *
 * Remonté à neuf par le parent (`key={puzzle.id}`, voir `PuzzleSession` et
 * `ThemeSession`) à chaque nouveau puzzle.
 *
 * Partagé par deux écrans, qui ne se distinguent qu'à la toute fin :
 * « Entraîner » (FSRS) passe `onGraded`, « Apprendre » (curriculum linéaire,
 * pas de notation) passe `onComplete`. Le solveur, l'échiquier, la jauge, les
 * flèches et les 3 essais sont IDENTIQUES dans les deux — voir le docstring de
 * `SolvablePuzzle` (`core/puzzle/solve-state.ts`).
 */
import { useEffect, useRef, useState } from "react";
import { Chessboard, type SquareRenderer } from "react-chessboard";
import { useEngine } from "@/client/engine/engine-context";
import { kingInCheckSquare } from "@/core/chess/check";
import type { MoveQuality } from "@/core/chess/types";
import { buildPreSolveCoachMessage } from "@/core/puzzle/pre-solve-coach";
import { buildProgressCoachMessage } from "@/core/puzzle/progress-coach";
import { buildRecognitionAids } from "@/core/puzzle/recognition-aids";
import type { SolvablePuzzle, SolvePhase } from "@/core/puzzle/solve-state";
import { CHECK_SQUARE_RING_COLOR, OPPONENT_MOVE_SQUARE_COLOR, WRONG_MOVE_HINT_LABEL, qualitySquareColor } from "@/lib/labels";
import type { ReviewGrade } from "@/server/srs/fsrs";
import { EvaluationBar } from "./evaluation-bar";
import { ExplorePanel } from "./explore-panel";
import { GradePanel } from "./grade-panel";
import { QualityBadge } from "./quality-badge";
import { usePostSolveAnalysis } from "./use-post-solve-analysis";
import { usePuzzleSolver } from "./use-puzzle-solver";

const STATUS_TEXT: Record<SolvePhase, string> = {
  solving: "Trouve le coup à jouer.",
  "opponent-reply": "L'adversaire répond…",
  solved: "Puzzle résolu !",
  failed: "Plus d'essai — découvre la solution.",
};

export function PuzzleBoard({
  puzzle,
  onGraded,
  onComplete,
}: {
  puzzle: SolvablePuzzle;
  /** Mode Entraîner : note FSRS une fois le puzzle terminé (résolu ou raté). */
  onGraded?: (grade: ReviewGrade, playedUci: string | null, solvedMs: number) => void;
  /** Mode Apprendre : pas de FSRS, un seul bouton pour enchaîner — voir `theme-session.tsx`. */
  onComplete?: () => void;
}) {
  const { engine } = useEngine();
  const solver = usePuzzleSolver({ engine, puzzle });

  // Mode Analyse Pro : actif dès que le puzzle est gagné, ou perdu ET révélé
  // — jamais avant, sous peine de spoiler la solution en cours de recherche
  // ou la révélation elle-même. Le hook reste inerte tant que `active` est
  // `false` (voir son docstring).
  const postAnalysisActive = solver.phase === "solved" || (solver.phase === "failed" && solver.revealed);
  const postAnalysis = usePostSolveAnalysis({ engine, puzzle, active: postAnalysisActive });

  // Un seul appel à `onGraded`/`onComplete` par puzzle : le parent recharge le
  // puzzle suivant de façon asynchrone, ce composant reste monté (même `key`)
  // pendant ce court instant — verrou local pour ignorer un double clic.
  const [graded, setGraded] = useState(false);
  // `Date.now()` est impur (interdit pendant le rendu) : l'horodatage de
  // départ est pris dans un effet, pas dans l'initialiseur du ref.
  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const isTerminal = solver.phase === "solved" || solver.phase === "failed";

  // Nombre de coups DU JOUEUR à trouver (plis pairs de la solution) — sert à
  // clarifier qu'il s'agit d'une SUITE à enchaîner, pas d'un coup isolé
  // (retour utilisateur : « il nous demande seulement un coup à trouver et
  // c'est pourtant l'enchaînement qui compte »), et au message du Coach
  // ci-dessous.
  const playerMoveCount = Math.ceil(puzzle.solution.length / 2);
  const solvingStatusText = `Trouve ${playerMoveCount > 1 ? `la suite (${playerMoveCount} coups)` : "le coup"} à jouer.`;

  // Indice qualifiant l'erreur — tant qu'un essai reste (voir
  // `MAX_PUZZLE_ATTEMPTS`), prioritaire sur le texte de phase habituel
  // puisqu'on est encore en phase "solving". Une fois "failed", le message
  // suit l'avancement de la révélation.
  const statusMessage =
    solver.phase === "solving" && solver.lastWrongUci
      ? `${WRONG_MOVE_HINT_LABEL[solver.lastWrongHint ?? "generic"]} Il vous reste ${solver.attemptsLeft} tentative${solver.attemptsLeft > 1 ? "s" : ""}.`
      : solver.phase === "failed"
        ? solver.revealed
          ? "Solution révélée."
          : solver.revealing
            ? "Regarde la séquence gagnante…"
            : STATUS_TEXT.failed
        : solver.phase === "solving"
          ? solvingStatusText
          : STATUS_TEXT[solver.phase];

  // Le Coach avant résolution : seulement tant qu'aucun coup n'a encore été
  // joué sur ce puzzle (`!solver.lastMove`) — une fois la solution entamée,
  // le texte redevient celui de la progression habituelle, jamais les deux à
  // la fois. Retour utilisateur : « on résout un puzzle sans savoir c'est
  // quoi la faiblesse ou l'opportunité présentée » (voir `pre-solve-coach.ts`).
  const showPreSolveCoach = solver.phase === "solving" && !solver.lastMove;
  const preSolveMessage = showPreSolveCoach
    ? buildPreSolveCoachMessage({
        setupSan: puzzle.setupMove?.san ?? null,
        motifs: puzzle.motifs ?? [],
        playerMoveCount,
      })
    : null;
  const recognitionAids = showPreSolveCoach
    ? buildRecognitionAids(solver.fen, solver.playerColor, puzzle.motifs ?? [])
    : null;

  // Le Coach APRÈS le premier coup : se met à jour à CHAQUE coup DU JOUEUR
  // accepté (jamais figé sur `preSolveMessage`) — cahier des charges du
  // 2026-09-06 (« le Coach reste bloqué sur un commentaire fixe »). Reste
  // affiché pendant la réponse adverse automatique ET le temps de réflexion
  // du coup suivant (persiste jusqu'au prochain coup correct) ; s'efface une
  // fois le puzzle raté, où c'est la séquence de révélation qui prend le
  // relais du récit.
  const progressMessage =
    !showPreSolveCoach && solver.lastPlayerTransition && solver.phase !== "failed"
      ? buildProgressCoachMessage({
          fenBefore: solver.lastPlayerTransition.fenBefore,
          fenAfter: solver.lastPlayerTransition.fenAfter,
          lastMoveUci: solver.lastPlayerTransition.uci,
          playerColor: solver.playerColor,
          movesRemaining: solver.movesRemaining,
        })
      : null;
  const coachMessage = preSolveMessage ?? progressMessage;
  const hintClassName =
    solver.phase === "solving" && solver.lastWrongUci
      ? "font-medium text-inaccuracy"
      : solver.phase === "failed"
        ? "font-medium text-inaccuracy"
        : solver.phase === "solved"
          ? "font-medium text-best"
          : "text-foreground-muted";

  // Position/contrôles affichés : le solveur tant que le puzzle est actif,
  // le Mode Analyse Pro (navigation + exploration libre) une fois terminé —
  // jamais les deux à la fois.
  const boardFen = postAnalysisActive ? postAnalysis.explore.fen : solver.fen;
  const boardOnPieceDrop = postAnalysisActive ? postAnalysis.explore.onPieceDrop : solver.onPieceDrop;
  const boardCanDragPiece = postAnalysisActive ? postAnalysis.explore.canDragPiece : solver.canDragPiece;
  // Flèche du coup adverse affiché en préambule (voir `showPreSolveCoach`
  // ci-dessus) — même case que `highlightFrom`/`highlightTo` de cette même
  // situation, mais une flèche se voit même quand la case de départ est vide
  // à l'œil (pièce partie), donc plus lisible qu'une simple surbrillance.
  const setupArrow =
    showPreSolveCoach && puzzle.setupMove
      ? [{ startSquare: puzzle.setupMove.uci.slice(0, 2), endSquare: puzzle.setupMove.uci.slice(2, 4), color: OPPONENT_MOVE_SQUARE_COLOR }]
      : [];
  const boardArrows = [...(postAnalysisActive ? postAnalysis.arrows : solver.boardArrows), ...setupArrow];
  const boardScore = postAnalysisActive ? postAnalysis.currentScore : solver.currentScore;

  // Surbrillance + badge du dernier coup joué. Trois sources, jamais deux à
  // la fois : le solveur (résolution active, réponse adverse, révélation),
  // l'exploration libre du Mode Analyse Pro (même schéma que
  // `game-review-screen.tsx`), ou — en Mode Analyse Pro SANS exploration en
  // cours — le pli de la solution qu'on est en train de consulter.
  let highlightFrom: string | undefined;
  let highlightTo: string | undefined;
  let highlightColor: string | null = null;
  let badgeSquare: string | null = null;
  let badgeQuality: MoveQuality | null = null;

  if (postAnalysisActive && postAnalysis.explore.isExploring) {
    const lastExplorerMove = postAnalysis.explore.explorerMoves[postAnalysis.explore.explorerMoves.length - 1] ?? null;
    const exploreQuality = postAnalysis.explore.evaluation.status === "ready" ? postAnalysis.explore.evaluation.evaluated.quality : null;
    highlightFrom = lastExplorerMove?.from;
    highlightTo = lastExplorerMove?.to;
    highlightColor = lastExplorerMove ? (exploreQuality ? qualitySquareColor(exploreQuality) : OPPONENT_MOVE_SQUARE_COLOR) : null;
    badgeSquare = lastExplorerMove?.to ?? null;
    badgeQuality = exploreQuality;
  } else if (postAnalysisActive) {
    const viewedPly = postAnalysis.viewPly > 0 ? postAnalysis.plies[postAnalysis.viewPly - 1] : null;
    // Rangs pairs (0-based) = coups du joueur, rangs impairs = réponses
    // adverses rejouées — même convention que `puzzle.solution`.
    const isPlayerPly = viewedPly !== null && (postAnalysis.viewPly - 1) % 2 === 0;
    highlightFrom = viewedPly?.uci.slice(0, 2);
    highlightTo = viewedPly?.uci.slice(2, 4);
    highlightColor = viewedPly ? (isPlayerPly ? qualitySquareColor("best") : OPPONENT_MOVE_SQUARE_COLOR) : null;
    badgeSquare = viewedPly && isPlayerPly ? highlightTo! : null;
    badgeQuality = viewedPly && isPlayerPly ? "best" : null;
  } else if (!solver.lastMove && puzzle.setupMove) {
    // Avant le premier coup du joueur : montre le coup adverse qui a créé la
    // position, plutôt qu'un échiquier nu sans aucun repère (retour
    // utilisateur : « on vient direct jouer sans savoir le dernier coup de
    // l'adversaire »). Jamais de badge de qualité — ce n'est pas un coup noté.
    highlightFrom = puzzle.setupMove.uci.slice(0, 2);
    highlightTo = puzzle.setupMove.uci.slice(2, 4);
    highlightColor = OPPONENT_MOVE_SQUARE_COLOR;
  } else if (solver.lastMove) {
    highlightFrom = solver.lastMove.from;
    highlightTo = solver.lastMove.to;
    highlightColor = solver.lastMove.quality ? qualitySquareColor(solver.lastMove.quality) : OPPONENT_MOVE_SQUARE_COLOR;
    badgeSquare = solver.lastMove.quality ? solver.lastMove.to : null;
    badgeQuality = solver.lastMove.quality;
  }

  const boardSquareStyles: Record<string, { backgroundColor: string }> =
    highlightColor && highlightFrom && highlightTo
      ? { [highlightFrom]: { backgroundColor: highlightColor }, [highlightTo]: { backgroundColor: highlightColor } }
      : {};
  if (recognitionAids) {
    for (const square of recognitionAids.targetSquares) {
      boardSquareStyles[square] = { backgroundColor: "rgba(244, 180, 0, 0.32)" };
    }
  }

  // Roi en échec/mat : surbrillance AUTOMATIQUE, indépendante de tout ce qui
  // précède — retour utilisateur : « certains puzzles où notre roi est en
  // mat, on tarde à le remarquer, alors ça devrait être automatique ». Un
  // anneau (box-shadow), jamais un fond plein : reste visible même si la case
  // porte déjà une autre surbrillance (ex. le roi vient d'être découvert par
  // le coup adverse affiché ci-dessus).
  const checkSquare = kingInCheckSquare(boardFen);

  const squareRenderer: SquareRenderer = ({ square, children }) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        ...(boardSquareStyles[square] ?? {}),
        ...(square === checkSquare ? { boxShadow: `inset 0 0 0 4px ${CHECK_SQUARE_RING_COLOR}` } : {}),
      }}
    >
      {children}
      {badgeQuality && square === badgeSquare && (
        <span className="pointer-events-none absolute right-0.5 top-0.5">
          <QualityBadge quality={badgeQuality} />
        </span>
      )}
    </div>
  );

  function handleGrade(grade: ReviewGrade) {
    if (graded || !onGraded) return;
    setGraded(true);
    onGraded(grade, solver.firstPlayedUci, Date.now() - startedAtRef.current);
  }

  function handleComplete() {
    if (graded || !onComplete) return;
    setGraded(true);
    onComplete();
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      {postAnalysisActive && postAnalysis.explore.isExploring && (
        <div className="mb-4">
          <ExplorePanel
            explorerMoves={postAnalysis.explore.explorerMoves}
            evaluation={postAnalysis.explore.evaluation}
            onExit={() => postAnalysis.explore.exit()}
            exitLabel="↩ Revenir à la solution"
          />
        </div>
      )}

      {coachMessage && (
        <div
          key={coachMessage}
          className="mx-auto mb-4 max-w-[480px] rounded-lg border border-border bg-surface-muted/40 px-4 py-3 text-sm animate-fade-up-in"
        >
          <span aria-hidden="true">🎓 </span>
          {coachMessage}
        </div>
      )}

      {recognitionAids && (
        <div className="mx-auto mb-4 flex max-w-[480px] items-start gap-2 rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-foreground-muted">
          <span aria-hidden="true">👁 </span>
          <span>{recognitionAids.text} Les cases ambrées indiquent des cibles à examiner, pas la solution.</span>
        </div>
      )}

      <div className="mx-auto flex max-w-[480px] items-stretch gap-2">
        <EvaluationBar score={boardScore} />
        <div className="min-w-0 flex-1">
          <Chessboard
            options={{
              id: "puzzle-review-board",
              position: boardFen,
              boardOrientation: solver.playerColor === "w" ? "white" : "black",
              onPieceDrop: boardOnPieceDrop,
              canDragPiece: boardCanDragPiece,
              onMouseOverSquare: solver.onMouseOverSquare,
              onMouseOutSquare: solver.onMouseOutSquare,
              squareRenderer,
              arrows: boardArrows,
            }}
          />
        </div>
      </div>

      <div className="mt-4 min-h-6 text-center text-sm">
        <p className={hintClassName}>{statusMessage}</p>
      </div>

      {postAnalysisActive && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => postAnalysis.goToPly(postAnalysis.viewPly - 1)}
            disabled={!postAnalysis.canGoPrevious}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-30"
          >
            ← Précédent
          </button>
          <span className="font-mono text-sm text-foreground-muted">
            {postAnalysis.viewPly} / {postAnalysis.totalPlies}
          </span>
          <button
            type="button"
            onClick={() => postAnalysis.goToPly(postAnalysis.viewPly + 1)}
            disabled={!postAnalysis.canGoNext}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-30"
          >
            Suivant →
          </button>
        </div>
      )}

      {isTerminal && (
        <div className="mt-4">
          {solver.phase === "failed" && solver.canReveal ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={solver.requestReveal}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                Révéler la solution
              </button>
            </div>
          ) : solver.phase === "failed" && solver.revealing ? null : graded ? (
            <p className="text-center text-sm text-foreground-muted">
              {onComplete ? "Chargement…" : "Enregistrement…"}
            </p>
          ) : onComplete ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleComplete}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Continuer →
              </button>
            </div>
          ) : (
            <GradePanel onGrade={handleGrade} />
          )}
        </div>
      )}
    </div>
  );
}
