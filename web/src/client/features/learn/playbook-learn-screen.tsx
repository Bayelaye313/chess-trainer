"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CircleCheck, CircleDot } from "lucide-react";
import { QUALITY_LABEL, QUALITY_SYMBOL, QUALITY_TEXT_CLASS } from "@/lib/labels";
import type { CurriculumCategoryOverview } from "@/server/queries/curriculum";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { SectionSwitcher, TRAINING_SECTIONS } from "@/components/ui/section-switcher";
import { takeBudget } from "@/components/ui/take-budget";
import { categoryLabel, ModuleIcon } from "./module-icon";
import { buildPlaybookModel, formatThemeProgress, LEVEL_LABEL, type PlaybookCategorySection, type PlaybookThemeRow } from "./playbook-model";

const LEGEND = ["brilliant", "best", "inaccuracy", "blunder"] as const;

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <span role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
      <span className="block h-full rounded-full bg-best" style={{ width: `${percent}%` }} />
    </span>
  );
}

function ThemeRow({ theme, onOpen }: { theme: PlaybookThemeRow; onOpen: (theme: PlaybookThemeRow) => void }) {
  const state =
    theme.state === "completed" ? { icon: CircleCheck, label: "Maîtrisé", className: "text-success" } : theme.state === "active" ? { icon: CircleDot, label: "À reprendre", className: "text-accent" } : null;
  const Icon = state?.icon;
  return (
    <li>
      <button type="button" onClick={() => onOpen(theme)} className="flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-muted">
        <span className="w-8 shrink-0 font-mono text-xs text-foreground-subtle">{theme.moduleNumber}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{theme.title}</span>
        {state && Icon && (
          <span className={`hidden shrink-0 items-center gap-1 text-xs sm:inline-flex ${state.className}`}>
            <Icon aria-hidden="true" className="size-3.5" />
            {state.label}
          </span>
        )}
        <span className="w-16 shrink-0 text-right font-mono text-xs text-foreground-muted">{formatThemeProgress(theme)}</span>
      </button>
    </li>
  );
}

/** Thèmes visibles par catégorie avant « Voir tout ». */
const VISIBLE_THEMES = 10;

function CategorySection({ section, open, onOpen }: { section: PlaybookCategorySection; open: boolean; onOpen: (theme: PlaybookThemeRow) => void }) {
  const [showAll, setShowAll] = useState(false);
  const visible = takeBudget(section.levels, (group) => group.themes, showAll ? Number.POSITIVE_INFINITY : VISIBLE_THEMES);
  const hidden = Math.max(0, section.themes.length - VISIBLE_THEMES);
  return (
    <Disclosure
      id={`categorie-${section.id}`}
      defaultOpen={open}
      summary={
        <span className="flex items-center gap-2">
          <ModuleIcon category={section.id} className="size-4" />
          {categoryLabel(section.id, section.label)}
          {section.author && <span className="font-normal text-foreground-muted">· {section.author}</span>}
        </span>
      }
      meta={
        <span className="font-mono">
          {section.masteredCount}/{section.totalCount}
        </span>
      }
    >
      <p className="mb-3 max-w-[70ch] text-sm text-foreground-muted">{section.description}</p>
      <div className="space-y-4">
        {visible.map(({ group, shown }) => {
          return (
          <section key={group.level}>
            <h3 className="mb-1 text-sm text-foreground-muted">
              {group.label} <span className="font-mono text-foreground-subtle">· {group.masteredCount}/{group.themes.length}</span>
            </h3>
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {shown.map((theme) => (
                <ThemeRow key={theme.id} theme={theme} onOpen={onOpen} />
              ))}
            </ul>
          </section>
          );
        })}
        {hidden > 0 && (
          <Button variant="ghost" onClick={() => setShowAll((value) => !value)}>
            {showAll ? "Réduire" : `Voir tout (${hidden} de plus)`}
          </Button>
        )}
      </div>
    </Disclosure>
  );
}

/**
 * Académie : « Mission en cours » + « Reprendre », puis les catégories,
 * toutes repliées sauf celle de la mission. Le niveau affiché est calculé
 * (XP des thèmes maîtrisés), jamais une valeur fixe.
 */
export function PlaybookLearnScreen({
  categories,
  onOpenTheme,
}: {
  categories: readonly CurriculumCategoryOverview[];
  onOpenTheme: (categoryId: string, themeId: string) => void;
}) {
  const model = useMemo(() => buildPlaybookModel(categories), [categories]);
  const mission = model.activeTheme;
  const openTheme = (theme: PlaybookThemeRow) => onOpenTheme(theme.categoryId, theme.id);
  const openId = mission?.categoryId ?? model.sections[0]?.id;

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <SectionSwitcher links={TRAINING_SECTIONS} label="Sections de S'entraîner" />
      <PageHeader title="Académie" description="Des cours commentés coup par coup, puis des exercices pour en faire des réflexes." />

      <section aria-labelledby="mission-titre" className="mb-6 rounded-lg border border-border bg-surface p-4 sm:p-5">
        <p className="text-sm text-foreground-muted">
          Mission en cours
          {mission && ` · ${categoryLabel(mission.categoryId, mission.categoryLabel)} · ${LEVEL_LABEL[mission.level]}`}
        </p>
        <h2 id="mission-titre" className="mt-1 font-display text-xl font-semibold">
          {mission?.title ?? "Aucune mission active"}
        </h2>
        <p className="mt-1 line-clamp-2 max-w-[70ch] text-sm text-foreground-muted">
          {mission?.description ?? "Termine une leçon disponible pour ouvrir la prochaine étape."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button variant="primary" data-primary-action disabled={!mission} onClick={() => mission && openTheme(mission)} className="w-full sm:w-auto">
            Reprendre
            <ArrowRight aria-hidden="true" />
          </Button>
          {mission && (
            <span className="flex min-w-48 flex-1 items-center gap-3 text-sm text-foreground-muted">
              <ProgressBar percent={mission.progressPercent} label="Progression de la mission" />
              <span className="font-mono whitespace-nowrap">{mission.progressPercent} %</span>
            </span>
          )}
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground-muted">
        <span>
          Niveau <span className="font-mono text-foreground">{model.level}</span> ·{" "}
          <span className="font-mono">
            {model.levelXp}/{model.nextLevelXp} XP
          </span>
        </span>
        <span>
          <span className="font-mono text-foreground">{model.masteredThemes}</span>/{model.totalThemes} thèmes maîtrisés
        </span>
        <span className="flex flex-wrap gap-x-3" aria-label="Légende des qualités de coup">
          {LEGEND.map((key) => (
            <span key={key}>
              <b className={`font-mono ${QUALITY_TEXT_CLASS[key]}`}>{QUALITY_SYMBOL[key]}</b> {QUALITY_LABEL[key]}
            </span>
          ))}
        </span>
      </div>

      <SectionTitle>Catégories</SectionTitle>
      {model.sections.length === 0 ? (
        <EmptyState title="Aucun thème disponible pour l'instant." />
      ) : (
        <div className="border-b border-border">
          {model.sections.map((section) => (
            <CategorySection key={section.id} section={section} open={section.id === openId} onOpen={openTheme} />
          ))}
        </div>
      )}
    </div>
  );
}
