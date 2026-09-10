"use client";

/**
 * Page de Cours — s'intercale désormais TOUJOURS entre la frise de thèmes
 * (`ThemePath`) et la résolution d'exercices (`ThemeSession`), voir
 * `LearnScreen` (`LearnView.kind === "lesson"`). Audit UX du 2026-09-02 :
 * l'utilisateur ne doit plus tomber directement sur l'échiquier sans qu'on
 * lui ait d'abord expliqué le concept — particulièrement criant pour les
 * thèmes stratégiques (Positional Mastery, structures de pions en finale).
 *
 * Contenu résolu par `resolveLessonContent` (`core/curriculum/lesson-content.ts`)
 * — une rédaction curatée pour les thèmes stratégiques, un gabarit généré
 * ailleurs, jamais de page vide. Le diagramme d'illustration réutilise le FEN
 * du premier exercice du thème (`getThemePuzzleSession`, même Server Action
 * que `ThemeSession`) — position de départ standard en repli tant qu'il
 * charge ou si le thème n'a encore aucun exercice importé.
 *
 * Ce diagramme est désormais un mini-tutoriel INTERACTIF façon Lichess
 * (`MotifIntroBoard`, cahier des charges du 2026-09-03) dès que la solution du
 * puzzle permet d'en dériver un (`buildMotifIntro`) — sinon repli sur le
 * diagramme statique historique (position seule, jamais de flèche inventée).
 *
 * Priorité absolue à `COURSE_LESSONS` (`core/curriculum/course-lesson.ts`,
 * cahier des charges du 2026-09-07) quand le thème en a un : un vrai COURS À
 * PLUSIEURS CHAPITRES (`CourseLessonViewer`) — chaque chapitre sa position
 * réelle et son commentaire traduit, on tourne les pages avec Précédent/
 * Suivant. Réservé aux sujets dont la source a assez de matière (ex. « Le
 * pion arriéré », 17 chapitres réels de l'étude Lichess « Pawn Structure » de
 * Yushan) pour être racontés ainsi plutôt qu'en 2-3 étapes. Depuis le cahier
 * des charges du 2026-09-09, chaque chapitre qui porte des coups clés
 * (`moveSan`) devient un mini défi « devine le coup » interactif — voir le
 * docstring de `CourseLessonViewer`.
 *
 * À défaut, priorité à `THEME_DEMOS` (`core/curriculum/theme-demo.ts`, cahier
 * des charges du 2026-09-06) quand le thème en a une : une VRAIE séquence de
 * démonstration curatée à la main (plusieurs positions rejouées, pas une
 * seule dérivée du premier puzzle importé) pour les thèmes stratégiques les
 * plus fins — avant-poste, case faible, structures Carlsbad/Maroczy — là où
 * un simple coup-et-sa-menace ne suffit pas à montrer la manœuvre.
 *
 * Cette démonstration est INTERACTIVE (`ThemeDemoBoard`) : le joueur doit lui-
 * même jouer les 2-3 coups d'illustration sur l'échiquier de cours, jamais se
 * contenter de regarder une boucle automatique. Le bouton « Passer aux
 * exercices » reste désactivé tant que le cours à chapitres ou la
 * démonstration n'est pas terminé(e) — cahier des charges explicite : « le
 * cours lui demande de jouer... avant de lui donner accès aux puzzles ». Sans
 * cours à chapitres ni démonstration curatée pour ce thème, le bouton reste
 * toujours actif (rien à valider avant).
 */
import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { COURSE_LESSONS } from "@/core/curriculum/course-lesson";
import { resolveLessonContent } from "@/core/curriculum/lesson-content";
import { buildMotifIntro } from "@/core/curriculum/motif-intro";
import { THEME_DEMOS } from "@/core/curriculum/theme-demo";
import { getThemePuzzleSession } from "@/server/actions/curriculum";
import type { CurriculumCategoryMeta } from "@/core/curriculum/catalog";
import type { CurriculumThemeOverview, ThemePuzzle } from "@/server/queries/curriculum";
import { CourseLessonViewer } from "./course-lesson-viewer";
import { MotifIntroBoard } from "./motif-intro-board";
import { moduleIcon } from "./module-icon";
import { ThemeDemoBoard } from "./theme-demo-board";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Le diagramme statique (repli) n'est jamais interactif — pur repère visuel, comme le mini-échiquier du Rapport (`HallOfFame`). */
function neverDraggable(): boolean {
  return false;
}

