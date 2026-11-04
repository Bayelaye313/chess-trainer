/**
 * Clés localStorage / sessionStorage propres à chaque compte :
 * `chess-trainer:<userId>:<suite>`. Un autre compte connecté sur le même
 * navigateur ne lit donc jamais celles du précédent. Toutes les clés
 * `chess-trainer:*` sont effacées à la déconnexion (`clearAppStorage`).
 *
 * L'utilisateur courant est fixé par `<StorageScope>` (layout connecté) avant
 * le rendu des écrans. Sans utilisateur, rien n'est lu ni écrit.
 */
const PREFIX = "chess-trainer:";

let currentUserId: string | null = null;

export function setStorageUser(userId: string | null): void {
  currentUserId = userId;
}

export function storageUser(): string | null {
  return currentUserId;
}

/** "chess-trainer:solved-traps" → "chess-trainer:<userId>:solved-traps" (null sans utilisateur). */
export function userKey(baseKey: string): string | null {
  if (!currentUserId) return null;
  const suffix = baseKey.startsWith(PREFIX) ? baseKey.slice(PREFIX.length) : baseKey;
  return `${PREFIX}${currentUserId}:${suffix}`;
}

function storages(): Storage[] {
  if (typeof window === "undefined") return [];
  const list: Storage[] = [];
  try {
    list.push(window.localStorage, window.sessionStorage);
  } catch {
    // Stockage indisponible (navigation privée stricte) : rien à faire.
  }
  return list;
}

function keysOf(storage: Storage): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key) keys.push(key);
  }
  return keys;
}

/** Efface toutes les clés de l'application, quel que soit le compte (déconnexion, suppression). */
export function clearAppStorage(): void {
  for (const storage of storages()) {
    for (const key of keysOf(storage)) {
      if (key.startsWith(PREFIX)) storage.removeItem(key);
    }
  }
}

/**
 * Anciennes clés sans identifiant (époque mono-utilisateur). Elles reviennent au
 * compte qui hérite des données (`adoptLegacy`). Pour tout autre compte, elles
 * sont simplement supprimées.
 */
export function migrateLegacyKeys(userId: string, adoptLegacy: boolean): void {
  for (const storage of storages()) {
    for (const key of keysOf(storage)) {
      if (!key.startsWith(PREFIX)) continue;
      const rest = key.slice(PREFIX.length);
      // Clé déjà préfixée (par un identifiant UUID) : on n'y touche pas.
      if (/^[0-9a-f-]{36}:/.test(rest)) continue;
      const value = storage.getItem(key);
      storage.removeItem(key);
      if (adoptLegacy && value !== null) storage.setItem(`${PREFIX}${userId}:${rest}`, value);
    }
  }
}
