"use client";

/**
 * LE lecteur de cours de l'Académie — cahier des charges du 2026-10-09 : un
 * seul format, l'arbre façon Lichess Study, pour TOUS les thèmes (voir
 * `core/curriculum/course-tree-adapters.ts` pour l'origine des arbres : RAV
 * natif, leçon convertie, ou exercices réels du thème).
 *
 * Disposition calquée sur une étude Lichess : l'échiquier à gauche, à droite
 * la liste numérotée des chapitres, l'arbre de notation (`MoveTreeViewer`),
 * puis UN seul volet de feedback (`CoachFeedbackPanel`) — annotation, conseil
 * de GM et légende de la flèche moteur réunis. Toutes les zones ont une taille
 * fixe ou une hauteur minimale : changer de nœud ne fait jamais sauter la page.
 *
 * Deux modes (voir `course-tree-nav.ts`) : lecture libre (clic, ←/→) et
 * « Jouer les coups », le mode gamebook de Lichess où le lecteur joue
 * lui-même la ligne et où les réponses adverses sont jouées pour lui.
 *
 * Gel de lecture (`[%txt "…"]`, `ChessMoveNode.freeze`) : la présence de la
 * balise [%txt] doit impérativement FREEZER (geler) le flux du jeu.
 * L'ordinateur a interdiction de jouer son coup tant que l'utilisateur n'a
 * pas cliqué sur le bouton « Suivant » ou appuyé sur Espace pour valider la
 * lecture du commentaire. Sans la balise, la réponse part après
 * `OPPONENT_REPLY_MS` comme avant.
 *
 * Coach Virtuel (`CourseCoachBubble`, catalogue `coach-feedbacks.ts`) : en
 * mode jeu, `resolveCoachSlot` décide après chaque tentative si le coach
 * parle ; sa bulle s'affiche au-dessus du volet de feedback. Une bulle sur un
 * coup juste gèle la réponse adverse exactement comme `[%txt]` : « Suivant » /
 * Espace la referme ET fait jouer l'adversaire. Après un coup refusé, elle
 * reste jusqu'à la tentative suivante.
 *
 * Barre d'évaluation : le score posé par l'auteur (`[%eval]` →
 * `evaluationScore`, affiché si `showEvalBar`) s'affiche immédiatement ;
 * sans lui, la barre montre l'analyse Stockfish live de la position.
 *
 * Indices progressifs (`ChessMoveNode.hints`, balise `[%hint]`) : sur la
 * position où il faut punir une faute adverse, « Indice » dévoile le principe
 * violé, puis la faiblesse (cases `[%hintcsl]` allumées), puis l'action ; un
 * dernier clic montre la flèche du coup. Disponible en lecture comme en jeu.
 *
 * L'état du curseur vit dans `courseTreeNavReducer` (pur, testé). Les effets
 * du composant n'appellent jamais `setState` dans leur corps : l'un abonne le
 * clavier, un autre annule la réponse adverse programmée au démontage, et
 * `useLiveEvaluation` n'écrit qu'à l'arrivée de la réponse du moteur.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs, type SquareRenderer } from "react-chessboard";
import { ESPORT_BOARD_OPTIONS, LICHESS_BRUSH, SquareCircle } from "@/client/features/board/board-theme";
import { findNode, pathTo, plyOffsetOf, type ChessMoveNode } from "@/core/chess/move-tree";
import { buildCoachFeedback } from "@/core/curriculum/coach-feedback";
import { pickCoachMessage, resolveCoachSlot } from "@/core/curriculum/coach-feedbacks";
import type { CourseTree } from "@/core/curriculum/course-tree";
import { useEngine } from "@/client/engine/engine-context";
import { EvaluationBar, type EvalScore } from "@/client/features/board/evaluation-bar";
import { REVEAL_ARROW_COLOR } from "@/lib/labels";
import { CoachFeedbackPanel } from "./coach-feedback-panel";
import { CourseCoachBubble } from "./course-coach-bubble";
import {
  childForDrop,
  courseTreeNavReducer,
  initialCourseTreeNav,
  isPlayerTurn,
  moveArrowRevealed,
  playedCoachContext,
  turnOfFen,
  type PlayedMove,
} from "./course-tree-nav";
import { MoveTreeViewer } from "./move-tree-viewer";

/** Flèches et cercles de l'auteur : pinceaux Lichess, comme dans l'étude d'origine. */
const GREEN = LICHESS_BRUSH.green;
const RED = LICHESS_BRUSH.red;
/** Délai avant la réponse adverse automatique en mode jeu — le temps de voir son propre coup arriver. */
const OPPONENT_REPLY_MS = 450;

