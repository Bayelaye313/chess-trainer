"use client";

/**
 * CourseCurriculum — remplace la frise plate `ThemePath` pour les modules à
 * fort volume (jusqu'à ~30 thèmes, ex. Positional Mastery) par un accordéon
 * en 3 paliers de compétence (Bronze/Argent/Or = `theme.level`) : cahier des
 * charges du 2026-09-09, "destruction des listes infinies" puis "bibliothèques
 * UI modernes avec animations". Même contrat de props que `ThemePath`
 * (`themes`, `onSelectTheme`) — un swap direct dans `LearnScreen`
 * (`view.kind === "themes"`) sans changement d'appelant. `ThemePath` reste
 * disponible pour les modules trop petits pour justifier un accordéon (ex. 3
 * thèmes `endgame_mastery`) — au juge de l'appelant.
 *
 * Stack : `@radix-ui/react-accordion` pour l'ACCESSIBILITÉ (aria-expanded,
 * navigation clavier flèches haut/bas entre paliers, focus visible) — jamais
 * réimplémentée à la main — et `motion` pour le RENDU visuel de
 * l'ouverture/fermeture (`Accordion.Content forceMount asChild` : Radix pose
 * l'état, `motion` anime `height`/`opacity` via les variantes de
 * `theme-config.ts`, jamais les deux systèmes de transition en même temps sur
 * la même propriété).
 *
 * Perf — "optimise le re-rendu lorsque les volets s'ouvrent" :
 *  - Le regroupement par palier (`byLevel`) est mémoïsé sur l'identité de
 *    `themes` : un re-rendu de `CourseCurriculum` pour une raison étrangère
 *    ne reconstruit pas les 3 tableaux à chaque fois.
 *  - `TierSection` est un composant `memo`isé recevant SES PROPRES thèmes en
 *    slice — ouvrir/fermer un palier ne redessine jamais les deux autres (le
 *    Radix `Accordion.Root` est contrôlé : `value`/`onValueChange` gérés ici,
 *    passés en `open` booléen à chaque palier plutôt que de laisser chaque
 *    palier relire le contexte Radix, pour garder un seul point de vérité).
 *  - Pas de virtualisation de liste : à ~10 thèmes par palier ouvert, le DOM
 *    réel reste largement sous le seuil où `react-window` apporterait quoi
 *    que ce soit — l'ajouter ici serait de la complexité sans bénéfice mesuré.
 */
import * as Accordion from "@radix-ui/react-accordion";
import { motion } from "motion/react";
import { memo, useCallback, useMemo, useState } from "react";
import type { CurriculumLevel } from "@/server/db/schema/curriculum";
import type { CurriculumThemeOverview } from "@/server/queries/curriculum";
import { ProgressRing } from "./progress-ring";
import { ACCORDION_LIST_VARIANTS, ACCORDION_PANEL_VARIANTS, ACCORDION_ROW_VARIANTS, CHEVRON_VARIANTS, GLOW, SPRING, TIER_META, TIER_ORDER } from "./theme-config";

function isThemeDone(theme: CurriculumThemeOverview): boolean {
  return theme.totalPuzzles > 0 && theme.completedCount >= theme.totalPuzzles;
}

const ThemeRow = memo(function ThemeRow({
  theme,
  index,
  onSelect,
  onReview,
}: {
  theme: CurriculumThemeOverview;
  index: number;
  onSelect: () => void;
  /** Bascule vers `ThemeReviewSession` sans repasser par le cours — proposé uniquement sur un thème déjà maîtrisé (`done`), voir plus bas. */
  onReview: () => void;
}) {
  const done = isThemeDone(theme);
  // Même garde-fou que `ThemePath` (cahier des charges du 2026-09-06) : un
  // thème à 0 exercice authentique reste visible mais visuellement en
  // attente, jamais masqué ni doté d'une jauge inventée.
  const empty = theme.totalPuzzles === 0;

  return (
    // `motion.div` plutôt que `motion.button` depuis le sprint de clôture du
    // 2026-09-11 : un thème maîtrisé porte désormais DEUX actions (reprendre
    // le cours, revoir la vague) — deux `<button>` réels côte à côte, jamais
    // un bouton imbriqué dans un autre (invalide en HTML, invisible aux
    // lecteurs d'écran).
    <motion.div
      whileHover={{ y: -2, boxShadow: GLOW.card }}
      transition={SPRING}
      className={`flex w-full items-center gap-1 rounded-lg border px-2 py-1.5 ${
        empty ? "border-dashed border-border/60 bg-surface/60" : "border-border bg-surface"
      }`}
    >
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5 text-left">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
            done ? "border-best bg-best/10 text-best" : "border-border text-foreground-muted"
          }`}
          aria-hidden="true"
        >
          {done ? "✓" : index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-medium ${empty ? "text-foreground-muted" : "text-foreground"}`}>
            {theme.title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-foreground-muted">{theme.description}</span>
        </span>
        {empty ? (
          <span className="shrink-0 text-xs font-medium text-inaccuracy">⚠️ En attente</span>
        ) : (
          <span className="shrink-0 font-mono text-xs text-foreground-muted">
            {theme.completedCount}/{theme.totalPuzzles}
          </span>
        )}
      </button>
      {done && (
        <button
          type="button"
          onClick={onReview}
          title="Revoir les puzzles"
          aria-label="Revoir les puzzles"
          className="shrink-0 rounded-md px-2 py-1.5 text-base hover:bg-surface-muted"
        >
          🔁
        </button>
      )}
    </motion.div>
  );
});

