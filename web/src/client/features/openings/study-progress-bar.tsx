"use client";

/** Barre de progression simple de l'étude : chapitres maîtrisés (3⭐) sur le total — façon Listudy. */
import { isMasteredAccuracy } from "@/core/curriculum/opening-mastery";
import { MAIN_LINE_VARIATION_KEY, variationKeyFor } from "@/core/curriculum/opening-variation-key";
import type { OpeningVariation } from "@/server/queries/openings";

export function StudyProgressBar({
  variations,
  accuracyByKey,
}: {
  variations: readonly OpeningVariation[];
  accuracyByKey: ReadonlyMap<string, number>;
}) {
  const keys = [
    MAIN_LINE_VARIATION_KEY,
    ...variations.map((variation) => variationKeyFor({ kind: "variation", eco: variation.eco, name: variation.name })),
  ];
  const masteredCount = keys.filter((key) => isMasteredAccuracy(accuracyByKey.get(key) ?? 0)).length;
  const total = keys.length;
  const percent = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-foreground-muted">
        <span>Progression de l&apos;étude</span>
        <span className="font-mono">
          {masteredCount} / {total} chapitre{total > 1 ? "s" : ""} maîtrisé{masteredCount > 1 ? "s" : ""}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full bg-best transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
