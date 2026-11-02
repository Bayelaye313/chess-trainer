import { interleavedReview, PUZZLES_PER_DAY, retentionSourceDays, selectDayPuzzles } from "./adaptive";
import { dayKey, type ProgrammeDay, type ProgrammePuzzle } from "./types";

/**
 * Composition d'une séance : quels puzzles, dans quel rôle. Domaine pur — le
 * serveur fournit le contenu, le décalage de rating et l'historique ; cette
 * fonction décide.
 *
 * - jours 1–6 : `puzzle` (6, fenêtre adaptative, puzzles non vus d'abord —
 *   c'est ce qui donne des puzzles NEUFS quand une semaine est rejouée),
 *   `echauffement` (2 puzzles entrelacés de jours antérieurs, sous hack visuel) ;
 * - jour 7 : `retention` (un puzzle par jour de J-7, les ratés d'abord),
 *   `entrelace` (4 puzzles mélangés de toutes les semaines passées).
 */

export type PlannedRole = "puzzle" | "echauffement" | "retention" | "entrelace";

export interface PlannedPuzzle {
  role: PlannedRole;
  sourceDayKey: string;
  puzzle: ProgrammePuzzle;
}

export interface PastAttempt {
  puzzleId: string;
  sourceDayKey: string;
  success: boolean;
}

export const WARMUP_COUNT = 2;
export const INTERLEAVED_COUNT = 4;

export function planSession(
  days: readonly ProgrammeDay[],
  day: ProgrammeDay,
  ratingOffset: number,
  history: readonly PastAttempt[],
): PlannedPuzzle[] {
  const seen = new Set(history.map((h) => h.puzzleId));
  const keyOf = (d: ProgrammeDay) => dayKey(d.semaine, d.jour);
  const sourceOf = new Map<string, string>();
  for (const d of days) for (const p of [...d.puzzles, ...(d.reserve ?? [])]) sourceOf.set(p.puzzle_id, keyOf(d));
  const tag = (role: PlannedRole) => (p: ProgrammePuzzle): PlannedPuzzle => ({ role, sourceDayKey: sourceOf.get(p.puzzle_id) ?? keyOf(day), puzzle: p });

  if (day.jour !== 7) {
    const main = selectDayPuzzles(day, ratingOffset, seen, PUZZLES_PER_DAY).map(tag("puzzle"));
    const used = new Set(main.map((p) => p.puzzle.puzzle_id));
    const warmup = interleavedReview(days, day, WARMUP_COUNT, used).map(tag("echauffement"));
    // Tout début de programme : pas encore de jour antérieur, l'échauffement
    // prend les puzzles les plus faciles de la réserve du jour.
    if (warmup.length < WARMUP_COUNT) {
      const taken = new Set([...used, ...warmup.map((w) => w.puzzle.puzzle_id)]);
      const easiest = [...(day.reserve ?? [])].filter((p) => !taken.has(p.puzzle_id) && !seen.has(p.puzzle_id)).sort((a, b) => a.rating_lichess - b.rating_lichess);
      warmup.push(...easiest.slice(0, WARMUP_COUNT - warmup.length).map(tag("echauffement")));
    }
    return [...warmup, ...main];
  }

  // Jour 7 : test de rétention sur J-7. Les puzzles RATÉS de ces jours d'abord,
  // puis ceux réussis, puis (jamais joués) le plus facile du jour.
  const retention: PlannedPuzzle[] = [];
  for (const source of retentionSourceDays(day.semaine)) {
    const sourceDay = days.find((d) => keyOf(d) === source);
    if (!sourceDay || sourceDay.puzzles.length === 0) continue;
    const attempts = history.filter((h) => h.sourceDayKey === source);
    const pool = [...sourceDay.puzzles, ...(sourceDay.reserve ?? [])];
    const failed = attempts.find((a) => !a.success && pool.some((p) => p.puzzle_id === a.puzzleId));
    const succeeded = attempts.find((a) => a.success && pool.some((p) => p.puzzle_id === a.puzzleId));
    const chosenId = failed?.puzzleId ?? succeeded?.puzzleId;
    const chosen = pool.find((p) => p.puzzle_id === chosenId) ?? [...sourceDay.puzzles].sort((a, b) => a.rating_lichess - b.rating_lichess)[0];
    retention.push({ role: "retention", sourceDayKey: source, puzzle: chosen });
  }
  const used = new Set(retention.map((p) => p.puzzle.puzzle_id));
  const interleaved = interleavedReview(days, day, INTERLEAVED_COUNT, used).map(tag("entrelace"));
  return [...retention, ...interleaved];
}
