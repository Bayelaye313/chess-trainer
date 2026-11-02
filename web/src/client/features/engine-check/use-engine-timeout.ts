"use client";

import { useEffect, useState } from "react";
import { useEngine, type EngineStatus } from "@/client/engine/engine-context";

/** Au-delà, un moteur encore « en chargement » est présenté comme en échec. */
export const ENGINE_LOAD_TIMEOUT_MS = 25_000;

/**
 * Statut du moteur vu par l'interface : `"timeout"` quand le chargement
 * dépasse `ENGINE_LOAD_TIMEOUT_MS` (le provider, lui, attendrait sans fin).
 */
export function useEngineDisplayStatus(): { status: EngineStatus | "timeout"; errorMessage: string | null } {
  const { status, error } = useEngine();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setTimedOut(true), ENGINE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === "loading" && timedOut) return { status: "timeout", errorMessage: null };
  return { status, errorMessage: error?.message ?? null };
}

export const ENGINE_FAILURE_TEXT = {
  timeout: "Le moteur ne répond pas après 25 s. Recharge la page ; si le problème persiste, vérifie l'installation de Stockfish (dossier public/engine).",
  error: "Le moteur n'a pas pu démarrer.",
} as const;
