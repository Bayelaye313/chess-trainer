import "server-only";

import { Chess } from "chess.js";
/**
 * Alimentation et interrogation des 7 decks de révision (voir
 * `core/chess/decks.ts` pour les decks et `isPuzzleWorthy`, le critère de
 * sélection). Deux familles de fonctions :
 *
 *  - `extractPuzzlesFromGame`/`extractPuzzlesFromAllGames` : transforment les
 *    coups déjà analysés (table `moves`) en puzzles (`puzzles` + carte FSRS
 *    neuve dans `reviews`) — le « moteur d'alimentation automatique ».
 *  - `submitPuzzleAnswer` : fait avancer la carte FSRS d'un puzzle après une
 *    réponse du joueur (voir `server/srs/fsrs.ts`).
 *
 * Ce fichier écrit en base, pas seulement ne la lit — une entorse assumée à
 * la convention `server/queries/*` (lectures pour Server Components, voir
 * `server/queries/games.ts`) : `server/actions/practice.ts` appelle ces
 * fonctions telles quelles côté client, et la synchro automatique
 * (`server/import/run-sync.ts`) appelle systématiquement
 * `extractPuzzlesFromGame` — une partie détectée en tâche de fond doit
 * alimenter les decks sans action supplémentaire de l'utilisateur.
 */
import { and, asc, desc, eq, gt, inArray, or } from "drizzle-orm";
import { db } from "@/server/db";
import { dailySets, moves, puzzles, reviewLogs, reviews, trainingEvents, type MoveRow, type NewPuzzle } from "@/server/db/schema";
import { categorizeDeck, isPuzzleWorthy } from "@/core/chess/decks";
import type { PositionAnalyser } from "@/core/analysis/types";
import { IMPORT_ANALYSIS_DEPTH } from "@/server/import/constants";
import { initialReviewFields, scheduleReview, type ReviewGrade } from "@/server/srs/fsrs";
import { LOCAL_USER_ID } from "@/server/queries/curriculum";

/**
 * Construit le puzzle (contenu immuable) pour un coup qui mérite d'être
 * révisé. `null` si le coup ne s'y prête pas — absence de coup de référence
 * (moteur en échec, cas limite) ou coup qui ne remplit aucun des critères de
 * `isPuzzleWorthy`.
 *
 * Les cartes personnelles sont enrichies en suites multi-plis lors de leur
 * extraction (voir `extendPuzzleSolution`) ; les cartes importées peuvent
 * rester mono-coup lorsqu'aucune continuation locale n'est disponible.
 */
export function puzzleFromMove(move: MoveRow, now: Date): NewPuzzle | null {
  if (!isPuzzleWorthy(move)) return null;
  if (!move.bestUci || !move.bestSan) return null;

  return {
    id: crypto.randomUUID(),
    deck: categorizeDeck({
      quality: move.quality,
      phase: move.phase,
      mateMissed: move.mateMissed,
      tactical: move.motifs.length > 0,
    }),
    gameId: move.gameId,
    moveId: move.id,
    fenBefore: move.fenBefore,
    solution: [move.bestUci],
    solutionSan: [move.bestSan],
    playedUci: move.uci,
    playedSan: move.san,
    quality: move.quality,
    phase: move.phase,
    cpLoss: move.cpLoss,
    mateMissed: move.mateMissed,
    motifs: move.motifs,
    rating: null,
    source: "local",
    createdAt: now,
  };
}

/**
 * Nombre de plis maximum d'un puzzle personnel (joueur + adversaire confondus)
 * — un enchaînement raisonnable (jusqu'à 3 coups du joueur) sans dériver vers
 * un puzzle-fleuve que plus personne ne mémorise.
 */
const MAX_PUZZLE_SOLUTION_PLIES = 5;

