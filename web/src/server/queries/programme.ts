import "server-only";

/**
 * Programme 1000 Heures — lecture et écriture de la progression.
 *
 * Le contenu vient du JSON vérifié (`server/programme/content.ts`), les choix
 * adaptatifs du domaine pur (`core/programme/adaptive.ts`, `session-plan.ts`).
 * Ici, seulement la persistance et l'assemblage.
 */
import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import {
  advanceCursor,
  isFullSuccess,
  isPhaseFinalWeek,
  nextRatingOffset,
  PHASE_PASS,
  phaseReview,
  PROGRAMME_START,
  retentionPassed as retentionGate,
  rollingSuccessRate,
  type SessionSummary,
} from "@/core/programme/adaptive";
import type {
  CompleteProgrammeSessionInput,
  ProgrammeOverview,
  ProgrammeSessionOutcome,
  ProgrammeSessionPayload,
  RecordProgrammeResultInput,
  SessionPuzzle,
} from "@/core/programme/dto";
import { getMetaphor, type Metaphor } from "@/core/programme/metaphors";
import { MINUTES_PER_DAY, PHASES, phaseOfWeek } from "@/core/programme/phases";
import { planSession, type PastAttempt } from "@/core/programme/session-plan";
import { dayKey, type ProgrammePuzzle } from "@/core/programme/types";
import { getVisualHack } from "@/core/programme/visual-hacks";
import { db } from "@/server/db";
import { games, programmePuzzleResults, programmeSessions, programmeState } from "@/server/db/schema";
import { ALL_DAYS, findDay } from "@/server/programme/content";
import { LOCAL_USER_ID } from "@/server/queries/curriculum";

async function ensureState(userId: string) {
  const [row] = await db.select().from(programmeState).where(eq(programmeState.userId, userId)).limit(1);
  if (row) return row;
  const now = new Date();
  const fresh = { userId, semaine: PROGRAMME_START.semaine, jour: PROGRAMME_START.jour, repetition: 0, ratingOffset: 0, startedAt: now, updatedAt: now };
  await db.insert(programmeState).values(fresh);
  return fresh;
}

/** Hook profil : Elo actuel = classement noté le plus récent dans les parties importées. */
async function currentElo(): Promise<number | null> {
  const [row] = await db
    .select({ rating: games.playerRating })
    .from(games)
    .where(isNotNull(games.playerRating))
    .orderBy(desc(games.playedAt))
    .limit(1);
  return row?.rating ?? null;
}

async function completedSummaries(userId: string): Promise<SessionSummary[]> {
  const rows = await db
    .select({ dayKey: programmeSessions.dayKey, attempted: programmeSessions.attempted, succeeded: programmeSessions.succeeded })
    .from(programmeSessions)
    .where(and(eq(programmeSessions.userId, userId), eq(programmeSessions.status, "completed")))
    .orderBy(asc(programmeSessions.completedAt));
  return rows;
}

async function pastAttempts(userId: string): Promise<PastAttempt[]> {
  const rows = await db
    .select({ puzzleId: programmePuzzleResults.puzzleId, sourceDayKey: programmePuzzleResults.sourceDayKey, skeletonOk: programmePuzzleResults.skeletonOk, solved: programmePuzzleResults.solved })
    .from(programmePuzzleResults)
    .where(eq(programmePuzzleResults.userId, userId))
    .orderBy(asc(programmePuzzleResults.occurredAt));
  return rows.map((r) => ({ puzzleId: r.puzzleId, sourceDayKey: r.sourceDayKey, success: isFullSuccess(r) }));
}