/** Profondeur de la jauge live — la même que l'analyse pli à pli après un puzzle (`use-post-solve-analysis.ts`). */
const LIVE_EVAL_DEPTH = 16;
/** Attente avant d'interroger le moteur : défiler vite avec ←/→ n'empile pas une analyse par position survolée. */
const LIVE_EVAL_DEBOUNCE_MS = 150;

/**
 * Évaluation Stockfish RÉELLE de la position affichée, pour la barre
 * d'évaluation. Compteur de requête : une réponse tardive ne s'applique jamais
 * à une position déjà quittée ; la dernière valeur connue reste affichée en
 * attendant (ou en cas d'échec) plutôt qu'une barre qui clignote.
 */
function useLiveEvaluation(fen: string): EvalScore | null {
  const { engine } = useEngine();
  const [score, setScore] = useState<EvalScore | null>(null);
  const requestId = useRef(0);
  useEffect(() => {
    if (!engine) return;
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      engine
        .analyse(fen, { depth: LIVE_EVAL_DEPTH })
        .then((evaluation) => {
          if (requestId.current === id) setScore({ cp: evaluation.cp, mate: evaluation.mate });
        })
        .catch(() => {});
    }, LIVE_EVAL_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [engine, fen]);
  return score;
}

/** SAN d'un glisser-déposer hors de l'arbre, pour que le coach le cite — `null` si le coup est illégal. */
function sanOfDrop(fen: string, from: string, to: string): string | null {
  try {
    return new Chess(fen).move({ from, to, promotion: "q" }).san;
  } catch {
    return null;
  }
}

function sideLabel(color: "w" | "b"): string {
  return color === "w" ? "Blancs" : "Noirs";
}

