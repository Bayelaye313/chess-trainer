"use client";

/**
 * File "⚡ Lancer les révisions du jour" — chaîne plusieurs drills à travers
 * PLUSIEURS pages `/ouvertures/[slug]` (une variante due peut appartenir à
 * n'importe quelle ouverture), donc pas un simple state React : la position
 * dans la file doit survivre à la navigation entre ouvertures. `sessionStorage`
 * suffit — la file n'a de sens que pour la session de révision en cours,
 * jamais besoin de la retrouver après avoir fermé l'onglet.
 *
 * `OpeningsScreen` amorce la file avec `startReviewQueue` puis navigue vers la
 * première variante due ; `OpeningExplorer` (`/ouvertures/[slug]?drill=<clé>`)
 * affiche "Suivant" tant que `peekNextReview()` renvoie un élément, et appelle
 * `popNextReview()` pour avancer.
 */
export interface ReviewQueueItem {
  openingId: string;
  variationKey: string;
  variationLabel: string;
}

const STORAGE_KEY = "chess-trainer:review-queue";

function readQueue(): ReviewQueueItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewQueueItem[]) : [];
  } catch {
    // Stockage indisponible (navigation privée, etc.) — la file se comporte
    // comme si elle était vide plutôt que de faire planter l'écran.
    return [];
  }
}

function writeQueue(items: ReviewQueueItem[]): void {
  try {
    if (items.length === 0) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignoré — voir `readQueue`.
  }
}

/** Remplace la file par `items` (l'appelant a déjà retiré le premier élément, qu'il navigue vers lui séparément). */
export function saveReviewQueue(items: ReviewQueueItem[]): void {
  writeQueue(items);
}

/** Nombre d'éléments restants, sans en consommer aucun — pour afficher "Suivant (N restants)". */
export function peekReviewQueueLength(): number {
  return readQueue().length;
}

/** Retire et renvoie le prochain élément de la file, `null` si elle est épuisée. */
export function popNextReview(): ReviewQueueItem | null {
  const items = readQueue();
  const [next, ...rest] = items;
  if (!next) return null;
  writeQueue(rest);
  return next;
}

/** Vide la file — appelé quand le joueur quitte le mode révision avant de l'épuiser. */
export function clearReviewQueue(): void {
  writeQueue([]);
}
