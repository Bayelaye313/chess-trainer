"use client";

/**
 * Liste des chapitres d'une ouverture — « Ligne principale » + chaque
 * variante nommée de `listOpeningVariations` — façon Listudy : structure de
 * navigation claire, étoiles de maîtrise par chapitre. Sert la colonne de
 * droite du Mode Entraînement (`OpeningDrill`, seule interface de
 * `/ouvertures/[slug]` depuis le retrait du bac à sable passif — voir
 * `opening-explorer.tsx`) pour choisir quoi réviser.
 */
import { starsForAccuracy } from "@/core/curriculum/opening-mastery";
import { MAIN_LINE_VARIATION_KEY, variationKeyFor } from "@/core/curriculum/opening-variation-key";
import type { OpeningVariation } from "@/server/queries/openings";
import { Stars } from "./stars";

export type ChapterSelection = { kind: "main-line" } | { kind: "variation"; variation: OpeningVariation };

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
  /** Chapitre actuellement affiché, pour le surligner — `null` si rien à refléter (ex. sélecteur du Mode Entraînement avant le premier drill). */
  activeKey?: string | null;
  onSelect: (selection: ChapterSelection) => void;
}) {
  return (
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
      {variations.map((variation) => {
        const key = variationKeyFor({ kind: "variation", eco: variation.eco, name: variation.name });
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "variation", variation })}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-muted ${
                activeKey === key ? "bg-accent/15" : ""
              }`}
            >
              <span className="truncate font-medium text-foreground">{variation.name}</span>
              <span className="flex shrink-0 items-center gap-2">
                <Stars count={starsForAccuracy(accuracyByKey.get(key) ?? 0)} />
                <span className="text-xs text-foreground-muted">{variation.eco}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
