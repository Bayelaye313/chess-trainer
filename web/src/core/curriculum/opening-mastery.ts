/**
 * Étoiles de maîtrise d'une variante — dérivées de la dernière précision de
 * drill enregistrée (`OpeningProgressRow.lastAccuracy`, voir
 * `server/queries/opening-progress.ts`). Pur, comme `srs/opening-repetition.ts` :
 * ni lecture ni écriture, juste la règle d'affichage partagée entre le
 * sélecteur de Mode Entraînement, la carte d'ouverture et le tableau de bord
 * global de progression (façon Lotus Chess).
 *
 * Seuils du protocole demandé : 100% = 3⭐, > 80% = 2⭐, > 50% = 1⭐, sinon
 * aucune étoile — une variante jamais pratiquée (`lastAccuracy` absent) n'a
 * par définition aucune étoile.
 */
export type MasteryStars = 0 | 1 | 2 | 3;

/** Une variante à 3⭐ compte comme « maîtrisée » partout dans l'app (transition automatique, barre de progression globale). */
export const MASTERY_STARS_FULL: MasteryStars = 3;

export function starsForAccuracy(accuracy: number): MasteryStars {
  if (accuracy >= 100) return 3;
  if (accuracy > 80) return 2;
  if (accuracy > 50) return 1;
  return 0;
}

export function isMasteredAccuracy(accuracy: number): boolean {
  return starsForAccuracy(accuracy) === MASTERY_STARS_FULL;
}

/** Une entrée pratiquable (ligne principale ou variante nommée) — même forme minimale que `PracticedEntry` (`build-final-test.ts`), sans en dépendre pour rester réutilisable ici. */
export interface MasteryCandidate {
  key: string;
  label: string;
}

/**
 * Prochaine variante NON maîtrisée du catalogue, en repartant juste après
 * `currentKey` et en bouclant sur la liste — sert la transition automatique
 * proposée à la fin d'un drill parfait (`OpeningDrill`) : après avoir
 * maîtrisé une variante, on propose la suivante qui ne l'est pas encore,
 * jamais une déjà connue par cœur. `null` si tout le catalogue de cette
 * ouverture est déjà à 3⭐ (rien à proposer), ou si `entries` est vide.
 */
export function findNextUnmasteredVariation(
  entries: readonly MasteryCandidate[],
  accuracyByKey: ReadonlyMap<string, number>,
  currentKey: string,
): MasteryCandidate | null {
  if (entries.length === 0) return null;
  const currentIndex = entries.findIndex((entry) => entry.key === currentKey);
  const startIndex = currentIndex === -1 ? 0 : currentIndex + 1;

  for (let offset = 0; offset < entries.length; offset += 1) {
    const entry = entries[(startIndex + offset) % entries.length];
    if (entry.key === currentKey) continue;
    const accuracy = accuracyByKey.get(entry.key) ?? 0;
    if (!isMasteredAccuracy(accuracy)) return entry;
  }
  return null;
}
