/**
 * Une catégorie du catalogue = un accordéon (`<details>` natif — pas de
 * dépendance supplémentaire pour ce seul besoin, même parti pris que
 * `components/ui/nav.tsx` pour les transitions). Ouverte par défaut : avec 5
 * catégories seulement, tout replier par défaut cacherait le contenu
 * principal de l'écran dès l'arrivée.
 */
import type { CurriculumCategoryOverview } from "@/server/queries/curriculum";
import { ThemeCard } from "./theme-card";

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-foreground-muted transition-transform duration-200 group-open:rotate-180"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CategorySection({
  category,
  onSelectTheme,
}: {
  category: CurriculumCategoryOverview;
  onSelectTheme: (themeId: string) => void;
}) {
  const masteredCount = category.themes.filter((theme) => theme.completedCount >= theme.totalPuzzles).length;

  return (
    <details open className="group rounded-lg border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-base font-semibold text-foreground">{category.label}</h2>
          {category.author && <span className="text-xs text-foreground-muted">— {category.author}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-foreground-muted">
            {masteredCount}/{category.themes.length} thème{category.themes.length > 1 ? "s" : ""} maîtrisé
            {masteredCount > 1 ? "s" : ""}
          </span>
          <ChevronIcon />
        </div>
      </summary>

      <div className="border-t border-border px-5 pb-5 pt-4">
        <p className="mb-4 text-sm text-foreground-muted">{category.description}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {category.themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onSelect={() => onSelectTheme(theme.id)} />
          ))}
        </div>
      </div>
    </details>
  );
}
