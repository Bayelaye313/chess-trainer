"use client";

/**
 * État de la synchronisation des comptes liés, partagé par toute l'app :
 * sondage de `/api/sync` (au chargement puis toutes les 5 min), toast des
 * nouvelles parties, pastille d'en-tête et erreurs par plateforme (Réglages).
 *
 * Remplace le `catch` silencieux d'origine : un échec réseau ou une
 * plateforme en erreur reste désormais visible (pastille + Réglages).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** Assez réactif pour un usage quotidien sans marteler les API publiques Chess.com/Lichess. */
const POLL_INTERVAL_MS = 5 * 60 * 1000;

export interface SyncNotification {
  message: string;
  gamesImported: number;
}

export interface PlatformSyncError {
  source: "chesscom" | "lichess";
  username: string;
  error: string;
}

export type SyncState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "ok"; at: Date }
  | { status: "error"; at: Date; message: string };

interface SyncApiResponse {
  skipped?: boolean;
  totalGamesImported: number;
  results?: { source: "chesscom" | "lichess"; username: string; error?: string }[];
}

interface SyncContextValue {
  state: SyncState;
  platformErrors: readonly PlatformSyncError[];
  notification: SyncNotification | null;
  dismiss: () => void;
  syncNow: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

function buildMessage(count: number): string {
  return count > 1
    ? `${count} nouvelles parties synchronisées : tes statistiques et tes révisions sont à jour.`
    : "1 nouvelle partie synchronisée : tes statistiques et tes révisions sont à jour.";
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SyncState>({ status: "idle" });
  const [platformErrors, setPlatformErrors] = useState<PlatformSyncError[]>([]);
  const [notification, setNotification] = useState<SyncNotification | null>(null);
  const mounted = useRef(true);

  const poll = useCallback(() => {
    setState((current) => (current.status === "idle" ? { status: "running" } : current));
    fetch("/api/sync", { method: "POST" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<SyncApiResponse>;
      })
      .then((summary) => {
        if (!mounted.current) return;
        const errors = (summary.results ?? [])
          .filter((result): result is PlatformSyncError => typeof result.error === "string")
          .map(({ source, username, error }) => ({ source, username, error }));
        setPlatformErrors(errors);
        setState(
          errors.length > 0
            ? { status: "error", at: new Date(), message: "Une plateforme n'a pas pu être synchronisée." }
            : { status: "ok", at: new Date() },
        );
        if (summary.totalGamesImported > 0) {
          setNotification({ message: buildMessage(summary.totalGamesImported), gamesImported: summary.totalGamesImported });
        }
      })
      .catch(() => {
        if (!mounted.current) return;
        setState({ status: "error", at: new Date(), message: "Synchronisation impossible : serveur ou réseau indisponible." });
      });
  }, []);

  useEffect(() => {
    mounted.current = true;
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [poll]);

  const value = useMemo<SyncContextValue>(
    () => ({ state, platformErrors, notification, dismiss: () => setNotification(null), syncNow: poll }),
    [state, platformErrors, notification, poll],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync() doit être utilisé dans un <SyncProvider>.");
  return context;
}
