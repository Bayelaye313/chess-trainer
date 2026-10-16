/**
 * Carte de module — NIVEAU 1 du dashboard de campagne (voir `learn-screen.tsx`).
 * Une grande carte cliquable par catégorie du catalogue, avec anneau de
 * progression (thèmes maîtrisés / total) et pictogramme décoratif
 * (`module-icon.ts`) — même esprit que la grille de dossiers de
 * `openings/pieges-screen.tsx` (NIVEAU 1), adapté au vocabulaire de
 * l'académie (thèmes maîtrisés plutôt que puzzles résolus).
 */
import type { CurriculumCategoryOverview } from "@/server/queries/curriculum";
import { moduleIcon } from "./module-icon";
import { ProgressRing } from "./progress-ring";

export function ModuleCard({ category, onSelect }: { category: CurriculumCategoryOverview; onSelect: () => void }) {
  const totalThemes = category.themes.length;
  const masteredCount = category.themes.filter((theme) => theme.completedCount >= theme.totalPuzzles).length;
  const percent = totalThemes > 0 ? Math.round((masteredCount / totalThemes) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col gap-4 rounded-xl border border-border bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-4xl" aria-hidden="true">
          {moduleIcon(category.id)}
        </span>
        <ProgressRing percent={percent} size={56} />
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold text-foreground">{category.label}</h2>
          {category.author && <span className="text-xs text-foreground-muted">— {category.author}</span>}
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs text-foreground-muted">{category.description}</p>
      </div>

      <p className="text-sm font-medium text-foreground">
        {masteredCount} / {totalThemes} thème{totalThemes > 1 ? "s" : ""} maîtrisé{masteredCount > 1 ? "s" : ""}
      </p>
    </button>
  );
}
