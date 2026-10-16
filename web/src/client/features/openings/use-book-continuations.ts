"use client";

/**
 * Coups alternatifs théoriques depuis la position affichée — interroge la
 * base ECO server-only via `getBookContinuations` (server action) à chaque
 * changement de position, avec le même garde-fou par identifiant de requête
 * que les hooks d'évaluation moteur : une réponse en retard (position déjà
 * quittée) ne doit jamais s'appliquer.
 *
 * La liste précédente reste affichée pendant qu'une nouvelle arrive (aucune
 * remise à « loading » en tête d'effet) — comme `plyEval` dans
 * `use-post-solve-analysis.ts`, pour éviter un clignotement à chaque clic ET
 * le rendu en cascade que déclencherait un `setState` synchrone dans l'effet
 * (react-hooks/set-state-in-effect).
 */
import { useEffect, useRef, useState } from "react";
import { getBookContinuations } from "@/server/actions/openings";
import type { BookContinuation } from "@/server/queries/openings";

export type BookContinuationsState =
  | { status: "loading" }
  | { status: "ready"; continuations: BookContinuation[]; fen: string }
  /**
   * `fen` porté ici aussi, même raison que sur `"ready"` : sans lui, un
   * appelant qui a besoin de savoir si CETTE position précise a échoué (voir
   * `use-opening-drill.ts#continuationsFailed`, le filet de sécurité qui
   * évite au plateau de rester figé pour toujours sur une ligne rare — ex.
   * Zukertort, Défense Benima — dont la requête échoue) ne pouvait pas
   * distinguer « cette position a échoué » de « une position déjà quittée a
   * échoué, la nouvelle requête est encore en vol ».
   */
  | { status: "error"; fen: string };

export function useBookContinuations(fen: string): BookContinuationsState {
  const [state, setState] = useState<BookContinuationsState>({ status: "loading" });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    getBookContinuations(fen)
      .then((continuations) => {
        if (requestIdRef.current !== requestId) return;
        // `fen` porté par l'état « ready » — permet à un appelant qui a
        // besoin d'une fraîcheur stricte (voir `use-opening-drill.ts`, la
        // validation d'un coup) de vérifier que la liste correspond bien à
        // la position CE INSTANT, plutôt que de faire confiance à l'ancienne
        // liste encore affichée pendant qu'une nouvelle arrive (voir le
        // docstring du fichier).
        setState({ status: "ready", continuations, fen });
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setState({ status: "error", fen });
      });
  }, [fen]);

  return state;
}