export async function getProgrammeOverview(userId: string = LOCAL_USER_ID): Promise<ProgrammeOverview> {
  const state = await ensureState(userId);
  const phase = phaseOfWeek(state.semaine);
  const today = findDay(state.semaine, state.jour);
  const summaries = await completedSummaries(userId);
  const sessions = await db
    .select({ id: programmeSessions.id, dayKey: programmeSessions.dayKey, status: programmeSessions.status, repetition: programmeSessions.repetition, startedAt: programmeSessions.startedAt })
    .from(programmeSessions)
    .where(eq(programmeSessions.userId, userId))
    .orderBy(asc(programmeSessions.startedAt));

  const doneKeys = new Set(sessions.filter((s) => s.status === "completed" && s.repetition === state.repetition).map((s) => s.dayKey));
  const inProgress = sessions.findLast((s) => s.status === "in_progress" && s.dayKey === dayKey(state.semaine, state.jour) && s.repetition === state.repetition);

  // Bibliothèque personnelle : chaque lieu visité (jour de concept terminé), dans l'ordre de première visite.
  const visits = new Map<string, { firstDayKey: string; visits: number }>();
  for (const s of sessions.filter((x) => x.status === "completed")) {
    const [, w, d] = /^S(\d+)J(\d)$/.exec(s.dayKey) ?? [];
    const day = findDay(Number(w), Number(d));
    if (!day) continue;
    for (const id of [day.metaphore_id, ...(day.cours_palais_memoire.rappels ?? [])]) {
      const entry = visits.get(id);
      if (entry) entry.visits += 1;
      else if (id === day.metaphore_id) visits.set(id, { firstDayKey: s.dayKey, visits: 1 });
    }
  }

  return {
    semaine: state.semaine,
    jour: state.jour,
    repetition: state.repetition,
    ratingOffset: state.ratingOffset,
    phaseTitre: phase.titre,
    phaseId: phase.id,
    finished: false,
    contentMissing: today === null,
    today: today ? { theme_metaphore: today.theme_metaphore, concept_echiquéen: today.concept_echiquéen, elo_cible: today.elo_cible } : null,
    stats: {
      rollingSuccess: rollingSuccessRate(summaries),
      completedSessions: summaries.length,
      hoursDone: Math.round((summaries.length * MINUTES_PER_DAY) / 60),
      currentElo: await currentElo(),
    },
    week: Array.from({ length: 7 }, (_, i) => {
      const d = findDay(state.semaine, i + 1);
      return { jour: i + 1, theme: d?.theme_metaphore ?? "—", concept: d?.concept_echiquéen ?? "", done: doneKeys.has(dayKey(state.semaine, i + 1)) };
    }),
    library: [...visits.entries()].map(([id, v]) => ({ ...getMetaphor(id), ...v })),
    inProgressSessionId: inProgress?.id ?? null,
    phases: PHASES.map((p) => ({
      index: p.index,
      titre: p.titre,
      eloDebut: p.eloDebut,
      eloFin: p.eloFin,
      semaineDebut: p.semaineDebut,
      semaineFin: p.semaineFin,
      joursGeneres: ALL_DAYS.filter((d) => d.semaine >= p.semaineDebut && d.semaine <= p.semaineFin).length,
      status: p.index < phase.index ? "validee" : p.index === phase.index ? "en_cours" : "verrouillee",
    })),
  };
}

function puzzleIndex(): Map<string, ProgrammePuzzle> {
  const index = new Map<string, ProgrammePuzzle>();
  for (const d of ALL_DAYS) for (const p of [...d.puzzles, ...(d.reserve ?? [])]) index.set(p.puzzle_id, p);
  return index;
}

/** Démarre la séance du jour courant, ou reprend celle déjà ouverte (mêmes puzzles). */
export async function startOrResumeSession(userId: string = LOCAL_USER_ID): Promise<ProgrammeSessionPayload | null> {
  const state = await ensureState(userId);
  const day = findDay(state.semaine, state.jour);
  if (!day) return null;
  const key = dayKey(state.semaine, state.jour);

  const [open] = await db
    .select()
    .from(programmeSessions)
    .where(and(eq(programmeSessions.userId, userId), eq(programmeSessions.dayKey, key), eq(programmeSessions.repetition, state.repetition), eq(programmeSessions.status, "in_progress")))
    .orderBy(desc(programmeSessions.startedAt))
    .limit(1);

  let sessionId: string;
  let puzzles: SessionPuzzle[];
  let offset: number;
  if (open) {
    sessionId = open.id;
    offset = open.ratingOffset;
    const index = puzzleIndex();
    puzzles = Object.entries(open.plan).flatMap(([role, entries]) =>
      entries.flatMap((entry) => {
        const [puzzleId, sourceDayKey] = entry.split("@");
        const puzzle = index.get(puzzleId);
        return puzzle ? [{ role: role as SessionPuzzle["role"], sourceDayKey, puzzle }] : [];
      }),
    );
  } else {
    offset = state.ratingOffset;
    puzzles = planSession(ALL_DAYS, day, offset, await pastAttempts(userId));
    const plan: Record<string, string[]> = {};
    for (const p of puzzles) (plan[p.role] ??= []).push(`${p.puzzle.puzzle_id}@${p.sourceDayKey}`);
    sessionId = crypto.randomUUID();
    await db.insert(programmeSessions).values({
      id: sessionId,
      userId,
      dayKey: key,
      semaine: state.semaine,
      jour: state.jour,
      repetition: state.repetition,
      ratingOffset: offset,
      plan,
      status: "in_progress",
      startedAt: new Date(),
    });
  }

  const done = await db
    .select({ puzzleId: programmePuzzleResults.puzzleId, role: programmePuzzleResults.role, skeletonOk: programmePuzzleResults.skeletonOk, solved: programmePuzzleResults.solved })
    .from(programmePuzzleResults)
    .where(eq(programmePuzzleResults.sessionId, sessionId));

  const rappels: Metaphor[] = (day.cours_palais_memoire.rappels ?? []).map(getMetaphor);
  return {
    sessionId,
    dayKey: key,
    semaine: day.semaine,
    jour: day.jour,
    repetition: state.repetition,
    phaseId: day.phase,
    effectiveTarget: day.elo_cible + offset,
    ratingOffset: offset,
    theme_metaphore: day.theme_metaphore,
    concept: day.concept_echiquéen,
    metaphor: getMetaphor(day.metaphore_id),
    rappels,
    cours: { texte: day.cours_palais_memoire.texte, ancrage_sensoriel: day.cours_palais_memoire.ancrage_sensoriel },
    hack: getVisualHack(day.hack_visuel.id),
    planning: day.planning_4h,
    puzzles,
    blindfold: day.exercice_blindfold,
    reconsolidation: day.reconsolidation,
    checklist: day.checklist,
    done,
  };
}

