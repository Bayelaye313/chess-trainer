/**
 * Cadence lisible depuis le tag PGN `TimeControl` ("600+5" = 600 s de base,
 * 5 s d'incrément — format standard PGN, commun à Lichess et Chess.com).
 * `null` = partie locale contre le moteur, jouée sans horloge.
 *
 * Seuils calqués sur Lichess (durée estimée = base + 40 × incrément, en
 * secondes) : mêmes noms de cadence qu'un joueur retrouverait sur la
 * plateforme d'origine.
 */
export function formatTimeControl(raw: string | null): string {
  if (!raw) return "Illimité";

  const match = /^(\d+)(?:\+(\d+))?$/.exec(raw.trim());
  if (!match) return raw;

  const base = Number(match[1]);
  const increment = Number(match[2] ?? 0);
  const estimatedSeconds = base + 40 * increment;

  const baseMinutes = Math.round(base / 60);
  const label = `${baseMinutes >= 1 ? baseMinutes : Math.round((base / 60) * 10) / 10}+${increment}`;

  if (estimatedSeconds < 180) return `Bullet ${label}`;
  if (estimatedSeconds < 480) return `Blitz ${label}`;
  if (estimatedSeconds < 1500) return `Rapide ${label}`;
  return `Classique ${label}`;
}