export function CourseTreeViewer({ tree, onComplete }: { tree: CourseTree; onComplete?: () => void }) {
  const [state, dispatch] = useReducer(courseTreeNavReducer, tree.chapters[0].root.id, initialCourseTreeNav);
  const chapter = tree.chapters[state.chapterIndex];
  const root = chapter.root;
  const playerColor = turnOfFen(root.fen);
  const playing = state.mode === "play";

  const currentNode = useMemo(() => findNode(root, state.currentId) ?? root, [root, state.currentId]);
  const path = useMemo(() => pathTo(root, currentNode.id), [root, currentNode.id]);
  const parentNode: ChessMoveNode | null = path.length >= 2 ? path[path.length - 2] : null;
  const plyOffset = plyOffsetOf(root.fen);
  const feedback = useMemo(() => buildCoachFeedback(currentNode, plyOffset), [currentNode, plyOffset]);
  const playerToMove = playing && isPlayerTurn(currentNode, playerColor);
  const lineFinished = currentNode.children.length === 0;
  // Coach Virtuel : le slot se dérive du dernier coup tenté (rangé par le reducer).
  const coachSlot = playing && state.coach ? resolveCoachSlot(state.coach.ctx) : null;
  const coachMessage =
    coachSlot && state.coach
      ? pickCoachMessage(coachSlot, state.coach.ctx.ply, {
          coup: Math.ceil(state.coach.ctx.ply / 2),
          san: state.coach.san ?? undefined,
          precision: state.coach.ctx.accuracy ?? undefined,
        })
      : null;
  // Gel `[%txt]` ou bulle du coach : le coup qui vient d'être joué porte un
  // texte à lire, et la réponse adverse attend « Suivant » / Espace.
  const awaitingRead = playing && !lineFinished && (currentNode.freeze || coachSlot !== null) && turnOfFen(currentNode.fen) !== playerColor;
  const liveScore = useLiveEvaluation(currentNode.fen);
  // `[%eval #0]` : la position est un mat, le camp au trait est maté.
  const checkmatedBy = currentNode.showEvalBar && currentNode.evaluationMate === 0 ? (turnOfFen(currentNode.fen) === "w" ? "b" : "w") : null;
  const evalScore: EvalScore | null = !currentNode.showEvalBar
    ? liveScore
    : currentNode.evaluationMate !== null
      ? { cp: null, mate: currentNode.evaluationMate }
      : currentNode.evaluationScore !== null
        ? { cp: Math.round(currentNode.evaluationScore * 100), mate: null }
        : liveScore;

  // Réponse adverse programmée (mode jeu) — annulée à chaque nouvelle action
  // et au démontage, pour ne jamais jouer un coup sur un chapitre déjà quitté.
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelReply = useCallback(() => {
    if (replyTimer.current !== null) clearTimeout(replyTimer.current);
    replyTimer.current = null;
  }, []);
  useEffect(() => cancelReply, [cancelReply]);

  const select = useCallback(
    (id: string) => {
      cancelReply();
      dispatch({ type: "select", id });
    },
    [cancelReply],
  );

  /**
   * Joue `child` pour le lecteur, puis programme la réponse adverse s'il y en
   * a une — sauf gel `[%txt]` ou bulle du coach, où elle attend `playReply`.
   * Le slot du coach est évalué ICI, avant le dispatch, avec le même contexte
   * que le reducer : la décision de geler ne dépend pas d'un rendu à venir.
   */
  const playForPlayer = useCallback(
    (child: ChessMoveNode, revealed = false) => {
      cancelReply();
      const move: PlayedMove = {
        id: child.id,
        ply: child.ply + plyOffset,
        san: child.san,
        punishesBlunder: currentNode.hints.length > 0,
        revealed,
      };
      dispatch({ type: "played", move });
      const coachSpeaks = !revealed && resolveCoachSlot(playedCoachContext(state, move)) !== null;
      const reply = child.children[0];
      if (reply && turnOfFen(child.fen) !== playerColor && !child.freeze && !coachSpeaks) {
        replyTimer.current = setTimeout(() => {
          replyTimer.current = null;
          dispatch({ type: "select", id: reply.id });
        }, OPPONENT_REPLY_MS);
      }
    },
    [cancelReply, currentNode, plyOffset, state, playerColor],
  );

  /** « Suivant » / Espace pendant un gel : l'adversaire joue enfin sa réponse (ligne principale). */
  const playReply = useCallback(() => {
    if (currentNode.children.length > 0) select(currentNode.children[0].id);
  }, [currentNode, select]);

  const goToChapter = useCallback(
    (index: number) => {
      cancelReply();
      dispatch({ type: "chapter", index, rootId: tree.chapters[index].root.id });
    },
    [cancelReply, tree],
  );
  const setMode = useCallback(
    (mode: "read" | "play") => {
      cancelReply();
      dispatch({ type: "mode", mode, rootId: root.id });
    },
    [cancelReply, root.id],
  );

  const goPrev = useCallback(() => {
    if (parentNode) select(parentNode.id);
  }, [parentNode, select]);
  const goNext = useCallback(() => {
    if (currentNode.children.length > 0) select(currentNode.children[0].id);
  }, [currentNode, select]);

  // Abonnement clavier : un écouteur d'évènement, `dispatch` n'est appelé
  // qu'à la frappe d'une vraie touche — jamais dans le corps de l'effet.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
      // Espace = « Suivant » pendant un gel `[%txt]`. Un bouton qui a le focus
      // reçoit déjà Espace comme un clic : on ne le double pas.
      if (event.key === " " && awaitingRead && target?.tagName !== "BUTTON") {
        event.preventDefault();
        playReply();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, awaitingRead, playReply]);

  // Dernier chapitre ouvert au moins une fois = cours terminé (navigation
  // libre : rien à « finir » dans un arbre qu'on explore dans tous les sens).
  useEffect(() => {
    if (state.chapterIndex === tree.chapters.length - 1) onComplete?.();
  }, [state.chapterIndex, tree.chapters.length, onComplete]);

  function canDragPiece({ piece }: PieceHandlerArgs): boolean {
    return playerToMove && piece.pieceType.startsWith(playerColor);
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!playerToMove || !targetSquare) return false;
    const child = childForDrop(currentNode, sourceSquare, targetSquare);
    if (!child) {
      dispatch({ type: "wrong", ply: currentNode.ply + 1 + plyOffset, san: sanOfDrop(currentNode.fen, sourceSquare, targetSquare) });
      return false;
    }
    playForPlayer(child);
    return true;
  }

  // En mode jeu, tant que c'est au lecteur de trouver le coup, les flèches et
  // cases de l'auteur restent cachées (elles donneraient la réponse) — sauf
  // flèche du coup attendu dévoilée, après les indices textuels du nœud.
  const arrowRevealed = state.feedback === "hint" && moveArrowRevealed(currentNode, state.hintLevel);
  const hideAnnotations = playerToMove && !arrowRevealed;
  const shownHints = currentNode.hints.slice(0, state.hintLevel);
  const dataArrows = hideAnnotations
    ? []
    : currentNode.arrows.map((arrow) => ({ startSquare: arrow.from, endSquare: arrow.to, color: arrow.color === "red" ? RED : GREEN }));
  const engineArrow =
    currentNode.engineSuggestion && !playing
      ? [{ startSquare: currentNode.engineSuggestion.uci.slice(0, 2), endSquare: currentNode.engineSuggestion.uci.slice(2, 4), color: REVEAL_ARROW_COLOR }]
      : [];
  const hintArrow =
    playerToMove && arrowRevealed
      ? [{ startSquare: currentNode.children[0].uci!.slice(0, 2), endSquare: currentNode.children[0].uci!.slice(2, 4), color: GREEN }]
      : [];
  const arrows = [...dataArrows, ...engineArrow, ...hintArrow];

  // `[%csl]` : un CERCLE autour de la case, comme sur Lichess — jamais un fond coloré plein.
  const circles = new Map<string, string>();
  if (!hideAnnotations) {
    for (const highlight of currentNode.highlights) circles.set(highlight.square, highlight.color === "red" ? RED : GREEN);
  }
  // À partir du 2e indice, la faiblesse à viser s'allume (`[%hintcsl]`).
  if (shownHints.length >= 2) {
    for (const highlight of currentNode.hintHighlights) circles.set(highlight.square, highlight.color === "red" ? RED : GREEN);
  }
  const squareRenderer: SquareRenderer = ({ square, children }) => {
    const circle = circles.get(square);
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {children}
        {circle && <SquareCircle color={circle} />}
      </div>
    );
  };

  const playPrompt = playing ? (
    playerToMove ? (
      <div className="flex items-center justify-between gap-2">
        <p className={state.feedback === "wrong" ? "font-medium text-inaccuracy" : "font-medium text-foreground"}>
          {state.feedback === "wrong" ? "Ce n'est pas le coup de l'étude — réessaie." : `À toi de jouer : trouve le coup des ${sideLabel(playerColor)}.`}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => dispatch({ type: "hint" })} className="rounded border border-border px-2 py-0.5 text-xs hover:bg-surface-muted">
            {hintButtonLabel(currentNode, state.hintLevel)}
          </button>
          <button type="button" onClick={() => playForPlayer(currentNode.children[0], true)} className="rounded border border-border px-2 py-0.5 text-xs hover:bg-surface-muted">
            Voir le coup
          </button>
        </div>
      </div>
    ) : lineFinished ? (
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-best">✓ Ligne terminée.</p>
        {state.chapterIndex < tree.chapters.length - 1 && (
          <button type="button" onClick={() => goToChapter(state.chapterIndex + 1)} className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            Chapitre suivant →
          </button>
        )}
      </div>
    ) : awaitingRead ? (
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-foreground">Lis le commentaire, puis passe à la réponse adverse.</p>
        <button type="button" onClick={playReply} className="shrink-0 rounded bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
          Suivant (Espace)
        </button>
      </div>
    ) : (
      <p className="text-foreground-muted">Réponse adverse…</p>
    )
  ) : null;

  // Lecture libre : les indices se dévoilent aussi, sans flèche (l'arbre montre déjà la suite).
  const readHintButton =
    !playing && currentNode.hints.length > 0 && state.hintLevel < currentNode.hints.length ? (
      <button type="button" onClick={() => dispatch({ type: "hint" })} className="rounded border border-border px-2 py-0.5 text-xs hover:bg-surface-muted">
        {hintButtonLabel(currentNode, state.hintLevel)}
      </button>
    ) : null;
  const hintLadder =
    shownHints.length > 0 || readHintButton ? (
      <div className="space-y-1.5">
        {readHintButton && (
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-foreground">Trouve la punition : des indices sont disponibles.</p>
            {readHintButton}
          </div>
        )}
        {shownHints.length > 0 && (
          <ol className="space-y-1">
            {shownHints.map((hint, index) => (
              <li key={index} className="rounded border border-border bg-surface-muted px-2 py-1 text-xs text-foreground">
                <span className="font-semibold">Indice {index + 1} : </span>
                {hint}
              </li>
            ))}
          </ol>
        )}
      </div>
    ) : null;
  const prompt =
    playPrompt || hintLadder ? (
      <div className="space-y-2">
        {playPrompt}
        {hintLadder}
      </div>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="w-full shrink-0 md:w-[480px] lg:w-[600px]">
          <div className="flex gap-2">
            <EvaluationBar score={evalScore} size="lg" checkmatedBy={checkmatedBy} />
            <div className="min-w-0 flex-1">
              <Chessboard
                options={{ ...ESPORT_BOARD_OPTIONS,
                  id: "course-tree-board",
                  position: currentNode.fen,
                  boardOrientation: playerColor === "b" ? "black" : "white",
                  canDragPiece,
                  onPieceDrop,
                  arrows,
                  squareRenderer,
                }}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 pl-9 sm:pl-11">
            <div className="inline-flex rounded-md border border-border p-0.5 text-xs" role="radiogroup" aria-label="Mode de lecture">
              {(["read", "play"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={state.mode === mode}
                  onClick={() => setMode(mode)}
                  className={`rounded px-2.5 py-1 font-medium transition-colors ${
                    state.mode === mode ? "bg-accent text-accent-foreground" : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {mode === "read" ? "Lecture" : "Jouer les coups"}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={goPrev}
                disabled={!parentNode}
                aria-label="Coup précédent"
                className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={lineFinished}
                aria-label="Coup suivant"
                className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {tree.chapters.length > 1 ? (
            <nav aria-label="Chapitres" className="max-h-44 overflow-y-auto rounded-md border border-border">
              <ol>
                {tree.chapters.map((c, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      aria-current={index === state.chapterIndex ? "true" : undefined}
                      onClick={() => goToChapter(index)}
                      className={`flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-[13px] transition-colors ${
                        index === state.chapterIndex ? "bg-accent/15 font-semibold text-foreground" : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      <span className="w-5 shrink-0 text-right font-mono text-[11px] text-foreground-muted">{index + 1}</span>
                      <span className="min-w-0 truncate">{c.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <p className="text-sm font-semibold text-foreground">{chapter.title}</p>
          )}
          {playing ? (
            // Mode jeu : l'arbre complet donnerait la solution — on n'affiche que les coups déjà joués, comme le gamebook Lichess.
            <p className="paper-surface min-h-[3rem] rounded-lg border border-border px-5 py-3 font-mono text-[13px] text-foreground shadow-sm">
              {path.length > 1 ? path.slice(1).map((node) => node.san).join(" ") : "—"}
            </p>
          ) : (
            <MoveTreeViewer root={root} currentId={currentNode.id} onSelect={select} />
          )}
          {coachMessage && <CourseCoachBubble message={coachMessage} />}
          <CoachFeedbackPanel feedback={feedback} chapterTitle={chapter.title} prompt={prompt} hideEngine={playing} />
        </div>
      </div>
    </div>
  );
}

/** Libellé du bouton d'indice : « Indice 2/3 » tant qu'il reste des indices textuels, puis « Montrer le coup ». */
function hintButtonLabel(node: ChessMoveNode, hintLevel: number): string {
  if (hintLevel < node.hints.length) return `Indice ${hintLevel + 1}/${node.hints.length}`;
  return node.hints.length > 0 ? "Montrer le coup" : "Indice";
}