/**
 * Étend un puzzle personnel avec la suite que le MOTEUR recommandait déjà
 * depuis la position fautive (`move.bestPv`, capturée à l'analyse — voir
 * `EvaluatedMove.bestPv`, `evaluate-move.ts`) : premier coup = correction,
 * plis suivants = la continuation la plus probable selon le moteur (réponse
 * adverse puis meilleure suite du joueur, en alternance).
 *
 * Bug utilisateur corrigé ici (« puzzle à réviser limité à un seul coup ») :
 * la version précédente enchaînait les coups RÉELLEMENT joués ensuite dans la
 * partie — mais dès que le premier coup est corrigé, la position DIVERGE de
 * la partie réelle, et le coup suivant réellement joué n'a plus aucune raison
 * d'être légal sur ce nouvel échiquier (il répondait à l'erreur, pas à la
 * correction) : la suite s'arrêtait donc presque toujours dès le premier
 * coup. La PV du moteur, elle, reste par construction une ligne jouable
 * depuis `fenBefore`, quelle qu'ait été la suite réelle de la partie.
 *
 * Chaque coup est rejoué sur un clone chess.js : une PV tronquée ou
 * incompatible (mat déjà annoncé, coup de fin de recherche non résolu)
 * s'arrête proprement au lieu de fabriquer un puzzle illégal — voir
 * `move.bestPv` absente ou trop courte (parties analysées avant ce
 * correctif) : repli sur le seul coup connu, `backfillPersonalPuzzleLines`
 * est le seul moyen de les enrichir rétroactivement.
 */
export function extendPuzzleSolution(move: MoveRow): { solution: string[]; solutionSan: string[] } {
  if (!move.bestUci || !move.bestSan) return { solution: [], solutionSan: [] };

  const board = new Chess(move.fenBefore);
  const solution: string[] = [];
  const solutionSan: string[] = [];
  const pv = move.bestPv.length > 0 ? move.bestPv : [move.bestUci];

  for (const uci of pv) {
    if (solution.length >= MAX_PUZZLE_SOLUTION_PLIES) break;
    try {
      const played = board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
      solution.push(uci);
      solutionSan.push(played.san);
    } catch {
      break;
    }
  }

  return solution.length > 0 ? { solution, solutionSan } : { solution: [move.bestUci], solutionSan: [move.bestSan] };
}

/** Format "AAAA-MM-JJ" — clé du deck "Puzzles du jour" (`dailySets.day`). */
function isoDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Nombre de puzzles proposés chaque jour dans le deck "Puzzles du jour" — voir `ensureDailySet`. */
const DAILY_SET_SIZE = 5;

/**
 * Compose (ou relit) la sélection figée du jour pour le deck « Puzzles du
 * jour » (`core/chess/decks.ts`, `DECK_IDS[0] === "daily"`) — le seul deck qui
 * ne vient pas d'une catégorisation d'erreur (voir son docstring), et qui
 * jusqu'ici n'était JAMAIS alimenté : `puzzles.deck` ne vaut jamais `"daily"`
 * (voir `categorizeDeck`, qui ne renvoie que les 6 autres decks), donc
 * `listDeckOverviews`/`getNextDuePuzzle` (`server/queries/reviews.ts`)
 * affichaient un onglet structurellement vide — bug utilisateur corrigé ici,
 * SANS ajouter de nouveau deck sur les puzzles eux-mêmes : ce deck reste une
 * VUE composée chaque matin sur les 6 autres, jamais une catégorie propre.
 *
 * Échantillonne, tous les autres decks confondus, les cartes « échouées » (au
 * moins un repli FSRS, `lapses > 0`) ou « jamais révisées » (`state` New) —
 * priorité décroissante au nombre d'échecs, puis à l'échéance la plus
 * ancienne — et fige le résultat dans `daily_sets` pour la journée ISO
 * courante : rouvrir la page ne tire jamais un nouvel échantillon avant le
 * lendemain (voir le docstring de `dailySets`, `schema/reviews.ts`, « pour ne
 * jamais reproposer les mêmes »).
 */
export async function ensureDailySet(now: Date = new Date(), size = DAILY_SET_SIZE): Promise<string[]> {
  const day = isoDay(now);
  const [existing] = await db.select().from(dailySets).where(eq(dailySets.day, day)).limit(1);
  if (existing) return existing.puzzleIds;

  const candidates = await db
    .select({ puzzleId: reviews.puzzleId })
    .from(reviews)
    .where(or(gt(reviews.lapses, 0), eq(reviews.state, 0)))
    .orderBy(desc(reviews.lapses), asc(reviews.due))
    .limit(size);

  const puzzleIds = candidates.map((row) => row.puzzleId);
  if (puzzleIds.length > 0) {
    await db.insert(dailySets).values({ day, puzzleIds, createdAt: now }).onConflictDoNothing();
  }
  return puzzleIds;
}

