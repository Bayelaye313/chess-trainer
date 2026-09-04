"use client";

/**
 * Liste des chapitres d'une ouverture — « Ligne principale » + un ARBRE de
 * variantes nommées (`listOpeningVariations`), pas une simple liste plate :
 * depuis la connexion du catalogue dynamique
 * (`server/curriculum/imported-openings-index.ts`), un chapitre riche peut
 * porter des centaines de variantes (391 pour la Sicilienne) — voir
 * `chapter-tree.ts` pour la reconstruction de la hiérarchie (Najdorf → English
 * Attack, etc.) à partir des noms de variantes.
 *
 * Repliée par défaut au-delà de la branche qui mène au chapitre déjà actif —
 * une recherche texte force le dépli des seuls résultats. Sert la colonne de
 * droite du Mode Entraînement (`OpeningDrill`, seule interface de
 * `/ouvertures/[slug]` depuis le retrait du bac à sable passif — voir
 * `opening-explorer.tsx`) pour choisir quoi réviser.
 */
import { useMemo, useState } from "react";
import { starsForAccuracy } from "@/core/curriculum/opening-mastery";
import { MAIN_LINE_VARIATION_KEY, variationKeyFor } from "@/core/curriculum/opening-variation-key";
import type { OpeningVariation } from "@/server/queries/openings";
import { allNodeKeys, ancestorPathsToActive, buildChapterTree, countChapters, type ChapterTreeNode } from "./chapter-tree";
import { Stars } from "./stars";

export type ChapterSelection = { kind: "main-line" } | { kind: "variation"; variation: OpeningVariation };

function keyOfVariation(variation: OpeningVariation): string {
  return variationKeyFor({ kind: "variation", eco: variation.eco, name: variation.name });
}

function ChapterTreeItem({
  node,
  depth,
  accuracyByKey,
  activeKey,
  expanded,
  onToggle,
  onSelect,
}: {
  node: ChapterTreeNode;
  depth: number;
  accuracyByKey: ReadonlyMap<string, number>;
  activeKey: string | null;
  /** L'ensemble des clés actuellement dépliées — voir `ChapterSelector`. */
  expanded: ReadonlySet<string>;
  onToggle: (key: string) => void;
  onSelect: (selection: ChapterSelection) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.key);
  const variationKey = node.variation ? keyOfVariation(node.variation) : null;
  const indentStyle = depth > 0 ? { paddingLeft: `${depth * 0.85}rem` } : undefined;

  return (
    <li>
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.key)}
            className="shrink-0 px-1 text-xs text-foreground-muted hover:text-foreground"
            style={indentStyle}
            aria-label={isExpanded ? `Réduire ${node.label}` : `Déplier ${node.label}`}
            aria-expanded={isExpanded}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="inline-block w-5 shrink-0" style={indentStyle} aria-hidden />
        )}

        {node.variation ? (
          <button
            type="button"
            onClick={() => onSelect({ kind: "variation", variation: node.variation! })}
            className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-muted ${
              variationKey === activeKey ? "bg-accent/15" : ""
            }`}
          >
            <span className="truncate font-medium text-foreground">{node.label}</span>
            <span className="flex shrink-0 items-center gap-2">
              <Stars count={starsForAccuracy(accuracyByKey.get(variationKey!) ?? 0)} />
              <span className="text-xs text-foreground-muted">{node.variation.eco}</span>
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggle(node.key)}
            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted hover:text-foreground"
          >
            <span className="truncate">{node.label}</span>
            <span className="shrink-0 font-normal normal-case text-foreground-muted/70">({countChapters(node)})</span>
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <ul>
          {node.children.map((child) => (
            <ChapterTreeItem
              key={child.key}
              node={child}
              depth={depth + 1}
              accuracyByKey={accuracyByKey}
              activeKey={activeKey}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ChapterSelector({
  mainLineLabel,
  mainLineEco,
  variations,
  accuracyByKey,
  activeKey = null,
  onSelect,
}: {
  mainLineLabel: string;
  mainLineEco: string;
  variations: readonly OpeningVariation[];
  /** Dernière précision par variante (`variationKeyFor`) — sert les étoiles, voir `core/curriculum/opening-mastery.ts`. */
  accuracyByKey: ReadonlyMap<string, number>;
  /** Chapitre actuellement affiché, pour le surligner (et déplier sa branche à l'ouverture) — `null` si rien à refléter (ex. sélecteur du Mode Entraînement avant le premier drill). */
  activeKey?: string | null;
  onSelect: (selection: ChapterSelection) => void;
}) {
  const [query, setQuery] = useState("");

  const fullTree = useMemo(() => buildChapterTree(variations), [variations]);

  // Filtre sur le nom COMPLET (pas seulement le segment affiché) : une
  // recherche "English Attack" doit remonter le chapitre même si ce segment
  // n'est qu'un sous-nom parmi d'autres dans l'arbre. `buildChapterTree`
  // reconstruit alors uniquement les en-têtes nécessaires pour y mener.
  const filteredTree = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return fullTree;
    return buildChapterTree(variations.filter((v) => v.name.toLowerCase().includes(needle)));
  }, [fullTree, variations, query]);

  // Déplié par défaut : seule la branche qui mène au chapitre déjà actif (une
  // fois, à l'ouverture — un chapitre à 391 variantes doit rester replié par
  // défaut, voir le docstring du fichier). Une recherche active force le
  // dépli de TOUS les résultats trouvés, pour qu'ils restent visibles sans
  // clic supplémentaire.
  const [manuallyExpanded, setManuallyExpanded] = useState<Set<string>>(
    () => new Set(ancestorPathsToActive(fullTree, activeKey, keyOfVariation)),
  );

  const expanded = useMemo(() => {
    if (query.trim()) return new Set(allNodeKeys(filteredTree));
    return manuallyExpanded;
  }, [query, filteredTree, manuallyExpanded]);

  function toggle(key: string) {
    setManuallyExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={() => onSelect({ kind: "main-line" })}
            className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-muted ${
              activeKey === MAIN_LINE_VARIATION_KEY ? "bg-accent/15" : ""
            }`}
          >
            <span className="truncate font-medium text-foreground">{mainLineLabel} · ligne principale</span>
            <span className="flex shrink-0 items-center gap-2">
              <Stars count={starsForAccuracy(accuracyByKey.get(MAIN_LINE_VARIATION_KEY) ?? 0)} />
              <span className="text-xs text-foreground-muted">{mainLineEco}</span>
            </span>
          </button>
        </li>
      </ul>

      {/* Recherche texte — surtout utile au-delà d'une poignée de variantes (voir le docstring du fichier), mais toujours affichée : cacher/montrer selon un seuil ajouterait un état de plus pour un gain marginal. */}
      {variations.length > 0 && (
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Chercher parmi ${variations.length} variante${variations.length > 1 ? "s" : ""}…`}
          aria-label="Chercher un chapitre"
          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent/60 focus:outline-none"
        />
      )}

      {filteredTree.length === 0 ? (
        <p className="px-2 py-1.5 text-xs text-foreground-muted">Aucun chapitre ne correspond à cette recherche.</p>
      ) : (
        <ul className="space-y-0.5">
          {filteredTree.map((node) => (
            <ChapterTreeItem
              key={node.key}
              node={node}
              depth={0}
              accuracyByKey={accuracyByKey}
              activeKey={activeKey}
              expanded={expanded}
              onToggle={toggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