async function ownedSession(sessionId: string, userId: string) {
  const [session] = await db
    .select()
    .from(programmeSessions)
    .where(and(eq(programmeSessions.id, sessionId), eq(programmeSessions.userId, userId)))
    .limit(1);
  if (!session) throw new Error("Séance introuvable");
  return session;
}

export async function recordProgrammeResult(input: RecordProgrammeResultInput, userId: string = LOCAL_USER_ID): Promise<void> {
  const session = await ownedSession(input.sessionId, userId);
  if (session.status !== "in_progress") throw new Error("Séance déjà terminée");
  // Un puzzle = un résultat par séance : un double envoi (double clic) ne compte pas deux fois.
  const [existing] = await db
    .select({ id: programmePuzzleResults.id })
    .from(programmePuzzleResults)
    .where(and(eq(programmePuzzleResults.sessionId, input.sessionId), eq(programmePuzzleResults.puzzleId, input.puzzleId), eq(programmePuzzleResults.role, input.role)))
    .limit(1);
  if (existing) return;
  await db.insert(programmePuzzleResults).values({
    id: crypto.randomUUID(),
    sessionId: input.sessionId,
    userId,
    puzzleId: input.puzzleId,
    sourceDayKey: input.sourceDayKey,
    role: input.role,
    skeletonOk: input.skeletonOk,
    solved: input.solved,
    markedSquares: input.markedSquares ?? null,
    seconds: input.seconds ?? null,
    occurredAt: new Date(),
  });
}

export async function completeProgrammeSession(input: CompleteProgrammeSessionInput, userId: string = LOCAL_USER_ID): Promise<ProgrammeSessionOutcome> {
  const session = await ownedSession(input.sessionId, userId);
  if (session.status !== "in_progress") throw new Error("Séance déjà terminée");
  const state = await ensureState(userId);

  const results = await db.select().from(programmePuzzleResults).where(eq(programmePuzzleResults.sessionId, session.id));
  const attempted = results.length;
  const succeeded = results.filter(isFullSuccess).length;
  const retention = session.jour === 7 ? retentionGate(results.filter((r) => r.role === "retention")) : null;

  const history = [...(await completedSummaries(userId)), { dayKey: session.dayKey, attempted, succeeded }];
  const newOffset = nextRatingOffset(state.ratingOffset, history);

  // Jour 7 de la dernière semaine d'une phase : bilan de fin de phase (rétention + réussite de la semaine).
  let review: ProgrammeSessionOutcome["phaseReview"] = null;
  let gate = retention ?? undefined;
  if (session.jour === 7 && isPhaseFinalWeek(session.semaine)) {
    const weekRows = await db
      .select({ dayKey: programmeSessions.dayKey, jour: programmeSessions.jour, attempted: programmeSessions.attempted, succeeded: programmeSessions.succeeded })
      .from(programmeSessions)
      .where(
        and(
          eq(programmeSessions.userId, userId),
          eq(programmeSessions.semaine, session.semaine),
          eq(programmeSessions.repetition, session.repetition),
          eq(programmeSessions.status, "completed"),
        ),
      );
    const result = phaseReview(weekRows.filter((r) => r.jour < 7), retention === true);
    const nextPhase = PHASES.find((p) => p.semaineDebut === session.semaine + 1);
    review = { weekSuccess: result.weekSuccess, threshold: PHASE_PASS, passed: result.passed, nextPhaseTitre: nextPhase ? `Phase ${nextPhase.index} · ${nextPhase.titre}` : null };
    gate = result.passed;
  }
  const next = advanceCursor({ semaine: state.semaine, jour: state.jour, repetition: state.repetition }, gate);

  // better-sqlite3 : transaction synchrone, chaque requête terminée par `.run()`.
  db.transaction((tx) => {
    tx
      .update(programmeSessions)
      .set({
        status: "completed",
        attempted,
        succeeded,
        retentionPassed: retention,
        checklist: input.checklist,
        reconsolidation: input.reconsolidation,
        completedAt: new Date(),
      })
      .where(eq(programmeSessions.id, session.id))
      .run();
    // On n'avance que si la séance terminée est bien celle du jour courant.
    const isCurrent = session.semaine === state.semaine && session.jour === state.jour && session.repetition === state.repetition;
    tx
      .update(programmeState)
      .set({
        ratingOffset: newOffset,
        ...(isCurrent && !next.finished ? { semaine: next.semaine, jour: next.jour, repetition: next.repetition } : {}),
        updatedAt: new Date(),
      })
      .where(eq(programmeState.userId, userId))
      .run();
  });

  return {
    attempted,
    succeeded,
    rollingSuccess: rollingSuccessRate(history),
    previousOffset: state.ratingOffset,
    newOffset,
    retentionPassed: retention,
    phaseReview: review,
    next,
  };
}
