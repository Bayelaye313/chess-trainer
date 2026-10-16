"use client";

/**
 * Détecte en tâche de fond les nouvelles parties importées automatiquement
 * (comptes liés via `LinkedAccounts`, voir `server/actions/platform-link.ts`)
 * et prépare la notification correspondante.
 *
 * Sondage périodique de `/api/sync` plutôt qu'un flux temps réel (SSE/
 * WebSocket) : même choix que `useImport` — outil local mono-utilisateur, un
 * canal persistant serait disproportionné pour vérifier "y a-t-il du neuf ?"
 * toutes les quelques minutes.
 */
import { useEffect, useState } from "react";

/** Assez réactif pour un usage quotidien sans marteler les API publiques Chess.com/Lichess. */
const POLL_INTERVAL_MS = 5 * 60 * 1000;

export interface SyncNotification {
  message: string;
  gamesImported: number;
}

interface SyncApiResponse {
  totalGamesImported: number;
}

function buildMessage(): string {
  return "🎯 Nouvelles parties synchronisées ! Vos statistiques et vos decks FSRS ont été mis à jour.";
}

export function useSyncNotifier() {
  const [notification, setNotification] = useState<SyncNotification | null>(null);

  useEffect(() => {
    // Pattern "ignore flag" recommandé par React, comme useImport : le
    // setState arrive dans le .then(), jamais pendant l'exécution synchrone
    // du corps de l'effet ou d'une fonction async appelée depuis lui.
    let ignore = false;

    function poll() {
      fetch("/api/sync", { method: "POST" })
        .then((response) => (response.ok ? (response.json() as Promise<SyncApiResponse>) : null))
        .then((summary) => {
          if (ignore || !summary || summary.totalGamesImported <= 0) return;
          setNotification({
            message: buildMessage(),
            gamesImported: summary.totalGamesImported,
          });
        })
        .catch(() => {
          // Réseau ou API externe indisponible : on retentera au prochain sondage, en silence.
        });
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  function dismiss() {
    setNotification(null);
  }

  return { notification, dismiss };
}
