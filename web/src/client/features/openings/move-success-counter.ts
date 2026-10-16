"use client";

/**
 * Persistance adaptative du système de flèches d'indices façon Listudy (voir
 * `use-opening-drill.ts`, `HintArrowBehavior`) : combien de fois CE coup
 * précis a déjà été réussi par le joueur, toutes sessions d'entraînement
 * confondues — `localStorage`, jamais `sessionStorage` (contrairement à
 * `review-queue.ts`) : ce compteur DOIT survivre à la fermeture de l'onglet,
 * c'est tout son intérêt (ne plus jamais souffler un coup déjà mémorisé, y
 * compris le lendemain).
 *
 * Clé = POSITION + coup (voir `moveSuccessKey`), jamais le coup seul (le même
 * UCI peut être correct à deux positions totalement différentes) ni la
 * variante/le chapitre qui y mène (deux chapitres qui transposent vers la
 * même position partagent le même apprentissage : pas la peine de le refaire
 * deux fois séparément).
 */

const STORAGE_KEY = "chess-trainer:move-success-counter";

function readCounters(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    // Stockage indisponible (navigation privée, quota, etc.) — dégrade en
    // "aucun coup jamais réussi" plutôt que de planter : voir
    // `getMoveSuccessCount`, qui renverra alors toujours 0, donc la flèche
    // d'indice restera affichée (repli sûr, jamais l'inverse).
    return {};
  }
}

function writeCounters(counters: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
  } catch {
    // Ignoré — voir `readCounters`. Une écriture perdue ne fait, au pire, que
    // faire réafficher une flèche d'indice qui aurait dû s'éteindre : jamais
    // bloquant pour le joueur.
  }
}

/** Clé stable POSITION + coup — voir le docstring du fichier. */
export function moveSuccessKey(fenBefore: string, uci: string): string {
  return `${fenBefore}|${uci}`;
}

/** Nombre de fois où ce coup précis a déjà été réussi — `0` si jamais rencontré (ou stockage indisponible). */
export function getMoveSuccessCount(key: string): number {
  return readCounters()[key] ?? 0;
}

/** Enregistre une réussite supplémentaire pour ce coup précis — renvoie le nouveau total. */
export function recordMoveSuccess(key: string): number {
  const counters = readCounters();
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeCounters(counters);
  return next;
}
