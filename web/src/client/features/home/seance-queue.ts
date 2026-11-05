"use client";

import { scopedGet, scopedSet, scopedRemove } from "@/client/storage/user-storage";
/**
 * File de la séance du jour, gardée en `sessionStorage` (comme la file des
 * révisions d'ouverture, `openings/review-queue.ts`) : « Continuer » la crée,
 * puis la barre `SeanceBar` mène d'une action à la suivante sans repasser
 * par l'accueil.
 */
export const SEANCE_QUEUE_KEY = "chess-trainer:seance-queue";
export const SEANCE_EVENT = "chess-trainer:seance-change";

export interface SeanceItem {
  href: string;
  label: string;
}

export interface SeanceQueue {
  items: SeanceItem[];
  /** Index de l'action en cours. */
  index: number;
}

export function readSeanceQueue(): SeanceQueue | null {
  try {
    const raw = scopedGet("session", SEANCE_QUEUE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SeanceQueue;
    return Array.isArray(parsed.items) && typeof parsed.index === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSeanceQueue(queue: SeanceQueue | null): void {
  try {
    if (queue === null) scopedRemove("session", SEANCE_QUEUE_KEY);
    else scopedSet("session", SEANCE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Stockage indisponible : la séance reste faisable depuis l'accueil.
  }
  window.dispatchEvent(new Event(SEANCE_EVENT));
}

/** Passe à l'action suivante ; renvoie son lien, ou `null` si la séance est finie. */
export function advanceSeance(): string | null {
  const queue = readSeanceQueue();
  if (!queue) return null;
  const next = queue.index + 1;
  if (next >= queue.items.length) {
    writeSeanceQueue(null);
    return null;
  }
  writeSeanceQueue({ ...queue, index: next });
  return queue.items[next].href;
}
