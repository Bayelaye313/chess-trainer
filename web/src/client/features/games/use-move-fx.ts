"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import type { MoveFxKind } from "@/core/analysis/move-fx";
import { playEsportAudioFx } from "./esport-audio-synth";

const MUTE_STORAGE_KEY = "chess-trainer:move-fx-muted";

/**
 * Préférence de coupure du son, synchronisée sur `localStorage` via
 * `useSyncExternalStore` — pas un `useState` + `useEffect` de lecture au
 * montage : celui-ci appellerait `setState` de façon synchrone dans un effet
 * (`react-hooks/set-state-in-effect`, voir le même choix documenté dans
 * `use-book-continuations.ts`). `useSyncExternalStore` gère nativement le
 * décalage serveur (pas de `localStorage`, `getServerSnapshot` renvoie
 * toujours `false`) / client sans passer par un effet.
 */
const muteListeners = new Set<() => void>();

function readStoredMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeStoredMuted(next: boolean): void {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Best-effort : la préférence ne survivra simplement pas au rechargement.
  }
  muteListeners.forEach((listener) => listener());
}

function subscribeMuted(listener: () => void): () => void {
  muteListeners.add(listener);
  return () => muteListeners.delete(listener);
}

function getServerMutedSnapshot(): boolean {
  return false;
}

/**
 * Sons + coupure micro du son "Sound & Animation Canvas" de la Revue de
 * partie (§11b) — expose `playFx(kind)` (déclenché à chaque changement de
 * coup, voir `game-review-screen.tsx`) et un mute persistant. La synthèse
 * elle-même (filtres passe-bas, bruit filtré pour la Capture, enveloppes
 * exponentielles) vit dans `esport-audio-synth.ts` — ce hook ne garde que le
 * cycle de vie de l'`AudioContext` et la vérification du mute, jamais
 * dupliqués côté moteur de synthèse.
 *
 * `AudioContext` créé paresseusement, au premier `playFx` : la plupart des
 * navigateurs refusent de démarrer un contexte audio avant une interaction
 * utilisateur, et la Revue est déjà navigable au clavier dès son montage.
 */
export function useMoveFx() {
  const muted = useSyncExternalStore(subscribeMuted, readStoredMuted, getServerMutedSnapshot);
  const contextRef = useRef<AudioContext | null>(null);

  const toggleMuted = useCallback(() => {
    writeStoredMuted(!readStoredMuted());
  }, []);

  const playFx = useCallback(
    (kind: MoveFxKind) => {
      if (muted) return;
      if (typeof window === "undefined") return;

      const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;

      try {
        const context = contextRef.current ?? new AudioContextCtor();
        contextRef.current = context;
        if (context.state === "suspended") void context.resume();

        playEsportAudioFx(context, kind);
      } catch {
        // Best-effort : un navigateur qui refuse l'audio (permissions, contexte
        // bloqué) ne doit jamais interrompre la navigation dans la Revue.
      }
    },
    [muted],
  );

  return { playFx, muted, toggleMuted };
}