const TierSection = memo(function TierSection({
  level,
  themes,
  open,
  onSelectTheme,
  onReviewTheme,
}: {
  level: CurriculumLevel;
  themes: readonly CurriculumThemeOverview[];
  open: boolean;
  onSelectTheme: (themeId: string) => void;
  onReviewTheme: (themeId: string) => void;
}) {
  const meta = TIER_META[level];
  const masteredCount = useMemo(() => themes.filter(isThemeDone).length, [themes]);
  const percent = themes.length > 0 ? Math.round((masteredCount / themes.length) * 100) : 0;

  if (themes.length === 0) return null;

  return (
    <Accordion.Item value={level} className={`overflow-hidden rounded-xl border bg-surface ${meta.borderClass}`}>
      <Accordion.Header>
        {/* `asChild` fusionne les props d'accessibilité de Radix (aria-expanded, data-state, gestion clavier) sur le `motion.button` — les deux libs pilotent chacune leur moitié sans se marcher dessus. */}
        <Accordion.Trigger asChild>
          <motion.button
            type="button"
            whileHover={{ backgroundColor: "var(--surface-muted)" }}
            whileTap={{ scale: 0.995 }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="text-xl" aria-hidden="true">
              {meta.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-black uppercase tracking-wide ${meta.textClass}`}>{meta.label}</span>
              <span className="block text-xs text-foreground-muted">
                {themes.length} thème{themes.length > 1 ? "s" : ""} — {masteredCount} maîtrisé{masteredCount > 1 ? "s" : ""}
              </span>
            </span>
            <ProgressRing percent={percent} size={40} />
            <motion.span
              aria-hidden="true"
              className="ml-1 shrink-0 text-foreground-muted"
              variants={CHEVRON_VARIANTS}
              animate={open ? "open" : "closed"}
              transition={SPRING}
            >
              ▾
            </motion.span>
          </motion.button>
        </Accordion.Trigger>
      </Accordion.Header>

      {/* `forceMount` : Radix garde le contenu monté en permanence et se contente de poser `data-state`, tout le visuel d'ouverture/fermeture vient de `motion` (variantes centralisées dans `theme-config.ts`) — jamais le `max-height` deviné en dur d'une version CSS pure. */}
      <Accordion.Content forceMount asChild>
        <motion.div variants={ACCORDION_PANEL_VARIANTS} animate={open ? "open" : "closed"} initial={false} style={{ overflow: "hidden" }}>
          <motion.ul
            variants={ACCORDION_LIST_VARIANTS}
            animate={open ? "open" : "closed"}
            initial={false}
            className="space-y-2 px-4 pb-4 pt-1"
          >
            {themes.map((theme, index) => (
              <motion.li key={theme.id} variants={ACCORDION_ROW_VARIANTS}>
                <ThemeRow
                  theme={theme}
                  index={index}
                  onSelect={() => onSelectTheme(theme.id)}
                  onReview={() => onReviewTheme(theme.id)}
                />
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </Accordion.Content>
    </Accordion.Item>
  );
});

export function CourseCurriculum({
  themes,
  onSelectTheme,
  onReviewTheme,
  defaultExpandedLevel,
}: {
  themes: readonly CurriculumThemeOverview[];
  onSelectTheme: (themeId: string) => void;
  /** Bouton « 🔁 » de `ThemeRow` sur un thème déjà maîtrisé — bascule directement en mode Révision sans repasser par le cours. */
  onReviewTheme: (themeId: string) => void;
  /** Palier initialement déplié — par défaut le premier palier (Bronze → Argent → Or) qui contient encore un thème non terminé. */
  defaultExpandedLevel?: CurriculumLevel;
}) {
  const byLevel = useMemo(() => {
    const groups = new Map<CurriculumLevel, CurriculumThemeOverview[]>();
    for (const theme of themes) {
      const list = groups.get(theme.level) ?? [];
      list.push(theme);
      groups.set(theme.level, list);
    }
    return groups;
  }, [themes]);

  const initialLevel = useMemo(() => {
    if (defaultExpandedLevel) return defaultExpandedLevel;
    for (const level of TIER_ORDER) {
      if ((byLevel.get(level) ?? []).some((theme) => !isThemeDone(theme))) return level;
    }
    return TIER_ORDER[0];
  }, [byLevel, defaultExpandedLevel]);

  // `Accordion.Root` contrôlé : `value` est la liste des paliers ouverts
  // (type="multiple", plusieurs paliers dépliables à la fois). Un seul point
  // de vérité, passé en booléen `open` à chaque `TierSection` — voir le
  // docstring de perf en tête de fichier.
  const [expandedLevels, setExpandedLevels] = useState<string[]>(() => [initialLevel]);
  const handleValueChange = useCallback((value: string[]) => setExpandedLevels(value), []);

  if (themes.length === 0) {
    return <p className="text-sm text-foreground-muted">Aucun thème disponible pour l&apos;instant.</p>;
  }

  return (
    <Accordion.Root type="multiple" value={expandedLevels} onValueChange={handleValueChange} className="space-y-3">
      {TIER_ORDER.map((level) => (
        <TierSection
          key={level}
          level={level}
          themes={byLevel.get(level) ?? []}
          open={expandedLevels.includes(level)}
          onSelectTheme={onSelectTheme}
          onReviewTheme={onReviewTheme}
        />
      ))}
    </Accordion.Root>
  );
}
