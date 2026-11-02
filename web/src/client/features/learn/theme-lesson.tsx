"use client";

/**
 * Page de Cours — s'intercale TOUJOURS entre la frise de thèmes (`ThemePath`)
 * et la résolution d'exercices (`ThemeSession`), voir `LearnScreen`. Objectif
 * et idées clés (`resolveLessonContent`) en tête, puis le cours lui-même.
 *
 * UN SEUL LECTEUR pour les 205 thèmes — cahier des charges du 2026-10-09 :
 * `CourseTreeViewer`, l'arbre façon Lichess Study. Le cours vient, par ordre
 * de priorité (voir `core/curriculum/course-tree-adapters.ts`) :
 *  1. du cours rédigé du thème (`resolveAuthoredCourseTree` : arbre RAV natif
 *     ou leçon à chapitres convertie) — synchrone, aucun aller-retour serveur ;
 *  2. sinon, de ses premiers exercices réels (`getThemeCourseExamples` →
 *     `puzzlesToCourseTree`), un chapitre par exercice.
 *
 * Le bouton « Passer aux exercices » reste désactivé tant qu'un cours RÉDIGÉ
 * n'a pas été parcouru jusqu'à son dernier chapitre (cahier des charges : « le
 * cours lui demande de jouer... avant de lui donner accès aux puzzles »). Un
 * cours d'exemples ne bloque rien : ses chapitres SONT des exercices du thème.
 */
import { useEffect, useMemo, useState } from "react";
import { puzzlesToCourseTree, resolveAuthoredCourseTree } from "@/core/curriculum/course-tree-adapters";
import { resolveLessonContent } from "@/core/curriculum/lesson-content";
import { getThemeCourseExamples } from "@/server/actions/curriculum";
import type { CurriculumCategoryMeta } from "@/core/curriculum/catalog";
import type { CurriculumThemeOverview, ThemePuzzle } from "@/server/queries/curriculum";
import { CourseTreeViewer } from "./course-tree-viewer";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { categoryLabel, ModuleIcon } from "./module-icon";

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
  const authoredTree = useMemo(() => resolveAuthoredCourseTree(theme.id), [theme.id]);
  const [courseCompleted, setCourseCompleted] = useState<boolean>(authoredTree === null);
  // `theme.totalPuzzles` est le compte RÉEL de `curriculum_puzzles` en base
  // (voir `recalculateAllThemeTotals`, `scripts/seed-academy.ts`) — 0 ici
  // signifie authentiquement 0 exercice vérifié.
  const hasNoAuthenticContent = theme.totalPuzzles === 0;
  // `undefined` = pas encore chargé. `LearnScreen` monte ce composant avec
  // `key={theme.id}` : un changement de thème repart d'un état neuf, jamais
  // besoin de remettre cet état à zéro en tête d'effet.
  const [examples, setExamples] = useState<ThemePuzzle[] | undefined>(undefined);

  useEffect(() => {
    if (authoredTree || hasNoAuthenticContent) return;
    let cancelled = false;
    getThemeCourseExamples(theme.id).then((rows) => {
      if (!cancelled) setExamples(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [theme.id, authoredTree, hasNoAuthenticContent]);

  const exampleTree = useMemo(() => {
    if (!examples) return null;
    try {
      return puzzlesToCourseTree(examples, theme.title);
    } catch (error) {
      // Les exercices sont validés à l'import (`seed-academy.ts`) : une ligne
      // illégale ici signale une base corrompue — on la journalise plutôt que
      // de casser toute la page de cours.
      console.error(`Cours d'exemples illisible pour "${theme.id}"`, error);
      return null;
    }
  }, [examples, theme.id, theme.title]);

  const tree = authoredTree ?? exampleTree;

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <button type="button" onClick={onExit} className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-foreground-muted hover:text-foreground">
            <ArrowLeft aria-hidden="true" className="size-4" />
            {categoryLabel(category.id, category.label)}
          </button>
        <h1 className="font-display text-[22px] leading-tight font-semibold sm:text-[28px]">
          <ModuleIcon category={category.id} /> {theme.title}
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">Lis le cours, puis passe aux exercices.</p>
      </div>

      {/* Rectangle plein-largeur (Objectif + Idées clés) au-dessus, puis l'échiquier en dessous sur sa propre ligne —
          jamais côte à côte : coincé dans une colonne fixe, l'échiquier ne pouvait pas grandir (cahier des charges du
          2026-09-07 : « en rectangle, retour à la ligne, l'échiquier doit prendre plus d'espace »). */}
      

      {tree ? (
        <CourseTreeViewer tree={tree} onComplete={() => setCourseCompleted(true)} />
      ) : (
        !hasNoAuthenticContent && (
          // Réserve la hauteur de l'échiquier pendant le chargement des exemples : pas de saut de page à l'arrivée du cours.
          <div className="mx-auto h-[600px] w-full max-w-[1240px] animate-pulse rounded-lg bg-surface-muted/50" aria-label="Chargement du cours" />
        )
      )}

      {hasNoAuthenticContent ? (
        <EmptyState icon={Clock} title="Exercices à venir" className="mx-auto max-w-prose">
          Aucun exercice n&apos;est encore disponible pour ce thème.
        </EmptyState>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Button variant="primary" onClick={onStart} disabled={!courseCompleted}>
            Passer aux exercices
            <ArrowRight aria-hidden="true" />
          </Button>
          {!courseCompleted && <p className="text-sm text-foreground-muted">Ouvre le dernier chapitre du cours pour débloquer les exercices.</p>}
        </div>
      )}
    </div>
  );
}
