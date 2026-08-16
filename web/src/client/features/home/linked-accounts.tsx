"use client";

import { useEffect, useState } from "react";
import {
  linkPlatform,
  listPlatformLinks,
  unlinkPlatform,
  type PlatformLink,
} from "@/server/actions/platform-link";

const PLATFORMS: readonly { source: PlatformLink["source"]; label: string }[] = [
  { source: "chesscom", label: "Chess.com" },
  { source: "lichess", label: "Lichess" },
];

function formatSyncedAt(date: Date | null): string {
  if (!date) return "pas encore synchronisé";
  return `synchronisé ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date)}`;
}

/**
 * Lie une fois pour toutes un pseudo Chess.com/Lichess : la synchro en tâche
 * de fond (`use-sync-notifier.ts` → `/api/sync`) prend ensuite le relais
 * toute seule. `linkPlatform` déclenche en plus une synchro immédiate côté
 * serveur (voir `server/actions/platform-link.ts`) — inutile d'attendre le
 * prochain sondage pour voir apparaître les premières parties.
 *
 * Monté sur l'accueil (widget de connexion) et sur `/plus` (gestion / délier
 * = "déconnexion" du compte — l'app est mono-utilisateur locale, il n'y a pas
 * de session à déconnecter, voir `server/db/schema/platform-links.ts`).
 */
export function LinkedAccounts() {
  const [links, setLinks] = useState<PlatformLink[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<PlatformLink["source"] | null>(null);

  useEffect(() => {
    void listPlatformLinks().then(setLinks);
  }, []);

  async function refresh() {
    setLinks(await listPlatformLinks());
  }

  async function handleLink(source: PlatformLink["source"]) {
    const username = (drafts[source] ?? "").trim();
    if (!username) return;
    setPending(source);
    await linkPlatform({ source, username });
    setDrafts((prev) => ({ ...prev, [source]: "" }));
    await refresh();
    setPending(null);
  }

  async function handleUnlink(source: PlatformLink["source"]) {
    setPending(source);
    await unlinkPlatform(source);
    await refresh();
    setPending(null);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-sm font-semibold">Synchronisation automatique</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Lie ton pseudo une fois : les nouvelles parties sont détectées et analysées toutes seules en
        tâche de fond.
      </p>

      <div className="mt-4 space-y-3">
        {PLATFORMS.map(({ source, label }) => {
          const link = links.find((candidate) => candidate.source === source);
          const busy = pending === source;

          return (
            <div key={source} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-20 shrink-0 text-foreground-muted">{label}</span>
              {link ? (
                <>
                  <span className="font-medium">{link.username}</span>
                  <span className="text-xs text-foreground-muted">
                    ({formatSyncedAt(link.lastSyncedAt)})
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleUnlink(source)}
                    className="ml-auto rounded-md border border-border px-2.5 py-1 text-xs text-foreground-muted hover:text-foreground disabled:opacity-40"
                  >
                    Délier
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={drafts[source] ?? ""}
                    onChange={(event) =>
                      setDrafts((prev) => ({ ...prev, [source]: event.target.value }))
                    }
                    placeholder="ton-pseudo"
                    className="rounded-md border border-border bg-surface px-2.5 py-1"
                  />
                  <button
                    type="button"
                    disabled={busy || !(drafts[source] ?? "").trim()}
                    onClick={() => handleLink(source)}
                    className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground disabled:opacity-40"
                  >
                    Lier
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
