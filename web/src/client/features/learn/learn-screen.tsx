"use client";

/**
 * Orchestrateur de l'onglet « Apprendre » — dashboard de campagne à TROIS
 * états, même patron à niveaux que `openings/pieges-screen.tsx` (module →
 * thèmes → résolution) :
 *
 *  - `modules`  (NIVEAU 1) : `PlaybookLearnScreen` — couloirs Bronze/Argent/
 *    Or et fiches de leçon. Feuille de route Zone 1 (Direct-to-Lesson) : UN
 *    clic sur une fiche ouvre directement l'arène du thème (résolution par
 *    `directViewForTheme`), la sous-liste intermédiaire du module n'est plus
 *    jamais affichée depuis l'accueil.
 *  - `themes`   (NIVEAU 2) : `CourseCurriculum` — l'accordéon des 3 paliers de
 *    compétence (Bronze/Argent/Or = `theme.level`) de cette catégorie, cahier
 *    des charges du 2026-09-09 : « toujours plier les 3 niveaux en 3 bulles ».
 *    Reste accessible par deep-link `?categoryId=` (parcours d'un module entier)
 *    — plus jamais ouvert comme étape obligatoire entre une fiche et son
 *    arène. Le clic sur un thème partage le MÊME routage direct.
 *  - `lesson`   : Page de Cours (`ThemeLesson`) — TOUT thème a désormais
 *    un cours en arbre façon Lichess Study (`CourseTreeViewer`, cahier des
 *    charges du 2026-10-09 : rédigé, ou construit depuis ses exercices réels).
 *    Son bouton « Passer aux exercices ➔ » mène ensuite à `session`.
 *  - `session`  : résolution effective (`ThemeSession` + `AcademyPuzzleArena`).
 *    Sortie de session ramène à `themes` du MÊME module (pas à l'accueil),
 *    pour que le compteur « X/Y thèmes maîtrisés » reflète aussitôt la
 *    réussite.
 *  - `review`   : rejeu libre d'une vague maîtrisée (`ThemeReviewSession`).
 *
 * Navigation entièrement côté client, comme `PiegesScreen` : aucune route
 * dédiée par niveau, un aller-retour vers `/apprendre` repart toujours du
 * NIVEAU 1.
 */
import { useState } from "react";
import { EsportCanvas } from "@/components/ui/esport-page";
import { getCurriculumOverview } from "@/server/actions/curriculum";
import type { CurriculumCategoryOverview, CurriculumThemeOverview } from "@/server/queries/curriculum";
import { CourseCurriculum } from "./course-curriculum";
import { moduleIcon } from "./module-icon";
import { ThemeLesson } from "./theme-lesson";
import { ThemeReviewSession } from "./theme-review-session";
import { ThemeSession } from "./theme-session";
import { PlaybookLearnScreen } from "./playbook-learn-screen";

export type LearnView =
  | { kind: "modules" }
  | { kind: "themes"; categoryId: string }
  | { kind: "lesson"; categoryId: string; themeId: string }
  | { kind: "session"; categoryId: string; themeId: string }
  | { kind: "review"; categoryId: string; themeId: string };

/**
 * Routage Direct-to-Lesson (feuille de route Zone 1) : un clic sur un thème
 * ouvre son cours (`lesson`), jamais une sous-liste descriptive — un seul
 * point de vérité partagé par la fiche Playbook et par l'accordéon
 * `CourseCurriculum`.
 */
function directViewForTheme(categoryId: string, themeId: string): LearnView {
  return { kind: "lesson", categoryId, themeId };
}

function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
      {children}
    </button>
  );
}

function findTheme(
  categories: readonly CurriculumCategoryOverview[],
  categoryId: string,
  themeId: string,
): { category: CurriculumCategoryOverview; theme: CurriculumThemeOverview } | null {
  const category = categories.find((c) => c.id === categoryId);
  const theme = category?.themes.find((t) => t.id === themeId);
  return category && theme ? { category, theme } : null;
}

