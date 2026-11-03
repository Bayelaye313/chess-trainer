import { DAYS_PER_WEEK, TOTAL_WEEKS } from "./phases";
import { dayKey, type ProgrammeDay, type ProgrammePuzzle } from "./types";

/**
 * Progression adaptative du Programme 1000 Heures — domaine pur.
 *
 * Trois mécanismes, tous décrits par le cahier des charges :
 *
 * 1. **Fenêtre de rating glissante.** Le taux de réussite (squelette ET
 *    solution corrects) est mesuré sur les `ROLLING_SESSIONS` dernières
 *    séances. Au-dessus de `RAISE_ABOVE`, le centre de la fenêtre monte de
 *    `RATING_STEP` ; sous `LOWER_BELOW`, il baisse d'autant. Le décalage reste
 *    dans ±`MAX_OFFSET` : au-delà, les puzzles vérifiés du jour (pool `puzzles`
 *    + `reserve`) ne couvrent plus la fenêtre.
 * 2. **Porte de rétention J+7.** Le jour 7 rejoue des puzzles de la semaine
 *    précédente. Sous `RETENTION_PASS`, la semaine est REJOUÉE avec des
 *    puzzles qu'on n'a pas encore vus, sur les mêmes concepts.
 * 3. **Interférence contextuelle.** L'échauffement et le jour 7 tirent leurs
 *    puzzles de jours ANTÉRIEURS à thèmes différents, alternés, plutôt que
 *    d'enchaîner le même thème en série.
 */

export const ROLLING_SESSIONS = 10;
export const RAISE_ABOVE = 0.75;
export const LOWER_BELOW = 0.5;
export const RATING_STEP = 50;
export const MAX_OFFSET = 200;
export const RETENTION_PASS = 0.7;
export const PUZZLES_PER_DAY = 6;

/** Résultat d'un puzzle dans une séance. */
export interface PuzzleOutcome {
  puzzleId: string;
  /** Le squelette désigné couvrait-il le pattern ? (voir `scoreSkeleton`) */
  skeletonOk: boolean;
  solved: boolean;
}

export interface SessionSummary {
  dayKey: string;
  /** Puzzles tentés dans la séance (blindfold compris). */
  attempted: number;
  /** Réussites complètes : squelette ET solution. */
  succeeded: number;
}

export function isFullSuccess(outcome: PuzzleOutcome): boolean {
  return outcome.skeletonOk && outcome.solved;
}

/** Taux de réussite cumulé des `ROLLING_SESSIONS` dernières séances (les plus récentes en fin de liste), `null` sans donnée. */
export function rollingSuccessRate(sessions: readonly SessionSummary[]): number | null {
  const window = sessions.slice(-ROLLING_SESSIONS);
  const attempted = window.reduce((sum, s) => sum + s.attempted, 0);
  if (attempted === 0) return null;
  return window.reduce((sum, s) => sum + s.succeeded, 0) / attempted;
}

/** Nouveau décalage de la fenêtre de rating après une séance. */
export function nextRatingOffset(currentOffset: number, sessions: readonly SessionSummary[]): number {
  const rate = rollingSuccessRate(sessions);
  if (rate === null) return currentOffset;
  let next = currentOffset;
  if (rate > RAISE_ABOVE) next += RATING_STEP;
  else if (rate < LOWER_BELOW) next -= RATING_STEP;
  return Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, next));
}

/**
 * Les puzzles de la séance : les plus proches de `elo_cible + offset` parmi le
 * pool vérifié du jour, en écartant ceux déjà vus (répétition de semaine).
 * Si le pool non vu ne suffit pas, on complète avec des puzzles déjà vus, les
 * plus anciens d'abord n'étant pas connus ici : par proximité de rating.
 */
