"use client";

/**
 * Orchestrateur de l'onglet « Apprendre » — dashboard de campagne à TROIS
 * états, même patron à niveaux que `openings/pieges-screen.tsx` (module →
 * thèmes → résolution) :
 *
 *  - `modules`  (NIVEAU 1) : grille de `ModuleCard`, une par catégorie du
 *    catalogue, anneau de progression "X/Y thèmes maîtrisés".
 *  - `themes`   (NIVEAU 2) : au clic sur un module, `CourseCurriculum` —
 *    l'accordéon des 3 paliers de compétence (Bronze/Argent/Or = `theme.level`)
 *    de cette catégorie, cahier des charges du 2026-09-09 : « toujours plier
 *    les 3 niveaux en 3 bulles », y compris pour les petits modules à un seul
 *    palier peuplé (ex. `endgame_mastery`) — un seul composant pour toutes
 *    les catégories plutôt qu'un choix au cas par cas. Remplace l'ancienne
 *    frise plate `ThemePath` (toujours disponible dans ce dossier si besoin
 *    futur, mais plus référencée ici).
 *  - `lesson`   : Page de Cours (`ThemeLesson`, audit UX du 2026-09-02) —
 *    AU CLIC SUR UN THÈME, on n'accède plus jamais directement à l'échiquier :
 *    un cours (Objectif + Idées clés + diagramme, `resolveLessonContent`)
 *    s'affiche d'abord, son bouton « Passer aux exercices ➔ » débloquant
 *    ensuite `session`. Retour arrière ramène à `themes`, jamais directement
 *    à `session` (revoir le cours reste possible en resélectionnant le thème).
 *  - `session`  : résolution effective (`ThemeSession`, le `PuzzleBoard`
 *    partagé) — accès à l'échiquier face au premier exercice actif, sans
 *    grille de pastilles intermédiaire (voir l'ex-`ThemePuzzleGrid`,
 *    supprimée : une « liste de carrés » entre le cours et le plateau
 *    n'apportait rien que `ThemeSession` n'affiche déjà via sa `ProgressBar`).
 *    Sortie de session ramène à `themes` du MÊME module (pas à l'accueil),
 *    pour que la frise ET le compteur "X/Y thèmes maîtrisés" de son en-tête
 *    reflètent aussitôt la réussite qui vient d'avoir lieu.
 *
 * Navigation entièrement côté client, comme `PiegesScreen` : aucune route
 * dédiée par niveau, un aller-retour vers `/apprendre` repart toujours du
 * NIVEAU 1.
 */
import { useState } from "react";
import { getCurriculumOverview } from "@/server/actions/curriculum";
import type { CurriculumCategoryOverview, CurriculumThemeOverview } from "@/server/queries/curriculum";
import { CourseCurriculum } from "./course-curriculum";
import { ModuleCard } from "./module-card";
import { moduleIcon } from "./module-icon";
import { ThemeLesson } from "./theme-lesson";
import { ThemeReviewSession } from "./theme-review-session";
import { ThemeSession } from "./theme-session";

export type LearnView =
  | { kind: "modules" }
  | { kind: "themes"; categoryId: string }
  | { kind: "lesson"; categoryId: string; themeId: string }
  | { kind: "session"; categoryId: string; themeId: string }
  | { kind: "review"; categoryId: string; themeId: string };

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
      <ThemeSession
        themeId={view.themeId}
        description={found?.theme.description ?? null}
        onExit={() => refreshAndGoTo({ kind: "themes", categoryId: view.categoryId })}
        onReview={() => setView({ kind: "review", categoryId: view.categoryId, themeId: view.themeId })}
      />
    );
  }

  if (view.kind === "review") {
    const found = findTheme(categories, view.categoryId, view.themeId);
    return (
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
    );
  }

  if (view.kind === "lesson") {
    const found = findTheme(categories, view.categoryId, view.themeId);
    if (!found) {
      return (
        <div className="space-y-4">
          <BackButton onClick={() => setView({ kind: "modules" })}>← Retour à l&apos;académie</BackButton>
          <p className="text-sm text-foreground-muted">Thème introuvable.</p>
        </div>
      );
    }
    return (
      <ThemeLesson
        // `key` force un remontage complet à chaque changement de thème (le
        // nœud `view.kind === "lesson"` lui-même ne change pas d'un thème à
        // l'autre) — réinitialise proprement tout l'état local dérivé du
        // puzzle affiché (`ThemeLesson`/`MotifIntroBoard`) sans passer par un
        // `setState` en tête d'effet (voir leurs docstrings).
        key={found.theme.id}
        theme={found.theme}
        category={found.category}
        onStart={() => setView({ kind: "session", categoryId: view.categoryId, themeId: view.themeId })}
        onExit={() => setView({ kind: "themes", categoryId: view.categoryId })}
      />
    );
  }

  if (view.kind === "themes") {
    const category = categories.find((c) => c.id === view.categoryId);
    if (!category) {
      return (
        <div className="space-y-4">
          <BackButton onClick={() => setView({ kind: "modules" })}>← Retour à l&apos;académie</BackButton>
          <p className="text-sm text-foreground-muted">Module introuvable.</p>
        </div>
      );
    }
    const masteredCount = category.themes.filter((t) => t.completedCount >= t.totalPuzzles && t.totalPuzzles > 0).length;
    return (
      <div className="space-y-6">
        <div>
          <BackButton onClick={() => setView({ kind: "modules" })}>← Retour à l&apos;académie</BackButton>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">
            {moduleIcon(category.id)} {category.label}
            {category.author && <span className="text-foreground-muted"> — {category.author}</span>}
          </h1>
          <p className="mt-1 max-w-prose text-sm text-foreground-muted">{category.description}</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {masteredCount} / {category.themes.length} thème{category.themes.length > 1 ? "s" : ""} maîtrisé
            {masteredCount > 1 ? "s" : ""}
          </p>
        </div>
        <CourseCurriculum
          themes={category.themes}
          onSelectTheme={(themeId) => setView({ kind: "lesson", categoryId: category.id, themeId })}
          onReviewTheme={(themeId) => setView({ kind: "review", categoryId: category.id, themeId })}
        />
      </div>
    );
  }

  const totalThemes = categories.reduce((sum, category) => sum + category.themes.length, 0);
  const masteredThemes = categories.reduce(
    (sum, category) => sum + category.themes.filter((t) => t.completedCount >= t.totalPuzzles).length,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Apprendre</h1>
        <p className="mt-2 max-w-prose text-sm text-foreground-muted">
          L&apos;académie d&apos;échecs : {masteredThemes} / {totalThemes} thèmes maîtrisés, répartis en {categories.length}{" "}
          modules — du motif de base à la position de tournoi. Une progression linéaire, sans répétition espacée :
          enchaîne les exercices d&apos;un thème dans l&apos;ordre, à ton rythme.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <ModuleCard key={category.id} category={category} onSelect={() => setView({ kind: "themes", categoryId: category.id })} />
        ))}
      </div>
    </div>
  );
}
