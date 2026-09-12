"use client";

/**
 * Lecteur d'un `CourseTree` (`core/curriculum/course-tree.ts`) — la version
 * arbre-complet façon Lichess Study de `CourseLessonViewer` : navigation
 * LIBRE dans l'arbre (clic sur n'importe quel nœud, y compris une variante
 * jamais jouée dans la vraie partie), pas un défi « devine le coup » à
 * résoudre pli par pli. Réservé aux thèmes qui portent un `COURSE_TREES`
 * (5 au 2026-09-12, clôture du Palier Or) — voir `theme-lesson.tsx`, qui lui
 * donne priorité sur `CourseLessonViewer`/`ThemeDemoBoard` quand présent.
 *
 * État de navigation géré par `useReducer` (jamais un `setState` dans un
 * `useEffect` pour dériver la position affichée — seule exception,
 * classique et conforme : l'abonnement clavier ci-dessous, qui enregistre un
 * ÉCOUTEUR d'évènement, il n'appelle `dispatch` que lorsqu'une vraie touche
 * est pressée). `←`/`→` suivent le CHEMIN courant (parent / premier enfant
 * du nœud courant, donc la continuation de LA VARIANTE affichée, jamais
 * forcément la ligne principale de la partie) — clic direct sur un nœud de
 * `MoveTreeViewer` pour sauter n'importe où ailleurs dans l'arbre,
 * synchronisation bidirectionnelle immédiate avec l'échiquier.
 */
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { Chessboard } from "react-chessboard";
import { findNode, pathTo, type ChessMoveNode } from "@/core/chess/move-tree";
import type { CourseTree } from "@/core/curriculum/course-tree";
import { REVEAL_ARROW_COLOR } from "@/lib/labels";
import { MoveTreeViewer } from "./move-tree-viewer";

const GREEN = "var(--quality-best)";
const RED = "var(--quality-blunder)";

interface NavState {
  chapterIndex: number;
  currentId: string;
}

type NavAction = { type: "select"; id: string } | { type: "chapter"; index: number; rootId: string };

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "select":
      return { ...state, currentId: action.id };
    case "chapter":
      return { chapterIndex: action.index, currentId: action.rootId };
    default:
      return state;
  }
}

export function CourseTreeViewer({ tree, onComplete }: { tree: CourseTree; onComplete?: () => void }) {
  const [state, dispatch] = useReducer(navReducer, { chapterIndex: 0, currentId: tree.chapters[0].root.id });
  const chapter = tree.chapters[state.chapterIndex];
  const root = chapter.root;

  const currentNode = useMemo(() => findNode(root, state.currentId) ?? root, [root, state.currentId]);
  const path = useMemo(() => pathTo(root, currentNode.id), [root, currentNode.id]);
  const parentNode: ChessMoveNode | null = path.length >= 2 ? path[path.length - 2] : null;

  const select = useCallback((id: string) => dispatch({ type: "select", id }), []);
  const goToChapter = useCallback((index: number) => dispatch({ type: "chapter", index, rootId: tree.chapters[index].root.id }), [tree]);

  const goPrev = useCallback(() => {
    if (parentNode) select(parentNode.id);
  }, [parentNode, select]);
  const goNext = useCallback(() => {
    if (currentNode.children.length > 0) select(currentNode.children[0].id);
  }, [currentNode, select]);

  // Abonnement clavier — voir le docstring du fichier : un `useEffect` qui
  // enregistre un écouteur d'évènement est l'usage NORMAL de cette API,
  // distinct d'un `setState` appelé directement dans le corps de l'effet.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  // Dernier chapitre atteint = un seul appel à `onComplete`, même contrat que
  // `CourseLessonViewer`/`ThemeDemoBoard` (voir leur docstring) — ici
  // « atteint » veut dire avoir ouvert le dernier chapitre au moins une fois,
  // jamais avoir parcouru tout son arbre (navigation libre, rien à
  // « terminer » dans un arbre qu'on peut explorer dans n'importe quel ordre).
  useEffect(() => {
    if (state.chapterIndex === tree.chapters.length - 1) onComplete?.();
  }, [state.chapterIndex, tree.chapters.length, onComplete]);

  const boardOrientation = currentNode.fen.split(" ")[1] === "b" ? "black" : "white";

  // Flèches permanentes : annotations du nœud courant (`[%cal]` source, vert/rouge)
  // + suggestion moteur (émeraude, `--engine-arrow-best` — réutilise EXACTEMENT
  // la teinte du double-flux de la Revue de partie, voir `lib/labels.ts`).
  const dataArrows = currentNode.arrows.map((arrow) => ({ startSquare: arrow.from, endSquare: arrow.to, color: arrow.color === "red" ? RED : GREEN }));
  const engineArrow = currentNode.engineSuggestion
    ? [{ startSquare: currentNode.engineSuggestion.uci.slice(0, 2), endSquare: currentNode.engineSuggestion.uci.slice(2, 4), color: REVEAL_ARROW_COLOR }]
    : [];
  const arrows = [...dataArrows, ...engineArrow];

  const squareStyles: Record<string, { backgroundColor: string }> = {};
  for (const highlight of currentNode.highlights) {
    squareStyles[highlight.square] = { backgroundColor: highlight.color === "red" ? "rgba(239, 68, 68, 0.35)" : "rgba(34, 197, 94, 0.35)" };
  }

  function neverDraggable(): boolean {
    return false;
  }

  return (
    <div className="mx-auto w-full max-w-[760px]">
      {tree.chapters.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Chapitres">
          {tree.chapters.map((c, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === state.chapterIndex}
              onClick={() => goToChapter(index)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                index === state.chapterIndex ? "bg-accent text-accent-foreground" : "bg-surface-muted text-foreground-muted hover:text-foreground"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="w-full shrink-0 sm:w-[360px]">
          <Chessboard
            options={{
              id: "course-tree-board",
              position: currentNode.fen,
              boardOrientation,
              canDragPiece: neverDraggable,
              arrows,
              squareStyles,
            }}
          />
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={!parentNode}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Précédent
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentNode.children.length === 0}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{chapter.title}</p>
          {currentNode.comment && <p className="mt-2 text-sm leading-relaxed text-foreground">{currentNode.comment}</p>}
          <div className="mt-2">
            <MoveTreeViewer root={root} currentId={currentNode.id} onSelect={select} />
          </div>
        </div>
      </div>
    </div>
  );
}
