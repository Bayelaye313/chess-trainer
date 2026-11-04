/**
 * Définitions de la présence et des statistiques d'usage, en fonctions pures.
 *
 * - « En ligne » : dernier battement il y a MOINS de 2 minutes.
 * - « Actif » sur une période : au moins 60 secondes actives cumulées sur la période.
 * - DAU = aujourd'hui (jour UTC), WAU = 7 jours glissants, MAU = 30 jours glissants
 *   (aujourd'hui compris).
 * - « Sessions actives » : lignes de `sessions` non expirées.
 * - Temps actif : chaque battement (toutes les 60 s, onglet visible) crédite le
 *   temps écoulé depuis le précédent, plafonné à 60 s. Un battement qui arrive
 *   plus de 2 minutes après le précédent ouvre une nouvelle session d'usage et
 *   ne crédite rien.
 */
export const HEARTBEAT_INTERVAL_MS = 60_000;
export const ONLINE_WINDOW_MS = 2 * 60_000;
export const ACTIVE_THRESHOLD_SECONDS = 60;
export const MAX_CREDIT_SECONDS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Sections déclarées par le client : jamais d'URL, seulement l'une de ces valeurs. */
export const PRESENCE_SECTIONS = ["aujourdhui", "jouer", "ouvertures", "entrainer", "progres", "programme", "reglages", "admin", "autre"] as const;
export type PresenceSection = (typeof PRESENCE_SECTIONS)[number];

export const SECTION_LABELS: Record<PresenceSection, string> = {
  aujourdhui: "Aujourd'hui",
  jouer: "Jouer",
  ouvertures: "Ouvertures",
  entrainer: "S'entraîner",
  progres: "Progrès",
  programme: "Programme",
  reglages: "Réglages",
  admin: "Administration",
  autre: "Autre",
};

const SECTION_PREFIXES: [string, PresenceSection][] = [
  ["/jouer", "jouer"],
  ["/ouvertures", "ouvertures"],
  ["/entrainer", "entrainer"],
  ["/apprendre", "entrainer"],
  ["/pieges", "entrainer"],
  ["/rapport", "progres"],
  ["/parties", "progres"],
  ["/analyse", "progres"],
  ["/programme", "programme"],
  ["/plus", "reglages"],
  ["/admin", "admin"],
];

/** Chemin → section (côté client, avant l'envoi : l'URL ne quitte jamais le navigateur). */
export function sectionOfPath(pathname: string): PresenceSection {
  if (pathname === "/") return "aujourdhui";
  for (const [prefix, section] of SECTION_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return section;
  }
  return "autre";
}

export function parseSection(raw: unknown): PresenceSection | null {
  return typeof raw === "string" && (PRESENCE_SECTIONS as readonly string[]).includes(raw) ? (raw as PresenceSection) : null;
}

export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Les `count` jours UTC qui finissent aujourd'hui, du plus ancien au plus récent. */
export function lastDays(now: Date, count: number): string[] {
  const today = Date.parse(`${utcDay(now)}T00:00:00.000Z`);
  return Array.from({ length: count }, (_, i) => utcDay(new Date(today - (count - 1 - i) * DAY_MS)));
}

export function isOnline(lastSeenAt: Date | null | undefined, now: Date): boolean {
  if (!lastSeenAt) return false;
  const age = now.getTime() - lastSeenAt.getTime();
  return age >= 0 && age < ONLINE_WINDOW_MS;
}

export function isActive(activeSeconds: number): boolean {
  return activeSeconds >= ACTIVE_THRESHOLD_SECONDS;
}

export interface HeartbeatCredit {
  /** Secondes à ajouter au jour UTC de `now`. */
  seconds: number;
  /** Vrai si ce battement ouvre une nouvelle session d'usage. */
  newSession: boolean;
}

export function creditHeartbeat(previousSeenAt: Date | null | undefined, now: Date): HeartbeatCredit {
  if (!previousSeenAt) return { seconds: 0, newSession: true };
  const elapsedMs = now.getTime() - previousSeenAt.getTime();
  if (elapsedMs < 0) return { seconds: 0, newSession: false };
  if (elapsedMs >= ONLINE_WINDOW_MS) return { seconds: 0, newSession: true };
  return { seconds: Math.min(MAX_CREDIT_SECONDS, Math.round(elapsedMs / 1000)), newSession: false };
}

export interface ActivityRow {
  userId: string;
  day: string;
  activeSeconds: number;
}

