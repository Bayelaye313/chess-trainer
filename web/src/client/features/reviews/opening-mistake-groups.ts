/**
 * Regroupement à 3 niveaux du journal « Mes erreurs d'ouverture »
 * (`opening-mistakes-hub.tsx`) — Ouverture (famille, ex. « Ruy Lopez ») →
 * Défense/sous-variante (ex. « Défense Berlinoise ») → liste des erreurs
 * spécifiques, avec compte d'occurrences et statut de révision.
 *
 * Module pur, sans dépendance React : testable indépendamment du composant
 * (même parti pris que `opening-mistake-round.ts`/`build-final-test.ts`).
 *
 * `games.openingName` (base ECO globale, voir `server/import/openings.ts`)
 * suit la convention `chess-openings` : `"Famille"`, ou
 * `"Famille: Sous-variante, Détail encore plus précis"` — `splitOpeningName`
 * l'exploite pour dériver les deux premiers niveaux SANS dépendre du code ECO
 * exact (qui varie ligne par ligne au sein d'une même famille — regrouper
 * dessus aurait fragmenté "Ruy Lopez" en une dizaine de groupes C6x/C7x/C8x
 * distincts, exactement ce que cette refonte corrige).
 */
import type { DeviationGameSummaryDto } from "@/server/actions/practice";
import { mistakeReviewKey } from "@/core/curriculum/opening-mistake-key";

/** Une erreur récurrente distincte (une position précise, un coup fautif précis). */
export interface OpeningMistakeEntry {
  /** `mistakeReviewKey(fenBefore, actualUci)` — identifie la déviation elle-même, jamais la partie ni son regroupement visuel. */
  key: string;
  ply: number;
  expectedSan: string;
  actualSan: string;
  /** Nombre de parties importées distinctes où CETTE déviation précise a été observée. */
  gameCount: number;
  /**
   * Jauge de criticité (§12b) — `gameCount` normalisé sur `[0, 1]` par
   * rapport à l'erreur la PLUS répétée de TOUT le journal (pas seulement de
   * sa sous-variante) : une jauge à moitié pleine signifie toujours « deux
   * fois moins répétée que la pire erreur du joueur », comparable d'un bout à
   * l'autre du journal plutôt que relative à un groupe local.
   */
  criticality: number;
  /** `true` dès que cette déviation a déjà été corrigée avec succès au moins une fois — voir `server/db/schema/opening-mistake-review.ts`. */
  reviewed: boolean;
  /** La plus récente — c'est elle que rejoue `OpeningMistakeExercise`/`OpeningMistakeExplorer`. */
  mostRecent: DeviationGameSummaryDto;
}

/** Toutes les erreurs distinctes d'une même sous-variante — 3e niveau de la hiérarchie. */
export interface SubVariationGroup {
  /** `${family}||${subVariation label}` — clé de regroupement, jamais affichée telle quelle. */
  key: string;
  /** "Ligne principale" pour les déviations d'une famille sans sous-variante nommée (voir `splitOpeningName`). */
  label: string;
  mistakes: OpeningMistakeEntry[];
}

/** Toutes les sous-variantes d'une même famille d'ouverture — 1er niveau de la hiérarchie. */
export interface OpeningFamilyGroup {
  /** Le nom de famille lui-même — sert aussi de clé de regroupement. */
  key: string;
  label: string;
  subVariations: SubVariationGroup[];
  /** Dénormalisé pour l'en-tête du groupe — évite de reparcourir `subVariations` côté rendu. */
  totalMistakes: number;
  reviewedCount: number;
}

const DEFAULT_SUB_VARIATION_LABEL = "Ligne principale";

/**
 * Sépare `"Famille: Sous-variante, Détail"` en `{ family: "Famille",
 * subVariation: "Sous-variante" }` — `subVariation: null` si le nom ne
 * contient aucun `:` (ouverture sans sous-variante nommée à cette profondeur,
 * ex. simplement "Scotch Game").
 */
export function splitOpeningName(name: string): { family: string; subVariation: string | null } {
  const colonIndex = name.indexOf(":");
  if (colonIndex === -1) return { family: name.trim(), subVariation: null };
  const family = name.slice(0, colonIndex).trim();
  const rest = name.slice(colonIndex + 1).trim();
  const commaIndex = rest.indexOf(",");
  const subVariation = (commaIndex === -1 ? rest : rest.slice(0, commaIndex)).trim();
  return { family: family || name.trim(), subVariation: subVariation || null };
}

