/** Formats de l'espace admin (fuseau UTC fixe : rendu serveur = rendu client). */
const DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const DATE_TIME = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
const DAY_SHORT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

export function formatDate(date: Date | string | null | undefined): string {
  return date ? DATE.format(new Date(date)) : "—";
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return date ? `${DATE_TIME.format(new Date(date))} UTC` : "—";
}

/** "2026-11-04" → "4 nov." */
export function formatDay(day: string): string {
  return DAY_SHORT.format(new Date(`${day}T00:00:00.000Z`));
}

/** 3725 → "1 h 02", 125 → "2 min", 0 → "0 min" */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}
