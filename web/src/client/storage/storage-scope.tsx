"use client";

import { useEffect } from "react";
import { migrateLegacyKeys, setStorageUser } from "./user-storage";

/**
 * Fixe le compte courant pour `userKey()` AVANT le rendu des écrans (appel
 * synchrone, idempotent), puis traite une fois les anciennes clés sans préfixe.
 */
export function StorageScope({ userId, adoptLegacy }: { userId: string; adoptLegacy: boolean }) {
  setStorageUser(userId);
  useEffect(() => {
    migrateLegacyKeys(userId, adoptLegacy);
  }, [userId, adoptLegacy]);
  return null;
}