/**
 * `games` est déjà trié par `playedAt` décroissant (voir
 * `listRepertoireDeviationGames`) : le premier élément rencontré pour une clé
 * `(fenBefore, actualUci)` donnée est donc automatiquement le plus récent de
 * ce groupe. Les familles et sous-variantes gardent l'ordre de première
 * rencontre ; à l'intérieur d'une sous-variante, les erreurs les plus
 * répétées d'abord.
 */
export function groupMistakesByFamily(
  games: readonly DeviationGameSummaryDto[],
  reviewedKeys: ReadonlySet<string>,
): OpeningFamilyGroup[] {
  const entries = new Map<string, OpeningMistakeEntry & { family: string; subVariation: string | null }>();
  for (const game of games) {
    const key = mistakeReviewKey(game.fenBefore, game.actualUci);
    const existing = entries.get(key);
    if (existing) {
      existing.gameCount += 1;
      continue;
    }
    const { family, subVariation } = splitOpeningName(game.openingName);
    entries.set(key, {
      key,
      ply: game.ply,
      expectedSan: game.expectedSan,
      actualSan: game.actualSan,
      gameCount: 1,
      // Placeholder — la vraie valeur n'est connue qu'une fois `maxGameCount`
      // calculé plus bas (voir la boucle de normalisation).
      criticality: 0,
      reviewed: reviewedKeys.has(key),
      mostRecent: game,
      family,
      subVariation,
    });
  }

  // Dénominateur commun de la jauge de criticité — l'erreur la plus répétée
  // de TOUT le journal, tous groupes confondus (voir le docstring de
  // `OpeningMistakeEntry.criticality`). `gameCount` est déjà final ici : le
  // seul passage qui l'incrémente est la boucle précédente.
  let maxGameCount = 1;
  for (const entry of entries.values()) {
    if (entry.gameCount > maxGameCount) maxGameCount = entry.gameCount;
  }

  const families = new Map<string, OpeningFamilyGroup>();
  const subVariationsByFamily = new Map<string, Map<string, SubVariationGroup>>();

  for (const entry of entries.values()) {
    let family = families.get(entry.family);
    let subVariationMap = subVariationsByFamily.get(entry.family);
    if (!family || !subVariationMap) {
      family = { key: entry.family, label: entry.family, subVariations: [], totalMistakes: 0, reviewedCount: 0 };
      subVariationMap = new Map();
      families.set(entry.family, family);
      subVariationsByFamily.set(entry.family, subVariationMap);
    }

    const subVariationLabel = entry.subVariation ?? DEFAULT_SUB_VARIATION_LABEL;
    let subVariation = subVariationMap.get(subVariationLabel);
    if (!subVariation) {
      subVariation = { key: `${entry.family}||${subVariationLabel}`, label: subVariationLabel, mistakes: [] };
      subVariationMap.set(subVariationLabel, subVariation);
      family.subVariations.push(subVariation);
    }

    const mistake: OpeningMistakeEntry = {
      key: entry.key,
      ply: entry.ply,
      expectedSan: entry.expectedSan,
      actualSan: entry.actualSan,
      gameCount: entry.gameCount,
      criticality: entry.gameCount / maxGameCount,
      reviewed: entry.reviewed,
      mostRecent: entry.mostRecent,
    };
    subVariation.mistakes.push(mistake);
    family.totalMistakes += 1;
    if (mistake.reviewed) family.reviewedCount += 1;
  }

  for (const family of families.values()) {
    for (const subVariation of family.subVariations) {
      subVariation.mistakes.sort((a, b) => b.gameCount - a.gameCount || a.ply - b.ply);
    }
  }

  return Array.from(families.values());
}

/**
 * Aplatit la hiérarchie à 3 niveaux en une liste ordonnée — sert le bouton
 * « Suivant → » de `OpeningMistakeExplorer` (voir `opening-mistakes-hub.tsx`) :
 * explorer une erreur sans repasser par la liste avant de passer à la
 * suivante. Même ordre que le rendu (`OpeningFamilySection`), donc "Suivant"
 * correspond toujours à ce que l'œil voit juste en dessous dans le journal.
 */
export function flattenMistakes(groups: readonly OpeningFamilyGroup[]): OpeningMistakeEntry[] {
  return groups.flatMap((group) => group.subVariations.flatMap((subVariation) => subVariation.mistakes));
}
