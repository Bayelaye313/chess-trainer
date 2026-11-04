"use server";

import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import type { PlatformLink } from "@/server/db/schema";
import { platformLinks, userScope } from "@/server/db/user-scope";
import { requireUser } from "@/server/auth/session";
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
 * `(user_id, source)`, unique dans `platform_links`), la synchro repart alors
 * depuis zéro pour ce nouveau compte. Les comptes liés sont propres à chaque
 * utilisateur.
 */
export async function linkPlatform(input: LinkPlatformInput): Promise<LinkPlatformResult> {
  const user = await requireUser();
  const s = userScope(user.id);
  const username = input.username.trim();
  if (!username) return { error: "Indique un pseudo." };
  if (input.source !== "chesscom" && input.source !== "lichess") {
    return { error: "Plateforme inconnue." };
  }

  const link: PlatformLink = {
    userId: user.id,
    source: input.source,
    username,
    linkedAt: new Date(),
    lastSyncedAt: null,
    lastImportedPlayedAt: null,
  };

  await db
    .insert(platformLinks)
    .values(s.own(link))
    .onConflictDoUpdate({
      target: [platformLinks.userId, platformLinks.source],
      set: { username, linkedAt: link.linkedAt, lastSyncedAt: null, lastImportedPlayedAt: null },
    });

  // Non attendu à dessein : la page ne bloque pas sur l'historique complet
  // (potentiellement `INITIAL_SYNC_MAX_GAMES` parties à analyser), elle lance
  // juste la synchro immédiatement plutôt que d'attendre le sondage à 5 min
  // (`useSyncNotifier`). Un échec ici (réseau, plateforme en panne) n'empêche
  // pas le lien d'être posé — le prochain sondage réessaiera.
  void runSync(user.id).catch((cause) => {
    console.error("Synchro immédiate après liaison de compte en échec :", cause);
  });

  return { link };
}

export async function unlinkPlatform(source: SyncPlatform): Promise<void> {
  const s = userScope((await requireUser()).id);
  await db.delete(platformLinks).where(s.where(platformLinks, eq(platformLinks.source, source)));
}

export async function listPlatformLinks(): Promise<PlatformLink[]> {
  const s = userScope((await requireUser()).id);
  return db.select().from(platformLinks).where(s.owns(platformLinks));
}
