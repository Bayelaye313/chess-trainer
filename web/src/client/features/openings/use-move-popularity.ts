"use client";

/**
 * Fréquence humaine des coups depuis la position affichée (Lichess Opening
 * Explorer, via `getMovePopularity` — server action server-only, voir
 * `server/import/lichess-explorer.ts`) — même garde-fou de fraîcheur par
 * identifiant de requête que `use-book-continuations.ts` (le hook jumeau pour
 * la base ECO offline) : une réponse en retard (position déjà quittée) ne
 * doit jamais s'appliquer.
 *
 * Sert UNIQUEMENT à prioriser le coup de l'IA en Mode Entraînement
 * (`use-opening-drill.ts`, tirage pondéré) — jamais à valider un coup du
 * joueur, ce rôle reste à `useBookContinuations`. Un échec réseau (état
 * "ready" avec `moves: []`, ou "error") doit toujours dégrader vers le
 * tirage uniforme existant, jamais bloquer le drill.
 */
import { useEffect, useRef, useState } from "react";
import { getMovePopularity } from "@/server/actions/openings";
import type { PopularMove } from "@/server/import/lichess-explorer";

export type MovePopularityState =
  | { status: "loading" }
  | { status: "ready"; moves: PopularMove[]; fen: string }
  | { status: "error" };

export function useMovePopularity(fen: string): MovePopularityState {
  const [state, setState] = useState<MovePopularityState>({ status: "loading" });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    getMovePopularity(fen)
      .then((moves) => {
        if (requestIdRef.current !== requestId) return;
        setState({ status: "ready", moves, fen });
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setState({ status: "error" });
      });
  }, [fen]);

  return state;
}
