import { Chess } from "chess.js";
import { parseMoveTree, splitCoachTip, type ChessMoveNode } from "@/core/chess/move-tree";
import { COURSE_LESSONS, type CourseLesson, type CourseStep } from "./course-lesson";
import { COURSE_TREES, type CourseChapterTree, type CourseTree } from "./course-tree";

/**
 * UN SEUL FORMAT DE COURS — cahier des charges du 2026-10-09 : « le format
 * linéaire, séquentiel ou plat est officiellement banni ». Tous les cours de
 * l'Académie sont désormais servis comme un `CourseTree` et lus par
 * `CourseTreeViewer`, quelle que soit leur origine :
 *
 *  1. `COURSE_TREES` (`course-tree.ts`) — les arbres RAV complets, variantes
 *     réelles comprises (modules 21-25 de Jesper Hall) : servis tels quels.
 *  2. `COURSE_LESSONS` (`course-lesson.ts`) — convertis par
 *     `courseLessonToTree` : chaque `CourseStep` devient un chapitre dont la
 *     racine est SA position réelle (`fen`), et la ligne principale SES coups
 *     réels (`moveSan`), rejoués et validés par `chess.js` via `parseMoveTree`.
 *  3. Les thèmes sans cours rédigé — `puzzlesToCourseTree` : chaque chapitre
 *     est un vrai puzzle importé du thème (base Lichess CC0 ou partie de
 *     maître), ligne principale = sa solution vérifiée.
 *
 * Ce que la conversion NE fait PAS, volontairement : inventer des variantes.
 * Les sources des familles 2 et 3 ne publient qu'une ligne par position (voir
 * le docstring de `course-tree.ts`) — l'arbre a donc une seule branche par
 * chapitre, mais il est lu, navigué et annoté exactement comme un arbre RAV.
 * Le jour où une source fournit de vraies variantes pour un de ces thèmes, on
 * l'ajoute à `COURSE_TREES`, qui reste prioritaire.
 */

/** Position de départ + coups SAN → arbre linéaire validé (lève sur un coup illégal, jamais un chapitre corrompu servi en silence). */
function linearTree(fen: string, sanMoves: readonly string[]): ChessMoveNode {
  // `parseMoveTree` tokenise un PGN : les SAN du catalogue n'ont ni espace ni
  // accolade, les joindre par des espaces suffit — aucun numéro de coup n'est
  // nécessaire, le parseur les ignore de toute façon.
  return parseMoveTree(sanMoves.join(" "), fen);
}

function stepToChapter(step: CourseStep): CourseChapterTree {
  const root = linearTree(step.fen, step.moveSan ?? []);
  const { comment, tip } = splitCoachTip(step.text.trim());
  root.comment = comment;
  root.tip = tip;
  root.arrows = step.arrows ?? [];
  root.highlights = step.highlights ?? [];
  return { title: step.title, root };
}

/** Un `CourseLesson` à N chapitres → un `CourseTree` à N chapitres, un pour un, dans le même ordre. */
export function courseLessonToTree(lesson: CourseLesson): CourseTree {
  const [first, ...rest] = lesson.steps;
  return { chapters: [stepToChapter(first), ...rest.map(stepToChapter)] };
}

/** Le strict nécessaire d'un exercice pour en faire un chapitre — sous-ensemble de `ThemePuzzle` (`server/queries/curriculum.ts`), que `core/` ne peut pas importer. */
export interface CourseExamplePuzzle {
  fen: string;
  solutionSan: readonly string[];
  sourceRef: string | null;
}

function sideToMoveLabel(fen: string): string {
  return new Chess(fen).turn() === "w" ? "Blancs" : "Noirs";
}

/**
 * Exercices réels d'un thème → cours en arbre, un chapitre par exercice. La
 * racine porte la consigne (camp au trait) et la provenance ; le dernier coup
 * de la solution porte la conclusion. `null` si aucun exercice n'est fourni —
 * jamais un cours vide.
 */
export function puzzlesToCourseTree(puzzles: readonly CourseExamplePuzzle[], themeTitle: string): CourseTree | null {
  const chapters = puzzles.map((puzzle, index): CourseChapterTree => {
    const root = linearTree(puzzle.fen, puzzle.solutionSan);
    const source = puzzle.sourceRef ? ` Position réelle — ${puzzle.sourceRef}.` : "";
    root.comment = `Trait aux ${sideToMoveLabel(puzzle.fen)} : trouve la suite qui illustre « ${themeTitle} ».${source}`;
    let last = root;
    while (last.children.length > 0) last = last.children[0];
    if (last !== root) last.comment = "Fin de la suite : rejoue-la de mémoire avec le mode « Jouer les coups ».";
    return { title: `Exemple ${index + 1}`, root };
  });
  if (chapters.length === 0) return null;
  const [first, ...rest] = chapters;
  return { chapters: [first, ...rest] };
}

const convertedLessons = new Map<string, CourseTree>();

/**
 * Le cours RÉDIGÉ d'un thème, au format arbre — arbre RAV natif d'abord,
 * sinon leçon convertie (mémoïsée : la conversion rejoue chaque coup avec
 * chess.js, inutile de la refaire à chaque rendu). `null` pour un thème sans
 * cours rédigé : l'appelant construit alors le cours depuis les exercices
 * (`puzzlesToCourseTree`).
 */
export function resolveAuthoredCourseTree(themeId: string): CourseTree | null {
  const native = COURSE_TREES[themeId];
  if (native) return native;
  const lesson = COURSE_LESSONS[themeId];
  if (!lesson) return null;
  let converted = convertedLessons.get(themeId);
  if (!converted) {
    converted = courseLessonToTree(lesson);
    convertedLessons.set(themeId, converted);
  }
  return converted;
}
