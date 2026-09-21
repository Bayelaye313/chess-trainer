"use client";

/**
 * Briefing théorique temps réel du nœud affiché (`philosophy`/
 * `strategicObjective`/`engineSuggestion`, voir `core/chess/pgn-tree.ts`) —
 * sert `OpeningCoachingPanel`. Même mécanique EXACTE que
 * `use-book-continuations.ts` (garde-fou de fraîcheur par identifiant de
 * requête, ancienne réponse affichée pendant qu'une nouvelle arrive) : une
 * seule position "vivante" à la fois côté React, jamais de rendu en cascade
 * (`fetch` server action, aucun `setState` synchrone dans l'effet).
 *
 * `openingId` fait partie de la clé de requête au même titre que `fen` : une
 * position peut transposer entre deux chapitres, mais le nom de sous-variante
 * affiché doit rester celui du chapitre COURAMMENT ouvert quand les deux
 * diffèrent (voir `getOpeningNodeBriefing`, qui privilégie déjà ce chapitre).
 */
import { useEffect, useRef, useState } from "react";
import { getOpeningCoachingBriefing } from "@/server/actions/openings";
import type { OpeningNodeBriefing } from "@/server/queries/openings";

export type OpeningCoachingBriefingState =
  | { status: "loading" }
  | { status: "ready"; briefing: OpeningNodeBriefing | null; fen: string }
  | { status: "error"; fen: string };

export function useOpeningCoachingBriefing(openingId: string, fen: string): OpeningCoachingBriefingState {
  const [state, setState] = useState<OpeningCoachingBriefingState>({ status: "loading" });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    getOpeningCoachingBriefing(openingId, fen)
      .then((briefing) => {
        if (requestIdRef.current !== requestId) return;
        setState({ status: "ready", briefing, fen });
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setState({ status: "error", fen });
      });
  }, [openingId, fen]);

  return state;
}