export function ThemeLesson({
  theme,
  category,
  onStart,
  onExit,
}: {
  theme: CurriculumThemeOverview;
  category: CurriculumCategoryMeta;
  onStart: () => void;
  onExit: () => void;
}) {
  const lesson = resolveLessonContent(theme, category);
  const courseLesson = COURSE_LESSONS[theme.id];
  // `CourseLesson` (cours à plusieurs chapitres) prend le pas sur `ThemeDemo`
  // (démonstration fixe à 2-3 étapes) quand un thème porte les deux — aucun
  // cas actuel, voir le docstring de `course-lesson.ts`.
  const demo = courseLesson ? undefined : THEME_DEMOS[theme.id];
  // Sans démonstration curatée ni cours à chapitres, rien à valider — le
  // bouton reste actif dès le départ (même comportement qu'avant ce cahier
  // des charges).
  const [demoCompleted, setDemoCompleted] = useState<boolean>(!demo && !courseLesson);
  // Cahier des charges du 2026-09-06 : « si ton filtre local ne trouve pas de
  // puzzle 100% fidèle au thème, laisse-le à 0 puzzle, bloque l'accès, et
  // affiche une alerte claire — ne triche plus pour remplir les jauges. »
  // `theme.totalPuzzles` est désormais le compte RÉEL de `curriculum_puzzles`
  // en base pour ce thème (voir `recalculateAllThemeTotals`,
  // `scripts/seed-academy.ts`), jamais un objectif théorique — 0 ici signifie
  // authentiquement 0 exercice vérifié, pas un défaut d'affichage.
  const hasNoAuthenticContent = theme.totalPuzzles === 0;
  const [diagramPuzzle, setDiagramPuzzle] = useState<ThemePuzzle | null>(null);

  // Jamais besoin de remettre `diagramPuzzle` à `null` en tête d'effet ici :
  // `LearnScreen` monte ce composant avec `key={theme.id}`, donc un
  // changement de thème remonte `ThemeLesson` à neuf plutôt que de réutiliser
  // cet état — voir le commentaire sur `<ThemeLesson key={...}>`.
  useEffect(() => {
    let cancelled = false;
    getThemePuzzleSession(theme.id).then((session) => {
      if (!cancelled && session?.puzzle) setDiagramPuzzle(session.puzzle);
    });
    return () => {
      cancelled = true;
    };
  }, [theme.id]);

  // `null` tant que le puzzle n'a pas encore chargé, hors théorie (aucune
  // solution utilisable), ou structurellement injouable (voir
  // `buildMotifIntro`) — le repli reste alors le diagramme statique.
  const motifIntro = useMemo(() => {
    if (!diagramPuzzle || diagramPuzzle.solution.length === 0 || diagramPuzzle.solutionSan.length === 0) return null;
    return buildMotifIntro(diagramPuzzle.fen, diagramPuzzle.solution[0], diagramPuzzle.solutionSan[0]);
  }, [diagramPuzzle]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">
            {moduleIcon(category.id)} {theme.title}
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">Module « {category.label} » — cours avant exercices.</p>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour aux thèmes
        </button>
      </div>

      {/* Rectangle plein-largeur (Objectif + Idées clés) au-dessus, puis l'échiquier en dessous sur sa propre ligne —
          jamais côte à côte : coincé dans une colonne fixe, l'échiquier ne pouvait pas grandir (cahier des charges du
          2026-09-07 : « en rectangle, retour à la ligne, l'échiquier doit prendre plus d'espace »). */}
      <div className="space-y-5 rounded-lg border border-border bg-surface p-5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">🎯 Objectif</h2>
          <p className="mt-2 text-sm text-foreground">{lesson.objective}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">💡 Idées clés</h2>
          <ul className="mt-2 space-y-2">
            {lesson.keyIdeas.map((idea, index) => (
              <li key={index} className="flex gap-2 text-sm text-foreground">
                <span aria-hidden="true" className="mt-0.5 shrink-0 text-accent">
                  ●
                </span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`mx-auto w-full ${courseLesson ? "max-w-[760px]" : "max-w-[420px]"}`}>
        {courseLesson ? (
          <CourseLessonViewer lesson={courseLesson} onComplete={() => setDemoCompleted(true)} />
        ) : demo ? (
          <ThemeDemoBoard demo={demo} onComplete={() => setDemoCompleted(true)} />
        ) : motifIntro ? (
          <MotifIntroBoard intro={motifIntro} />
        ) : (
          <>
            <Chessboard
              options={{
                id: `lesson-diagram-${theme.id}`,
                position: diagramPuzzle?.fen ?? START_FEN,
                canDragPiece: neverDraggable,
              }}
            />
            <p className="mt-2 text-center text-xs text-foreground-muted">Diagramme d&apos;illustration</p>
          </>
        )}
      </div>

      {hasNoAuthenticContent ? (
        <div className="mx-auto max-w-prose rounded-lg border border-inaccuracy/30 bg-inaccuracy/10 px-4 py-3 text-center text-sm text-inaccuracy">
          ⚠️ En attente du fichier PGN authentique de l&apos;utilisateur — aucun exercice fidèle à ce thème n&apos;a encore été
          importé. Dépose un fichier réel dans <code className="font-mono text-xs">data/import/academy/</code> puis relance
          <code className="ml-1 font-mono text-xs">npm run db:seed-academy</code> pour débloquer les exercices.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onStart}
            disabled={!demoCompleted}
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Passer aux exercices ➔
          </button>
          {!demoCompleted && (
            <p className="text-xs text-foreground-muted">Termine la démonstration ci-dessus pour débloquer les exercices.</p>
          )}
        </div>
      )}
    </div>
  );
}
