"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Clock, TriangleAlert } from "lucide-react";
import {
  linkPlatform,
  listPlatformLinks,
  unlinkPlatform,
  type PlatformLink,
} from "@/server/actions/platform-link";
import { useSync } from "@/client/features/sync/sync-context";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

const PLATFORMS: readonly { source: PlatformLink["source"]; label: string }[] = [
  { source: "chesscom", label: "Chess.com" },
  { source: "lichess", label: "Lichess" },
];

const DATE_TIME = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

/**
 * Lie une fois pour toutes un pseudo Chess.com/Lichess : la synchro en tâche
 * de fond (`SyncProvider` → `/api/sync`) prend ensuite le relais. Monté dans
 * Réglages uniquement (l'accueil n'en garde qu'une pastille d'en-tête).
 * Les erreurs sont visibles : refus de la liaison, et échec de synchro du
 * pseudo remonté par `/api/sync` (pseudo inexistant, plateforme en panne).
 */
export function LinkedAccounts() {
  const { platformErrors, syncNow, state } = useSync();
  const [links, setLinks] = useState<PlatformLink[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<PlatformLink["source"] | null>(null);
  const [errors, setErrors] = useState<Partial<Record<PlatformLink["source"], string>>>({});
  const [loadError, setLoadError] = useState(false);
  const stamp = state.status === "ok" || state.status === "error" ? state.at.getTime() : 0;

  useEffect(() => {
    listPlatformLinks()
      .then((found) => {
        setLinks(found);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, [stamp]);

  async function refresh() {
    setLinks(await listPlatformLinks());
  }

  async function handleLink(source: PlatformLink["source"]) {
    const username = (drafts[source] ?? "").trim();
    if (!username) return;
    setPending(source);
    setErrors((prev) => ({ ...prev, [source]: undefined }));
    try {
      const result = await linkPlatform({ source, username });
      if ("error" in result) {
        setErrors((prev) => ({ ...prev, [source]: result.error }));
      } else {
        setDrafts((prev) => ({ ...prev, [source]: "" }));
        await refresh();
        // La liaison lance déjà une synchro côté serveur ; ce sondage remonte
        // son éventuel échec (pseudo inexistant) dans l'interface.
        setTimeout(syncNow, 4000);
      }
    } catch {
      setErrors((prev) => ({ ...prev, [source]: "Liaison impossible : le serveur ne répond pas. Réessaie." }));
    } finally {
      setPending(null);
    }
  }

  async function handleUnlink(source: PlatformLink["source"]) {
    setPending(source);
    try {
      await unlinkPlatform(source);
      await refresh();
    } catch {
      setErrors((prev) => ({ ...prev, [source]: "Impossible de délier ce compte. Réessaie." }));
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      {loadError && <p className="mb-3 text-sm text-danger">Impossible de lire les comptes liés.</p>}
      <ul className="divide-y divide-border">
        {PLATFORMS.map(({ source, label }) => {
          const link = links.find((candidate) => candidate.source === source);
          const busy = pending === source;
          const syncError = platformErrors.find((candidate) => candidate.source === source && candidate.username === link?.username);
          const error = errors[source] ?? (syncError ? `Synchronisation de « ${syncError.username} » en échec : ${syncError.error}` : undefined);
          const inputId = `pseudo-${source}`;

          return (
            <li key={source} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="w-24 shrink-0 font-medium">{label}</span>
                {link ? (
                  <>
                    <span className="font-mono text-sm">{link.username}</span>
                    {syncError ? (
                      <Chip icon={TriangleAlert} tone="danger">Échec</Chip>
                    ) : (
                      link.lastSyncedAt ? (
                        <Chip icon={CircleCheck} tone="success">
                          Synchronisé le {DATE_TIME.format(new Date(link.lastSyncedAt))}
                        </Chip>
                      ) : (
                        <Chip icon={Clock} tone="neutral">En attente de synchro</Chip>
                      )
                    )}
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleUnlink(source)} className="ml-auto">
                      Délier
                    </Button>
                  </>
                ) : (
                  <form
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleLink(source);
                    }}
                  >
                    <label htmlFor={inputId} className="sr-only">
                      Pseudo {label}
                    </label>
                    <input
                      id={inputId}
                      type="text"
                      autoComplete="off"
                      value={drafts[source] ?? ""}
                      onChange={(event) => setDrafts((prev) => ({ ...prev, [source]: event.target.value }))}
                      placeholder={`Ton pseudo ${label}`}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${inputId}-erreur` : undefined}
                      className="min-h-11 min-w-0 flex-1 rounded-md border border-border-strong bg-background px-3 text-sm placeholder:text-foreground-subtle focus:border-accent focus:outline-none"
                    />
                    <Button type="submit" variant="primary" disabled={busy || !(drafts[source] ?? "").trim()}>
                      {busy ? "Liaison…" : "Lier"}
                    </Button>
                  </form>
                )}
              </div>
              {error && (
                <p id={`${inputId}-erreur`} role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-danger">
                  <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {error}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
