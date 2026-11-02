"use client";

/**
 * Compatibilité : la logique de sondage vit désormais dans `SyncProvider`
 * (`sync-context.tsx`), monté une fois dans le layout racine.
 */
import { useSync } from "./sync-context";

export type { SyncNotification } from "./sync-context";

export function useSyncNotifier() {
  const { notification, dismiss } = useSync();
  return { notification, dismiss };
}
