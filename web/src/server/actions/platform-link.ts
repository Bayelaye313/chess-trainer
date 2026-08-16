"use server";

import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { platformLinks, type PlatformLink } from "@/server/db/schema";
import { runSync } from "@/server/import/run-sync";
import type { SyncPlatform } from "@/server/import/sync-platforms";

// Réexporté : le client n'importe jamais directement de `server/db/*`.
export type { PlatformLink };

export interface LinkPlatformInput {
  source: SyncPlatform;
  username: string;
}

export type LinkPlatformResult = { link: PlatformLink } | { error: string };

/**
 * Lie un pseudo à une plateforme — une seule fois, comme demandé : relier de
 * nouveau la même plateforme remplace simplement le pseudo (upsert sur
 * `source`, clé primaire de `platform_links`), la synchro repart alors depuis
 * zéro pour ce nouveau compte.
 */
export async function linkPlatform(input: LinkPlatformInput): Promise<LinkPlatformResult> {
  const username = input.username.trim();
  if (!username) return { error: "Indique un pseudo." };
  if (input.source !== "chesscom" && input.source !== "lichess") {
    return { error: "Plateforme inconnue." };
  }

  const link: PlatformLink = {
    source: input.source,
    username,
    linkedAt: new Date(),
    lastSyncedAt: null,
    lastImportedPlayedAt: null,
  };

  await db
    .insert(platformLinks)
    .values(link)
    .onConflictDoUpdate({
      target: platformLinks.source,
      set: { username, linkedAt: link.linkedAt, lastSyncedAt: null, lastImportedPlayedAt: null },
    });

  // Non attendu à dessein : la page ne bloque pas sur l'historique complet
  // (potentiellement `INITIAL_SYNC_MAX_GAMES` parties à analyser), elle lance
  // juste la synchro immédiatement plutôt que d'attendre le sondage à 5 min
  // (`useSyncNotifier`). Un échec ici (réseau, plateforme en panne) n'empêche
  // pas le lien d'être posé — le prochain sondage réessaiera.
  void runSync().catch((cause) => {
    console.error("Synchro immédiate après liaison de compte en échec :", cause);
  });

  return { link };
}

export async function unlinkPlatform(source: SyncPlatform): Promise<void> {
  await db.delete(platformLinks).where(eq(platformLinks.source, source));
}

export async function listPlatformLinks(): Promise<PlatformLink[]> {
  return db.select().from(platformLinks);
}
