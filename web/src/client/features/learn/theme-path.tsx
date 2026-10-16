/**
 * Frise de progression — NIVEAU 2 du dashboard de campagne : les thèmes
 * d'une catégorie choisie, en chemin vertical connecté par une ligne (façon
 * skill tree), plutôt que la grille de cartes plate de l'ancien
 * `category-section.tsx`/`theme-card.tsx`. Un nœud numéroté par thème, coché
 * une fois maîtrisé, `ProgressBar` sous le titre — cliquable dès qu'il reste
 * du contenu à résoudre, même règle que l'ancien `ThemeCard`.
 */
import { CURRICULUM_LEVEL_LABEL, CURRICULUM_LEVEL_TEXT_CLASS, CURRICULUM_LEVEL_BORDER_CLASS } from "@/lib/labels";
import type { CurriculumThemeOverview } from "@/server/queries/curriculum";
import { ProgressBar } from "./progress-bar";

function ThemeNode({
  theme,
  index,
  isLast,
  onSelect,
}: {
  theme: CurriculumThemeOverview;
  index: number;
  isLast: boolean;
  onSelect: () => void;
}) {
  const done = theme.completedCount >= theme.totalPuzzles && theme.totalPuzzles > 0;
  // Cahier des charges du 2026-09-06 : « ne triche plus pour remplir les
  // jauges » — un thème purgé de tout contenu non-authentique et pas encore
  // réalimenté doit se voir clairement dans la frise, pas seulement une fois
  // ouvert (voir aussi `ThemeLesson`, qui bloque le bouton d'exercices).
  const empty = theme.totalPuzzles === 0;

  return (
    <li className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
            done
              ? "border-best bg-best/10 text-best"
              : "border-accent/40 bg-surface text-foreground-muted"
          }`}
        >
          {done ? "✅" : index + 1}
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />}
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={`mb-6 flex min-w-0 flex-1 flex-col rounded-lg border p-4 text-left transition-colors ${
          empty ? "border-dashed border-border/60 bg-surface/60 hover:border-border" : "border-border bg-surface hover:border-accent/40"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-sm font-semibold ${empty ? "text-foreground-muted" : "text-foreground"}`}>{theme.title}</h3>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${CURRICULUM_LEVEL_BORDER_CLASS[theme.level]} ${CURRICULUM_LEVEL_TEXT_CLASS[theme.level]}`}
          >
            {CURRICULUM_LEVEL_LABEL[theme.level]}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs text-foreground-muted">{theme.description}</p>
        {empty ? (
          <p className="mt-3 text-xs font-medium text-inaccuracy">⚠️ En attente de contenu authentique — pas encore d&apos;exercice.</p>
        ) : (
          <ProgressBar completed={theme.completedCount} total={theme.totalPuzzles} className="mt-3" />
        )}
      </button>
    </li>
  );
}

export function ThemePath({
  themes,
  onSelectTheme,
}: {
  themes: readonly CurriculumThemeOverview[];
  onSelectTheme: (themeId: string) => void;
}) {
  if (themes.length === 0) {
    return <p className="text-sm text-foreground-muted">Aucun thème disponible pour l&apos;instant.</p>;
  }

  return (
    <ul>
      {themes.map((theme, index) => (
        <ThemeNode
          key={theme.id}
          theme={theme}
          index={index}
          isLast={index === themes.length - 1}
          onSelect={() => onSelectTheme(theme.id)}
        />
      ))}
    </ul>
  );
}
