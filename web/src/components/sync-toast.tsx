"use client";

import { Toast } from "@/components/ui/toast";
import { useSyncNotifier } from "@/client/features/sync/use-sync-notifier";

/** Point de montage unique (layout racine) du sondage de synchro et de sa notification. */
export function SyncToast() {
  const { notification, dismiss } = useSyncNotifier();
  if (!notification) return null;
  return <Toast message={notification.message} onDismiss={dismiss} />;
}
