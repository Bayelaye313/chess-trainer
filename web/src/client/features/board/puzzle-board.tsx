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
import { BookOpen, Eye, GraduationCap, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chessboard, type SquareRenderer } from "react-chessboard";
import { ESPORT_BOARD_OPTIONS, LAST_MOVE_TINT, LICHESS_BRUSH, qualityRingColor, SquareCircle } from "@/client/features/board/board-theme";
import { useEngine } from "@/client/engine/engine-context";
import { kingInCheckSquare } from "@/core/chess/check";
import { parseCoachComment } from "@/core/chess/move-tree";
import type { CoachMessage } from "@/core/curriculum/coach-feedbacks";
import { CourseCoachBubble } from "@/client/features/learn/course-coach-bubble";
import type { MoveQuality } from "@/core/chess/types";
import { buildPreSolveCoachMessage } from "@/core/puzzle/pre-solve-coach";
import { buildProgressCoachMessage } from "@/core/puzzle/progress-coach";
import { identifyPuzzlePattern } from "@/core/puzzle/puzzle-pattern";
import { buildRecognitionAids } from "@/core/puzzle/recognition-aids";
import { solutionMoveQuality } from "@/core/puzzle/solution-quality";
import { hasFailedAttempt, type SolvablePuzzle, type SolvePhase } from "@/core/puzzle/solve-state";
import { CHECK_SQUARE_RING_COLOR, WRONG_MOVE_HINT_LABEL } from "@/lib/labels";
import type { ReviewGrade } from "@/server/srs/fsrs";
import { EvaluationBar } from "./evaluation-bar";
import { ExplorePanel } from "./explore-panel";
import { GradePanel } from "./grade-panel";
import { QualityBadge } from "./quality-badge";
import { usePostSolveAnalysis } from "./use-post-solve-analysis";
import { usePuzzleSolver } from "./use-puzzle-solver";
import { OPPONENT_MOVE_ANIMATION_MS, SETUP_MOVE_ANIMATION_MS } from "./move-animation";

const STATUS_TEXT: Record<SolvePhase, string> = {
  solving: "Trouve le coup à jouer.",
  "opponent-reply": "L'adversaire répond…",
  solved: "Puzzle résolu !",
  failed: "Plus d'essai — découvre la solution.",
};

