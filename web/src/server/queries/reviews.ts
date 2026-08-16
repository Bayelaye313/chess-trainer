import "server-only";

/**
 * Lectures pour l'onglet « Entraîner » : dénombrement des cartes dues/nouvelles
 * par deck (dashboard) et prochain puzzle à présenter (session en cours).
 *
 * Comme `server/queries/games.ts`/`progress.ts` — de simples fonctions async
 * pour des Server Components — mais aussi appelées depuis les Server Actions
 * de `server/actions/practice.ts` pour le rafraîchissement côté client
 * (sélection de deck, retour au tableau de bord).
 *
 * L'écriture (`submitPuzzleAnswer`, l'alimentation des decks) reste dans
 * `server/queries/spaced-repetition.ts` — ce fichier ne fait que lire.
 */
import { and, asc, eq, lte } from "drizzle-orm";
import { db } from "@/server/db";
import { puzzles, reviews } from "@/server/db/schema";
import { DECKS, type DeckId } from "@/core/chess/decks";

export interface DeckOverview {
  id: DeckId;
  title: string;
  subtitle: string;
  /** Cartes déjà apprises (state != New) et dont l'échéance FSRS est passée. */
  dueCount: number;
  /** Cartes jamais présentées (state == New) — comptées à part, voir `submitPuzzleAnswer`. */
  newCount: number;
}

/**
 * Dénombre dûs/nouveaux par deck, pour les cartes du dashboard.
 *
 * Une carte neuve (`state === 0`, voir `initialReviewFields`) a un `due` déjà
 * passé dès sa création — sans le distinguo par `state`, elle compterait deux
 * fois comme « due » ET « nouvelle ». D'où la répartition en JS plutôt qu'un
 * simple `count()` SQL par deck.
 */
export async function listDeckOverviews(now: Date = new Date()): Promise<DeckOverview[]> {
  const rows = await db
    .select({ deck: puzzles.deck, state: reviews.state })
    .from(reviews)
    .innerJoin(puzzles, eq(reviews.puzzleId, puzzles.id))
    .where(lte(reviews.due, now));

  const counts = new Map<DeckId, { due: number; new: number }>();
  for (const row of rows) {
    const bucket = counts.get(row.deck) ?? { due: 0, new: 0 };
    if (row.state === 0) bucket.new += 1;
    else bucket.due += 1;
    counts.set(row.deck, bucket);
  }

  return DECKS.map((deck) => ({
    ...deck,
    dueCount: counts.get(deck.id)?.due ?? 0,
    newCount: counts.get(deck.id)?.new ?? 0,
  }));
}

export interface DeckPuzzle {
  id: string;
  deck: DeckId;
  fenBefore: string;
  /** Suite attendue en UCI, coups adverses inclus aux rangs impairs (voir `puzzles.ts`). */
  solution: string[];
  solutionSan: string[];
}

/**
 * Prochain puzzle à présenter pour un deck : le plus en retard d'abord
 * (cartes dues avant cartes neuves — même ordre que `listDeckOverviews`
 * laisserait deviner), à `now` près.
 */
export async function getNextDuePuzzle(deckId: DeckId, now: Date = new Date()): Promise<DeckPuzzle | null> {
  const [row] = await db
    .select({
      id: puzzles.id,
      deck: puzzles.deck,
      fenBefore: puzzles.fenBefore,
      solution: puzzles.solution,
      solutionSan: puzzles.solutionSan,
    })
    .from(reviews)
    .innerJoin(puzzles, eq(reviews.puzzleId, puzzles.id))
    .where(and(eq(puzzles.deck, deckId), lte(reviews.due, now)))
    .orderBy(asc(reviews.due))
    .limit(1);

  return row ?? null;
}
