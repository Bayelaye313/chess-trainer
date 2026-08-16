/**
 * Sous-carte d'un thème, à l'intérieur d'une section de catégorie : titre,
 * niveau, description courte, et la progression exacte (`ProgressBar`).
 * Cliquable dès qu'il reste du contenu à résoudre — un thème déjà terminé
 * reste affiché (trace de la maîtrise acquise) mais ne relance pas de
 * session, comme un deck FSRS à jour dans `DeckDashboard`.
 */
import { CURRICULUM_LEVEL_LABEL, CURRICULUM_LEVEL_TEXT_CLASS, CURRICULUM_LEVEL_BORDER_CLASS } from "@/lib/labels";
import type { CurriculumThemeOverview } from "@/server/queries/curriculum";
import { ProgressBar } from "./progress-bar";

export function ThemeCard({ theme, onSelect }: { theme: CurriculumThemeOverview; onSelect: () => void }) {
  const done = theme.completedCount >= theme.totalPuzzles;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{theme.title}</h3>
        {done && (
          <span className="shrink-0 rounded-full border border-best/30 bg-best/10 px-2 py-0.5 text-[11px] font-medium text-best">
            Maîtrisé
          </span>
        )}
      </div>

      <span
        className={`mt-1.5 inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${CURRICULUM_LEVEL_BORDER_CLASS[theme.level]} ${CURRICULUM_LEVEL_TEXT_CLASS[theme.level]}`}
      >
        {CURRICULUM_LEVEL_LABEL[theme.level]}
      </span>

      <p className="mt-2 line-clamp-2 flex-1 text-xs text-foreground-muted">{theme.description}</p>

      <ProgressBar completed={theme.completedCount} total={theme.totalPuzzles} className="mt-3" />
    </button>
  );
}