/** Secondes actives cumulées par utilisateur sur les jours donnés. */
export function secondsByUser(rows: readonly ActivityRow[], days: readonly string[]): Map<string, number> {
  const inRange = new Set(days);
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (!inRange.has(row.day)) continue;
    totals.set(row.userId, (totals.get(row.userId) ?? 0) + row.activeSeconds);
  }
  return totals;
}

/** Utilisateurs actifs (≥ 60 s cumulées) sur la période. */
export function activeUsers(rows: readonly ActivityRow[], days: readonly string[]): Set<string> {
  const active = new Set<string>();
  for (const [userId, seconds] of secondsByUser(rows, days)) if (isActive(seconds)) active.add(userId);
  return active;
}

export interface ActiveCounts {
  dau: number;
  wau: number;
  mau: number;
}

export function activeCounts(rows: readonly ActivityRow[], now: Date): ActiveCounts {
  return {
    dau: activeUsers(rows, lastDays(now, 1)).size,
    wau: activeUsers(rows, lastDays(now, 7)).size,
    mau: activeUsers(rows, lastDays(now, 30)).size,
  };
}

export interface DayPoint {
  day: string;
  value: number;
}

/** Utilisateurs actifs CHAQUE jour (≥ 60 s ce jour-là), sur les `count` derniers jours. */
export function activeUsersPerDay(rows: readonly ActivityRow[], now: Date, count = 30): DayPoint[] {
  return lastDays(now, count).map((day) => ({ day, value: activeUsers(rows, [day]).size }));
}

export function signupsPerDay(createdAt: readonly Date[], now: Date, count = 30): DayPoint[] {
  const perDay = new Map<string, number>();
  for (const date of createdAt) perDay.set(utcDay(date), (perDay.get(utcDay(date)) ?? 0) + 1);
  return lastDays(now, count).map((day) => ({ day, value: perDay.get(day) ?? 0 }));
}

/** Temps actif moyen (secondes) par utilisateur ACTIF sur la période ; 0 sans actif. */
export function averageActiveSeconds(rows: readonly ActivityRow[], days: readonly string[]): number {
  const active = [...secondsByUser(rows, days).values()].filter(isActive);
  return active.length === 0 ? 0 : Math.round(active.reduce((sum, s) => sum + s, 0) / active.length);
}

export interface RetentionResult {
  /** Inscrits depuis au moins 7 jours. */
  cohort: number;
  /** Parmi eux, ceux revenus au moins une fois à partir de J+1 (J = jour d'inscription). */
  returned: number;
  /** returned / cohort, entre 0 et 1 ; `null` sans cohorte. */
  rate: number | null;
}

export function retention(users: readonly { id: string; createdAt: Date }[], rows: readonly ActivityRow[], now: Date): RetentionResult {
  const cutoff = now.getTime() - 7 * DAY_MS;
  const cohort = users.filter((user) => user.createdAt.getTime() <= cutoff);
  const daysByUser = new Map<string, string[]>();
  for (const row of rows) {
    if (row.activeSeconds <= 0) continue;
    const list = daysByUser.get(row.userId) ?? [];
    list.push(row.day);
    daysByUser.set(row.userId, list);
  }
  const returned = cohort.filter((user) => {
    const nextDay = utcDay(new Date(Date.parse(`${utcDay(user.createdAt)}T00:00:00.000Z`) + DAY_MS));
    return (daysByUser.get(user.id) ?? []).some((day) => day >= nextDay);
  }).length;
  return { cohort: cohort.length, returned, rate: cohort.length === 0 ? null : returned / cohort.length };
}

export interface PresenceRow {
  userId: string;
  lastSeenAt: Date;
  currentSection: string;
}

/** Utilisateurs en ligne par section, dans l'ordre de `PRESENCE_SECTIONS`, sections vides omises. */
export function onlineBySection(rows: readonly PresenceRow[], now: Date): { section: PresenceSection; count: number }[] {
  const counts = new Map<PresenceSection, number>();
  for (const row of rows) {
    if (!isOnline(row.lastSeenAt, now)) continue;
    const section = parseSection(row.currentSection) ?? "autre";
    counts.set(section, (counts.get(section) ?? 0) + 1);
  }
  return PRESENCE_SECTIONS.filter((section) => counts.has(section)).map((section) => ({ section, count: counts.get(section)! }));
}

export function isSessionActive(expires: Date, now: Date): boolean {
  return expires.getTime() > now.getTime();
}
