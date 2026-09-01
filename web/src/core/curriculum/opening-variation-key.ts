/**
 * Identifiant stable d'une variante suivie en répétition espacée (voir
 * `server/db/schema/opening-progress.ts`) — dans `core/` plutôt que
 * `server/` ou `client/` car `use-opening-drill.ts` (client, à la fin d'un
 * drill) ET `server/queries/opening-progress.ts` (serveur, tableau de bord)
 * doivent produire EXACTEMENT la même clé pour la même sélection, sans
 * dupliquer le format des deux côtés.
 *
 * Le mode Aléatoire/Surprise (`DrillSelection.kind === "random"`) n'a par
 * nature aucun script fixe — il n'a pas de clé et n'est jamais suivi ici.
 */

export const MAIN_LINE_VARIATION_KEY = "main_line";

export type TrackedDrillSelection = { kind: "main-line" } | { kind: "variation"; eco: string; name: string };

/** "main_line", ou `${eco}|${name}` pour une variante nommée — voir le docstring du fichier. */
export function variationKeyFor(selection: TrackedDrillSelection): string {
  return selection.kind === "main-line" ? MAIN_LINE_VARIATION_KEY : `${selection.eco}|${selection.name}`;
}

/** Libellé affichable par défaut d'une sélection suivie — sert de `variationLabel` dénormalisé en base. */
export function variationLabelFor(selection: TrackedDrillSelection): string {
  return selection.kind === "main-line" ? "Ligne principale" : selection.name;
}

/**
 * Retrouve, parmi les variantes connues d'une ouverture (`listOpeningVariations`),
 * celle dont la clé correspond — sert à relancer automatiquement une variante
 * précise depuis la file "Lancer les révisions du jour" (`?drill=<clé>` sur
 * `/ouvertures/[slug]`), sans repasser par le sélecteur manuel.
 */
export function findVariationByKey<T extends { eco: string; name: string }>(
  variations: readonly T[],
  key: string,
): T | null {
  return variations.find((variation) => variationKeyFor({ kind: "variation", ...variation }) === key) ?? null;
}
