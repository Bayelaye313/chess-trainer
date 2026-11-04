/**
 * Limiteur de fréquence en mémoire, par clé (identifiant d'utilisateur) :
 * au plus `max` passages par fenêtre glissante de `windowMs`. L'état vit dans
 * le processus (serveur Node persistant, voir docs/auth/audit.md §5).
 */
export interface RateLimiter {
  /** Enregistre un passage si la limite le permet. */
  hit(key: string, now?: number): { ok: true } | { ok: false; retryAfterMs: number };
  reset(key?: string): void;
}

export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    hit(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return { ok: false, retryAfterMs: windowMs - (now - recent[0]) };
      }
      recent.push(now);
      hits.set(key, recent);
      // Ménage : une clé sans passage récent ne garde aucune mémoire.
      if (hits.size > 10_000) {
        for (const [other, list] of hits) if (list.every((at) => now - at >= windowMs)) hits.delete(other);
      }
      return { ok: true };
    },
    reset(key) {
      if (key === undefined) hits.clear();
      else hits.delete(key);
    },
  };
}