export function LearnScreen({
  initialCategories,
  initialView,
}: {
  initialCategories: CurriculumCategoryOverview[];
  /** Deep-link depuis un autre écran (ex. « 🎯 S'exercer sur… » du Coach, `?themeId=`/`?categoryId=` — voir `app/apprendre/page.tsx`) — `undefined` retombe sur le comportement historique, la grille des modules. */
  initialView?: LearnView;
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [view, setView] = useState<LearnView>(initialView ?? { kind: "modules" });

  async function refreshAndGoTo(next: LearnView) {
    setCategories(await getCurriculumOverview());
    setView(next);
  }

  if (view.kind === "session") {
    const found = findTheme(categories, view.categoryId, view.themeId);
    return (
      <EsportCanvas detail>
      <ThemeSession
        themeId={view.themeId}
        description={found?.theme.description ?? null}
        onExit={() => refreshAndGoTo({ kind: "themes", categoryId: view.categoryId })}
        onReview={() => setView({ kind: "review", categoryId: view.categoryId, themeId: view.themeId })}
      />
      </EsportCanvas>
    );
  }

  if (view.kind === "review") {
    const found = findTheme(categories, view.categoryId, view.themeId);
    return (
      <EsportCanvas detail>
      <ThemeReviewSession
        // `key` force un remontage complet à chaque entrée en révision — même
        // schéma que `ThemeLesson` : repartir d'un état local propre
        // (`reviewIndex`/`attempt` à 0) plutôt que de porter un état résiduel
        // d'une précédente session de révision sur un AUTRE thème.
        key={view.themeId}
        themeId={view.themeId}
        description={found?.theme.description ?? null}
        onExit={() => setView({ kind: "themes", categoryId: view.categoryId })}
      />
      </EsportCanvas>
    );
  }

  if (view.kind === "lesson") {
    const found = findTheme(categories, view.categoryId, view.themeId);
    if (!found) {
      return (
        <EsportCanvas detail>
        <div className="space-y-4">
          <BackButton onClick={() => setView({ kind: "modules" })}>← Retour à l&apos;académie</BackButton>
          <p className="text-sm text-foreground-muted">Thème introuvable.</p>
        </div>
        </EsportCanvas>
      );
    }
    return (
      <EsportCanvas detail>
      <ThemeLesson
        // `key` force un remontage complet à chaque changement de thème (le
        // nœud `view.kind === "lesson"` lui-même ne change pas d'un thème à
        // l'autre) — réinitialise proprement tout l'état local dérivé du
        // cours affiché (`ThemeLesson`/`CourseTreeViewer`) sans passer par un
        // `setState` en tête d'effet (voir leurs docstrings).
        key={found.theme.id}
        theme={found.theme}
        category={found.category}
        onStart={() => setView({ kind: "session", categoryId: view.categoryId, themeId: view.themeId })}
        onExit={() => setView({ kind: "themes", categoryId: view.categoryId })}
      />
      </EsportCanvas>
    );
  }

  if (view.kind === "themes") {
    const category = categories.find((c) => c.id === view.categoryId);
    if (!category) {
      return (
        <EsportCanvas detail>
        <div className="space-y-4">
          <BackButton onClick={() => setView({ kind: "modules" })}>← Retour à l&apos;académie</BackButton>
          <p className="text-sm text-foreground-muted">Module introuvable.</p>
        </div>
        </EsportCanvas>
      );
    }
    // Même purge « 0 exercice » que `CourseCurriculum` (feuille de route
    // Zone 1) : le compteur du header et l'accordéon défilent sur la MÊME
    // liste visible — jamais un décompte qui inclut des thèmes masqués.
    const visibleThemes = category.themes.filter((theme) => theme.totalPuzzles > 0);
    const masteredCount = visibleThemes.filter((t) => t.completedCount >= t.totalPuzzles).length;
    return (
      <EsportCanvas detail>
      <div className="space-y-6">
        <div>
          <BackButton onClick={() => setView({ kind: "modules" })}>← Retour à l&apos;académie</BackButton>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">
            {moduleIcon(category.id)} {category.label}
            {category.author && <span className="text-foreground-muted"> — {category.author}</span>}
          </h1>
          <p className="mt-1 max-w-prose text-sm text-foreground-muted">{category.description}</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {masteredCount} / {visibleThemes.length} thème{visibleThemes.length > 1 ? "s" : ""} maîtrisé
            {masteredCount > 1 ? "s" : ""}
          </p>
        </div>
        <CourseCurriculum
          themes={visibleThemes}
          onSelectTheme={(themeId) => setView(directViewForTheme(category.id, themeId))}
          onReviewTheme={(themeId) => setView({ kind: "review", categoryId: category.id, themeId })}
        />
      </div>
      </EsportCanvas>
    );
  }

  return (
    <PlaybookLearnScreen
      categories={categories}
      onOpenTheme={(categoryId, themeId) => setView(directViewForTheme(categoryId, themeId))}
    />
  );
}
