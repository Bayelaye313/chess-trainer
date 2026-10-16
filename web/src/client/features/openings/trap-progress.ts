"use client";

/**
 * Progression LOCALE (par navigateur) de l'onglet « ⚔️ Pièges » — sert
 * uniquement à cocher les pastilles déjà résolues dans `PiegesScreen`/
 * `OpeningTrapDrill` (voir leurs docstrings). Volontairement `localStorage`,
 * pas une table dédiée en base : un piège reste, par conception, un exercice
 * qu'on rejoue librement sans répétition espacée (voir le docstring
 * historique d'`opening-trap-drill.tsx`) — `opening_mistake_review` couvre un
 * domaine différent (les VRAIES erreurs rejouées depuis les parties
 * importées du joueur, avec planification SRS), pas ce catalogue curaté. Même
 * parti pris défensif que `review-queue.ts` : jamais de plantage si le
 * stockage est indisponible (navigation privée…), la progression se comporte
 * alors comme si rien n'était encore résolu.
 */

const STORAGE_KEY = "chess-trainer:solved-traps";

function readSolvedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeSolvedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Ignoré — voir le docstring du fichier.
  }
}

/** Snapshot des pièges résolus — à relire après chaque montage (`PiegesScreen`), jamais mis en cache entre deux appels. */
export function getSolvedTrapIds(): Set<string> {
  return readSolvedIds();
}

/** Marque `id` comme résolu — idempotent, aucune écriture si déjà présent. */
export function markTrapSolved(id: string): void {
  const ids = readSolvedIds();
  if (ids.has(id)) return;
  ids.add(id);
  writeSolvedIds(ids);
}
