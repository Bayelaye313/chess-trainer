/**
 * Date relative façon flux d'activité ("il y a 2 h", "hier") — pour le fil
 * "Parties récentes" de l'accueil et de `/analyse`. Pas de dépendance externe
 * (`Intl.RelativeTimeFormat` est supporté nativement) : un format absolu
 * (`toLocaleDateString`) reste utilisé ailleurs (`/analyse/[id]`) où la date
 * précise compte davantage que la fraîcheur.
 */
const RTF = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

const UNITS: readonly { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
];

export function formatRelativeDate(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < 60_000) return "à l'instant";

  for (const { unit, ms } of UNITS) {
    if (absMs >= ms) {
      return RTF.format(Math.round(diffMs / ms), unit);
    }
  }

  return RTF.format(Math.round(diffMs / 60_000), "minute");
}
