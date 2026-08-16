import "server-only";

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
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { moves, puzzles, reviewLogs, reviews, type MoveRow, type NewPuzzle } from "@/server/db/schema";
import { categorizeDeck, isPuzzleWorthy } from "@/core/chess/decks";
import { initialReviewFields, scheduleReview, type ReviewGrade } from "@/server/srs/fsrs";

/**
 * Construit le puzzle (contenu immuable) pour un coup qui mérite d'être
 * révisé. `null` si le coup ne s'y prête pas — absence de coup de référence
 * (moteur en échec, cas limite) ou coup qui ne remplit aucun des critères de
 * `isPuzzleWorthy`.
 *
 * Un seul coup de solution (`solution`/`solutionSan` à un élément) : comme le
 * prototype, et comme `MistakesDrillBoard` (`client/features/games/`) le
 * suppose déjà pour rejouer une gaffe.
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
async function extractPuzzlesFromMoves(
  candidateMoves: readonly MoveRow[],
  now: Date,
): Promise<ExtractionResult> {
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

  return true;
}