export interface ExtractionResult {
  /** Coups du joueur passés en revue (candidats, qu'ils aient produit un puzzle ou non). */
  scanned: number;
  /** Nouveaux puzzles effectivement créés. */
  created: number;
}

/**
 * Filtre les coups qui ont déjà un puzzle (voir l'index unique
 * `puzzles_move_idx`, `schema/puzzles.ts`), puis crée puzzle + carte FSRS
 * neuve pour chacun des autres qui le mérite. Un seul point d'extraction pour
 * `extractPuzzlesFromGame` et `extractPuzzlesFromAllGames` ci-dessous : c'est
 * ce qui rend les deux idempotentes de la même façon, qu'on les relance une
 * fois ou dix.
 */
async function extractPuzzlesFromMoves(candidateMoves: readonly MoveRow[], now: Date): Promise<ExtractionResult> {
  if (candidateMoves.length === 0) return { scanned: 0, created: 0 };

  const alreadyPuzzled = new Set(
    (
      await db
        .select({ moveId: puzzles.moveId })
        .from(puzzles)
        .where(inArray(puzzles.moveId, candidateMoves.map((m) => m.id)))
    ).map((row) => row.moveId),
  );

  let created = 0;
  for (const move of candidateMoves) {
    if (alreadyPuzzled.has(move.id)) continue;
    const puzzle = puzzleFromMove(move, now);
    if (!puzzle) continue;
    const line = extendPuzzleSolution(move);
    puzzle.solution = line.solution;
    puzzle.solutionSan = line.solutionSan;

    await db.insert(puzzles).values(puzzle);
    await db.insert(reviews).values({ puzzleId: puzzle.id, ...initialReviewFields(now) });
    created += 1;
  }

  return { scanned: candidateMoves.length, created };
}

/**
 * Alimente les decks à partir des coups déjà analysés d'UNE partie — pensé
 * pour être appelé juste après son import ou son analyse.
 */
export async function extractPuzzlesFromGame(
  gameId: string,
  now: Date = new Date(),
): Promise<ExtractionResult> {
  const candidateMoves = await db
    .select()
    .from(moves)
    .where(and(eq(moves.gameId, gameId), eq(moves.byPlayer, true)));

  return extractPuzzlesFromMoves(candidateMoves, now);
}

/**
 * Scan global : rattrape les coups déjà en base qui mériteraient un puzzle
 * mais n'en ont pas encore (parties importées avant l'existence de ce
 * service, par exemple). Coûte un aller-retour complet sur `moves` — pensé
 * pour tourner ponctuellement (script, tâche de fond), pas à chaque
 * chargement de page.
 */
export async function extractPuzzlesFromAllGames(now: Date = new Date()): Promise<ExtractionResult> {
  const candidateMoves = await db.select().from(moves).where(eq(moves.byPlayer, true));
  return extractPuzzlesFromMoves(candidateMoves, now);
}

/**
 * Recalcule `bestPv` pour les coups déjà en base qui ont produit un puzzle
 * personnel mais n'ont jamais eu leur PV moteur capturée (parties analysées
 * avant l'ajout de `EvaluatedMove.bestPv` — voir son docstring). Un seul appel
 * moteur par coup concerné (`analyser.analyse(fenBefore)`), jamais une
 * ré-analyse complète des parties : seuls les coups qui ont déjà mérité un
 * puzzle sont concernés, un ensemble borné même sur un historique conséquent.
 *
 * À exécuter une fois (`npm run backfill:puzzle-lines`), puis
 * `backfillPersonalPuzzleLines` pour propager la PV désormais disponible aux
 * puzzles déjà créés.
 */