export function selectDayPuzzles(
  day: Pick<ProgrammeDay, "elo_cible" | "puzzles" | "reserve">,
  offset: number,
  seen: ReadonlySet<string>,
  count = PUZZLES_PER_DAY,
): ProgrammePuzzle[] {
  const target = day.elo_cible + offset;
  const pool = [...day.puzzles, ...(day.reserve ?? [])];
  const byDistance = (a: ProgrammePuzzle, b: ProgrammePuzzle) =>
    Math.abs(a.rating_lichess - target) - Math.abs(b.rating_lichess - target) || a.puzzle_id.localeCompare(b.puzzle_id);
  const fresh = pool.filter((p) => !seen.has(p.puzzle_id)).sort(byDistance);
  const picked = fresh.slice(0, count);
  if (picked.length < count) {
    const stale = pool.filter((p) => seen.has(p.puzzle_id)).sort(byDistance);
    picked.push(...stale.slice(0, count - picked.length));
  }
  // Difficulté croissante dans la séance.
  return picked.sort((a, b) => a.rating_lichess - b.rating_lichess);
}

/**
 * Puzzles entrelacés : un par jour antérieur, en alternant les jours les plus
 * récents et les plus anciens (espacement), sans jamais reprendre le concept
 * du jour courant. Déterministe : même entrée, même sortie.
 */
export function interleavedReview(
  days: readonly ProgrammeDay[],
  current: { semaine: number; jour: number },
  count: number,
  exclude: ReadonlySet<string> = new Set(),
): ProgrammePuzzle[] {
  const currentIndex = (current.semaine - 1) * DAYS_PER_WEEK + current.jour;
  const currentDay = days.find((d) => d.semaine === current.semaine && d.jour === current.jour);
  const earlier = days
    .filter((d) => (d.semaine - 1) * DAYS_PER_WEEK + d.jour < currentIndex)
    .filter((d) => d.puzzles.length > 0 && d.metaphore_id !== currentDay?.metaphore_id)
    .sort((a, b) => b.semaine - a.semaine || b.jour - a.jour);
  // Alternance récent / ancien : 0, n-1, 1, n-2…
  const order: ProgrammeDay[] = [];
  for (let lo = 0, hi = earlier.length - 1; lo <= hi; lo += 1, hi -= 1) {
    order.push(earlier[lo]);
    if (hi !== lo) order.push(earlier[hi]);
  }
  const out: ProgrammePuzzle[] = [];
  for (const day of order) {
    if (out.length >= count) break;
    const candidate = [...day.puzzles].sort((a, b) => a.rating_lichess - b.rating_lichess).find((p) => !exclude.has(p.puzzle_id));
    if (candidate) out.push(candidate);
  }
  return out;
}

/** Jours dont le test de rétention du jour 7 de `semaine` rejoue les puzzles : la semaine d'avant, ou la semaine courante en semaine 1. */
export function retentionSourceDays(semaine: number): string[] {
  const source = semaine > 1 ? semaine - 1 : semaine;
  return Array.from({ length: DAYS_PER_WEEK - 1 }, (_, i) => dayKey(source, i + 1));
}

export function retentionPassed(outcomes: readonly PuzzleOutcome[]): boolean {
  if (outcomes.length === 0) return false;
  return outcomes.filter(isFullSuccess).length / outcomes.length >= RETENTION_PASS;
}

/** Position de l'utilisateur dans le programme. */
export interface ProgrammeCursor {
  semaine: number;
  jour: number;
  /** Nombre de fois que la semaine courante a été rejouée après un échec de rétention. */
  repetition: number;
}

export const PROGRAMME_START: ProgrammeCursor = { semaine: 1, jour: 1, repetition: 0 };

/**
 * Jour suivant après une séance terminée. Au jour 7, `retentionOk` décide :
 * semaine suivante, ou même semaine rejouée depuis le jour 1.
 */
export function advanceCursor(cursor: ProgrammeCursor, retentionOk?: boolean): ProgrammeCursor & { finished: boolean } {
  if (cursor.jour < DAYS_PER_WEEK) return { ...cursor, jour: cursor.jour + 1, finished: false };
  if (!retentionOk) return { semaine: cursor.semaine, jour: 1, repetition: cursor.repetition + 1, finished: false };
  if (cursor.semaine >= TOTAL_WEEKS) return { ...cursor, finished: true };
  return { semaine: cursor.semaine + 1, jour: 1, repetition: 0, finished: false };
}