export function PuzzleBoard({
  puzzle,
  coachComment = null,
  onGraded,
  onComplete,
}: {
  puzzle: SolvablePuzzle;
  /**
   * Commentaire du coach sur l'erreur RÉELLE de la partie (puzzles de l'onglet
   * Entraîner audités par Stockfish, format `[%txt] [%csl] [%cal]` de nos
   * cours) : affiché seulement une fois le puzzle terminé — jamais de
   * spoiler pendant la recherche — et ses repères (coup joué en rouge, coup
   * attendu en vert, cases clés) dessinés sur la position de départ.
   */
  coachComment?: string | null;
  /** Mode Entraîner : note FSRS une fois le puzzle terminé (résolu ou raté). */
  onGraded?: (grade: ReviewGrade, playedUci: string | null, solvedMs: number) => void;
  /**
   * Mode Apprendre : pas de FSRS, un seul bouton pour enchaîner — voir
   * `theme-session.tsx`. `solved` dit si la résolution est RÉELLEMENT venue à
   * bout de `puzzle.solution` (chaque coup du joueur validé par l'instance
   * `chess.js` du solveur) : un puzzle raté PUIS révélé appelle aussi ce
   * callback (le parent enchaîne), mais SANS signal audio de réussite —
   * feuille de route Zone 2, validation de la Practice Arena.
   */
  onComplete?: (solved: boolean) => void;
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
  // La ligne de statut ne porte PLUS le conseil d'erreur : il vit dans le
  // panneau de feedback unique ci-dessous (`practicalHint`) — jamais deux
  // couches de commentaire concurrentes au-dessus du plateau (feuille de
  // route Zone 2, « Unifier le Volet de Feedback »).
  const statusMessage =
    solver.phase === "failed"
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
  const showPreSolveCoach = solver.phase === "solving" && !solver.lastMove && !solver.introPlaying;
  // Le pattern du puzzle et son cours d'Académie (voir `puzzle-pattern.ts`) —
  // retour utilisateur : nommer le schéma et le cours à revoir plutôt qu'un
  // conseil générique « Observe les menaces… ».
  const pattern = useMemo(
    () => identifyPuzzlePattern(puzzle.fenBefore, puzzle.solution, puzzle.motifs ?? []),
    [puzzle.fenBefore, puzzle.solution, puzzle.motifs],
  );
  // Indices textuels (🎓 Pattern / motifs nommés, 📘 Cours à revoir) masqués
  // au chargement — ils facilitaient le puzzle dès le départ — et révélés
  // seulement après un PREMIER essai infructueux. Les cercles verts des
  // cibles (`recognitionAids`), eux, restent visibles d'emblée.
  const hasFailed = hasFailedAttempt(solver);
  // Coup adverse VU se jouer sur l'échiquier (intro animée) : inutile de le
  // dicter en plus. Seulement en repli, quand il n'a pas pu être animé.
  const preSolveSetupSan = solver.introAnimated ? null : (puzzle.setupMove?.san ?? null);
  const preSolvePattern = hasFailed ? pattern : null;
  const preSolveMotifs = hasFailed ? (puzzle.motifs ?? []) : [];
  // Sans coup adverse à rappeler ni pattern/motif à nommer, le Coach ne dirait
  // que « Trouve la suite gagnante (N coups à enchaîner) » : la ligne de
  // statut sous l'échiquier le dit déjà (retour utilisateur 2026-11-04,
  // consigne affichée deux fois).
  const preSolveHasInsight = preSolveSetupSan !== null || preSolvePattern !== null || preSolveMotifs.length > 0;
  const preSolveMessage =
    showPreSolveCoach && preSolveHasInsight
      ? buildPreSolveCoachMessage({ setupSan: preSolveSetupSan, pattern: preSolvePattern, motifs: preSolveMotifs, playerMoveCount })
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

  /**
   * Conseil PRATIQUE du panneau de feedback unique (feuille de route Zone 2) :
   * la qualification de l'erreur commise (« Tu laisses une pièce en prise… » +
   * essais restants) PRIORITAIRE, sinon les aides de reconnaissance (cases
   * cerclées). Cette ligne vit dans le MÊME cadre que l'évaluation du Coach
   * (🎓) rendu plus bas — plus de deux sections parallèles qui se parasitent.
   */
  const practicalHint =
    solver.phase === "solving" && solver.lastWrongUci
      ? {
          kind: "error" as const,
          text: `${WRONG_MOVE_HINT_LABEL[solver.lastWrongHint ?? "generic"]} Il vous reste ${solver.attemptsLeft} tentative${solver.attemptsLeft > 1 ? "s" : ""}.`,
        }
      : solver.lastAlternative && solver.phase !== "failed"
        ? {
            kind: "info" as const,
            text: `${solver.lastAlternative.playedSan} est aussi bon selon le moteur ! Dans la partie, le maître a joué ${solver.lastAlternative.masterSan} : on poursuit avec sa suite.`,
          }
      : showPreSolveCoach && recognitionAids
        ? {
            kind: "info" as const,
            text: `${recognitionAids.text} Les cases cerclées indiquent des cibles à examiner, pas la solution.`,
          }
        : null;
  // 📘 Cours à revoir : ligne à part (elle s'affiche en même temps que l'indice
  // d'erreur ⚠️, qui reste prioritaire sur `practicalHint`), seulement après
  // un premier essai raté, puis jusqu'à la fin du puzzle.
  const courseToReview =
    hasFailed && pattern?.theme ? { title: pattern.theme.title, href: `/apprendre?themeId=${pattern.theme.themeId}` } : null;

  const hintClassName =
    solver.phase === "failed"
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
  // Flèche du coup adverse en préambule : SEULEMENT en repli, quand ce coup
  // n'a pas pu être joué en animation (position d'avant inconnue, voir
  // `introStartFen`) — sinon on l'a VU se jouer, une flèche serait redondante.
  const setupArrow =
    showPreSolveCoach && puzzle.setupMove && !solver.introAnimated
      ? [{ startSquare: puzzle.setupMove.uci.slice(0, 2), endSquare: puzzle.setupMove.uci.slice(2, 4), color: LICHESS_BRUSH.blue }]
      : [];
  // Commentaire du coach (partie réelle) : repères géométriques sur la
  // position de DÉPART uniquement (pli 0 du Mode Analyse Pro, hors exploration).
  const gameComment = useMemo(() => (coachComment ? parseCoachComment(coachComment) : null), [coachComment]);
  const gameCommentMessage: CoachMessage | null =
    postAnalysisActive && gameComment?.text
      ? { profile: "murDeBriques", outcome: "echec", label: "Ton erreur dans la partie", text: gameComment.text }
      : null;
  const showGameCommentMarks = gameCommentMessage !== null && postAnalysis.viewPly === 0 && !postAnalysis.explore.isExploring;
  const gameCommentArrows = showGameCommentMarks
    ? gameComment!.arrows.map((arrow) => ({ startSquare: arrow.from, endSquare: arrow.to, color: arrow.color === "red" ? LICHESS_BRUSH.red : LICHESS_BRUSH.green }))
    : [];
  const gameCommentCircles = new Map<string, string>(
    showGameCommentMarks ? gameComment!.highlights.map((h) => [h.square, h.color === "red" ? LICHESS_BRUSH.red : LICHESS_BRUSH.green]) : [],
  );

  const boardArrows = showGameCommentMarks
    ? gameCommentArrows
    : [...(postAnalysisActive ? postAnalysis.arrows : solver.boardArrows), ...setupArrow];
  const boardScore = postAnalysisActive ? postAnalysis.currentScore : solver.currentScore;

  // Surbrillance + badge du dernier coup joué. Trois sources, jamais deux à
  // la fois : le solveur (résolution active, réponse adverse, révélation),
  // l'exploration libre du Mode Analyse Pro (même schéma que
  // `game-review-screen.tsx`), ou — en Mode Analyse Pro SANS exploration en
  // cours — le pli de la solution qu'on est en train de consulter.
  let highlightFrom: string | undefined;
  let highlightTo: string | undefined;
  let badgeSquare: string | null = null;
  let badgeQuality: MoveQuality | null = null;

  if (postAnalysisActive && postAnalysis.explore.isExploring) {
    const lastExplorerMove = postAnalysis.explore.explorerMoves[postAnalysis.explore.explorerMoves.length - 1] ?? null;
    const exploreQuality = postAnalysis.explore.evaluation.status === "ready" ? postAnalysis.explore.evaluation.evaluated.quality : null;
    highlightFrom = lastExplorerMove?.from;
    highlightTo = lastExplorerMove?.to;
    badgeSquare = lastExplorerMove?.to ?? null;
    badgeQuality = exploreQuality;
  } else if (postAnalysisActive) {
    const viewedPly = postAnalysis.viewPly > 0 ? postAnalysis.plies[postAnalysis.viewPly - 1] : null;
    // Rangs pairs (0-based) = coups du joueur, rangs impairs = réponses
    // adverses rejouées — même convention que `puzzle.solution`.
    const isPlayerPly = viewedPly !== null && (postAnalysis.viewPly - 1) % 2 === 0;
    highlightFrom = viewedPly?.uci.slice(0, 2);
    highlightTo = viewedPly?.uci.slice(2, 4);
    const viewedFenBefore = postAnalysis.viewPly > 1 ? postAnalysis.plies[postAnalysis.viewPly - 2].fenAfter : puzzle.fenBefore;
    badgeSquare = viewedPly && isPlayerPly ? highlightTo! : null;
    badgeQuality = viewedPly && isPlayerPly ? solutionMoveQuality(viewedFenBefore, viewedPly.uci) : null;
  } else if (!solver.lastMove && puzzle.setupMove && !solver.introPlaying) {
    // Avant le premier coup du joueur : montre le coup adverse qui a créé la
    // position, plutôt qu'un échiquier nu sans aucun repère (retour
    // utilisateur : « on vient direct jouer sans savoir le dernier coup de
    // l'adversaire »). Jamais de badge de qualité — ce n'est pas un coup noté.
    highlightFrom = puzzle.setupMove.uci.slice(0, 2);
    highlightTo = puzzle.setupMove.uci.slice(2, 4);
  } else if (solver.lastMove) {
    highlightFrom = solver.lastMove.from;
    highlightTo = solver.lastMove.to;
    badgeSquare = solver.lastMove.quality ? solver.lastMove.to : null;
    badgeQuality = solver.lastMove.quality;
  }

  // Dernier coup façon Lichess : un léger voile sur les deux cases, et pour un
  // coup REMARQUABLE (voir `qualityRingColor`) un cercle de sa couleur —
  // plus de cases pleines teintées (ambre/vert) qui masquaient les pièces.
  const lastMoveTint = highlightFrom && highlightTo ? new Set([highlightFrom, highlightTo]) : new Set<string>();
  const ringColor = badgeQuality ? qualityRingColor(badgeQuality) : null;
  const qualityCircleSquare = ringColor && badgeSquare ? badgeSquare : null;
  // Aides de reconnaissance : des CERCLES façon Lichess autour des cibles —
  // plus de cases ambrées pleines qui masquaient la surbrillance du dernier coup.
  const circledSquares = new Set(recognitionAids?.targetSquares ?? []);

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
        ...(lastMoveTint.has(square) ? { backgroundColor: LAST_MOVE_TINT } : {}),
        ...(square === checkSquare ? { boxShadow: `inset 0 0 0 4px ${CHECK_SQUARE_RING_COLOR}` } : {}),
      }}
    >
      {children}
      {circledSquares.has(square) && <SquareCircle color={LICHESS_BRUSH.green} />}
      {gameCommentCircles.has(square) && <SquareCircle color={gameCommentCircles.get(square)!} />}
      {square === qualityCircleSquare && ringColor && <SquareCircle color={ringColor} />}
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
    // La résolution n'est « réussie » que si la machine d'état a consommé
    // TOUTE la solution — chaque coup du joueur étant passé par `chess.move()`
    // du solveur (voir `onPieceDrop`) : c'est ce drapeau qui empêche le signal
    // audio de réussite de partir sur un puzzle raté puis révélé (Zone 2).
    onComplete(solver.phase === "solved");
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      {/* Grand échiquier à gauche, commentaire et contrôles à droite — côte à
          côte seulement à partir de `lg` : en dessous, la colonne du Coach
          était écrasée (≈120 px à 820 px de large, texte hors du cadre,
          retour utilisateur 2026-11-04) ; elle passe alors sous l'échiquier. */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="mx-auto w-full max-w-[600px] shrink-0 lg:mx-0 lg:w-[460px] xl:w-[600px]">
          <div className="flex items-stretch gap-2">
            <EvaluationBar score={boardScore} size="lg" />
            <div className="min-w-0 flex-1">
              <Chessboard
                options={{ ...ESPORT_BOARD_OPTIONS,
                  id: "puzzle-review-board",
                  position: boardFen,
                  boardOrientation: solver.playerColor === "w" ? "white" : "black",
                  onPieceDrop: boardOnPieceDrop,
                  canDragPiece: boardCanDragPiece,
                  onMouseOverSquare: solver.onMouseOverSquare,
                  onMouseOutSquare: solver.onMouseOutSquare,
                  squareRenderer,
                  arrows: boardArrows,
                  // Micro-animation du coup adverse en 180 ms ease-in-out
                  // (feuille de route Zone 2) — la surbrillance des cases, elle,
                  // attend la fin de l'animation (dispatch différé dans
                  // `use-puzzle-solver.ts`, voir `move-animation.ts`).
                  animationDurationInMs: solver.introPlaying ? SETUP_MOVE_ANIMATION_MS : OPPONENT_MOVE_ANIMATION_MS,
                }}
              />
            </div>
          </div>

          <div className="mt-3 min-h-6 text-center text-sm">
            <p className={hintClassName}>{statusMessage}</p>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-4 lg:min-w-[260px]">
          {postAnalysisActive && postAnalysis.explore.isExploring && (
            <div>
              <ExplorePanel
                explorerMoves={postAnalysis.explore.explorerMoves}
                evaluation={postAnalysis.explore.evaluation}
                onExit={() => postAnalysis.explore.exit()}
                exitLabel="↩ Revenir à la solution"
              />
            </div>
          )}

          {/* UN SEUL panneau de feedback contextuel (feuille de route Zone 2) :
              l'évaluation textuelle du Grand Maître (🎓) ET le conseil pratique
              (erreur commise ⚠️ / aides de reconnaissance 👁) au même endroit —
              les deux sections concurrentes qui se parasitaient au-dessus du
              plateau n'existent plus séparément. `key` rejoue l'animation
              d'entrée à chaque changement de contenu. */}
          {(coachMessage || practicalHint || courseToReview) && (
            <div
              key={`${coachMessage ?? ""}|${practicalHint?.text ?? ""}|${courseToReview?.href ?? ""}`}
              className="rounded-lg border border-border border-l-4 border-l-border-strong bg-surface-muted px-4 py-3 text-sm animate-fade-up-in"
            >
              {coachMessage && (
                <p className="flex items-start gap-2 text-foreground">
                  <GraduationCap aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground-muted" />
                  <span>{coachMessage}</span>
                </p>
              )}
              {practicalHint && (
                <p
                  className={`mt-1.5 flex items-start gap-2 ${
                    practicalHint.kind === "error" ? "font-medium text-inaccuracy" : "text-foreground-muted"
                  }`}
                >
                  {practicalHint.kind === "error" ? <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <Eye aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
                  <span>{practicalHint.text}</span>
                </p>
              )}
              {courseToReview && (
                <p className="mt-1.5 flex items-start gap-2 text-foreground-muted">
                  <BookOpen aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Cours à revoir :{" "}
                    <Link
                      href={courseToReview.href}
                      target="_blank"
                      rel="noopener"
                      className="font-medium text-foreground underline underline-offset-2 hover:text-best"
                    >
                      {courseToReview.title} ↗
                    </Link>
                  </span>
                </p>
              )}
            </div>
          )}

          {gameCommentMessage && (
            <div className="space-y-2">
              <CourseCoachBubble message={gameCommentMessage} />
              {!showGameCommentMarks && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => postAnalysis.goToPly(0)}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-sm text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                  >
                    Voir l&apos;erreur sur l&apos;échiquier
                  </button>
                </div>
              )}
            </div>
          )}

          {postAnalysisActive && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => postAnalysis.goToPly(postAnalysis.viewPly - 1)}
                disabled={!postAnalysis.canGoPrevious}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-sm disabled:opacity-30"
              >
                Précédent
              </button>
              <span className="font-mono text-sm text-foreground-muted">
                {postAnalysis.viewPly} / {postAnalysis.totalPlies}
              </span>
              <button
                type="button"
                onClick={() => postAnalysis.goToPly(postAnalysis.viewPly + 1)}
                disabled={!postAnalysis.canGoNext}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-sm disabled:opacity-30"
              >
                Suivant
              </button>
            </div>
          )}

          {isTerminal && (
            <div>
              {solver.phase === "failed" && solver.canReveal ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={solver.requestReveal}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-surface-muted"
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
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                  >
                    Continuer
                  </button>
                </div>
              ) : (
                <GradePanel onGrade={handleGrade} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