export async function backfillMoveBestPv(analyser: PositionAnalyser): Promise<{ scanned: number; updated: number }> {
  const personalPuzzles = await db.select({ moveId: puzzles.moveId }).from(puzzles).where(eq(puzzles.source, "local"));
  const moveIds = [...new Set(personalPuzzles.map((puzzle) => puzzle.moveId).filter((id): id is number => id !== null))];
  if (moveIds.length === 0) return { scanned: 0, updated: 0 };

  const candidateMoves = (await db.select().from(moves).where(inArray(moves.id, moveIds))).filter(
    (move) => move.bestUci !== null && move.bestPv.length === 0,
  );

  let updated = 0;
  for (const move of candidateMoves) {
    const evaluation = await analyser.analyse(move.fenBefore, { depth: IMPORT_ANALYSIS_DEPTH });
    if (evaluation.pv.length === 0) continue;
    await db.update(moves).set({ bestPv: evaluation.pv }).where(eq(moves.id, move.id));
    updated += 1;
  }
  return { scanned: candidateMoves.length, updated };
}

/**
 * Étend les cartes personnelles déjà créées (source `local`, jamais les
 * puzzles importés externes) avec la PV moteur désormais disponible
 * (`move.bestPv`) — rattrape les puzzles créés AVANT ce correctif, dont le
 * coup n'avait alors persisté que `bestUci` (voir `extendPuzzleSolution`) ;
 * n'écrit que si la nouvelle ligne est effectivement plus longue. Appeler
 * `backfillMoveBestPv` d'abord sur le même historique, sans quoi `bestPv`
 * reste vide et cette fonction n'a rien de neuf à propager.
 */
export async function backfillPersonalPuzzleLines(): Promise<{ scanned: number; extended: number }> {
  const personalPuzzles = await db.select().from(puzzles).where(eq(puzzles.source, "local"));
  if (personalPuzzles.length === 0) return { scanned: 0, extended: 0 };

  const moveIds = personalPuzzles.map((puzzle) => puzzle.moveId).filter((id): id is number => id !== null);
  const moveRows = moveIds.length === 0 ? [] : await db.select().from(moves).where(inArray(moves.id, moveIds));
  const moveById = new Map(moveRows.map((row) => [row.id, row]));

  let extended = 0;
  for (const puzzle of personalPuzzles) {
    if (puzzle.moveId === null) continue;
    const move = moveById.get(puzzle.moveId);
    if (!move) continue;
    const line = extendPuzzleSolution(move);
    if (line.solution.length <= puzzle.solution.length) continue;
    await db.update(puzzles).set({ solution: line.solution, solutionSan: line.solutionSan }).where(eq(puzzles.id, puzzle.id));
    extended += 1;
  }
  return { scanned: personalPuzzles.length, extended };
}

export interface SubmitPuzzleAnswerInput {
  puzzleId: string;
  grade: ReviewGrade;
  /** Coup effectivement joué sur cette tentative, pour rejouer la séance plus tard. */
  playedUci?: string | null;
  solvedMs?: number | null;
}

/**
 * Fait avancer la carte FSRS d'un puzzle après la réponse du joueur et
 * journalise la tentative. Renvoie `false` sans rien écrire si le puzzle n'a
 * pas de carte de révision — ne devrait arriver que si `puzzles`/`reviews`
 * ont divergé (insertion de puzzle contournant ce service).
 */
export async function submitPuzzleAnswer(
  input: SubmitPuzzleAnswerInput,
  now: Date = new Date(),
): Promise<boolean> {
  const [current] = await db.select().from(reviews).where(eq(reviews.puzzleId, input.puzzleId)).limit(1);
  if (!current) return false;

  const { card, log } = scheduleReview(current, input.grade, now);

  await db.update(reviews).set(card).where(eq(reviews.puzzleId, input.puzzleId));
  await db.insert(reviewLogs).values({
    ...log,
    puzzleId: input.puzzleId,
    playedUci: input.playedUci ?? null,
    solvedMs: input.solvedMs ?? null,
  });
  const scoreByGrade: Record<ReviewGrade, number> = { again: 0, hard: 0.5, good: 0.8, easy: 1 };
  await db.insert(trainingEvents).values({
    id: crypto.randomUUID(),
    userId: LOCAL_USER_ID,
    kind: "puzzle",
    entityId: input.puzzleId,
    score: scoreByGrade[input.grade],
    seconds: input.solvedMs == null ? undefined : input.solvedMs / 1000,
    occurredAt: now,
  });

  return true;
}
