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
import { and, asc, eq, inArray, lte, type SQL } from "drizzle-orm";
import { db } from "@/server/db";
import { moves, puzzles, reviews } from "@/server/db/schema";
import { DECKS, type DeckId } from "@/core/chess/decks";
import { ensureDailySet } from "@/server/queries/spaced-repetition";
import type { Motif } from "@/core/chess/types";

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
 *
 * Le deck « daily » (`DECK_IDS[0]`) n'est jamais porté par `puzzles.deck` (voir
 * `ensureDailySet`) : son compte vient de la sélection figée du jour plutôt
 * que du `GROUP BY` ci-dessus, qui l'ignore totalement.
 */
export async function listDeckOverviews(now: Date = new Date()): Promise<DeckOverview[]> {
  const [rows, dailyIds] = await Promise.all([
    db
      .select({ deck: puzzles.deck, state: reviews.state })
      .from(reviews)
      .innerJoin(puzzles, eq(reviews.puzzleId, puzzles.id))
      .where(lte(reviews.due, now)),
    ensureDailySet(now),
  ]);

  const counts = new Map<DeckId, { due: number; new: number }>();
  for (const row of rows) {
    const bucket = counts.get(row.deck) ?? { due: 0, new: 0 };
    if (row.state === 0) bucket.new += 1;
    else bucket.due += 1;
    counts.set(row.deck, bucket);
  }

  const dailyRows = dailyIds.length > 0 ? await db.select({ state: reviews.state }).from(reviews).where(inArray(reviews.puzzleId, dailyIds)) : [];
  const daily = { due: 0, new: 0 };
  for (const row of dailyRows) {
    if (row.state === 0) daily.new += 1;
    else daily.due += 1;
  }
  counts.set("daily", daily);

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
  /**
   * Coup adverse qui a mené à `fenBefore` dans la partie d'origine — `null`
   * pour un puzzle sans coup précédent (tout premier coup de la partie) ou
   * sans partie d'origine (import Lichess). Voir `SolvablePuzzle.setupMove`.
   */
  setupMove: { uci: string; san: string } | null;
  /** Motifs tactiques exploités par la solution — voir `SolvablePuzzle.motifs`. */
  motifs: Motif[];
}

/**
 * Le coup adverse immédiatement avant `moveId` dans la même partie — le
 * « setup move » du puzzle (voir `DeckPuzzle.setupMove`). `null` sans
 * `moveId`/`gameId` (puzzle sans partie d'origine), ou si `moveId` est le
 * tout premier coup de la partie.
 */
async function findSetupMove(
  moveId: number | null,
  gameId: string | null,
): Promise<{ uci: string; san: string } | null> {
  if (moveId === null || gameId === null) return null;

  const [current] = await db.select({ ply: moves.ply }).from(moves).where(eq(moves.id, moveId)).limit(1);
  if (!current || current.ply <= 1) return null;

  const [previous] = await db
    .select({ uci: moves.uci, san: moves.san })
    .from(moves)
    .where(and(eq(moves.gameId, gameId), eq(moves.ply, current.ply - 1)))
    .limit(1);

  return previous ?? null;
}

/**
 * Prochain puzzle à présenter : le plus en retard d'abord (cartes dues avant
 * cartes neuves — même ordre que `listDeckOverviews` laisserait deviner), à
 * `now` près. Restreint à `deckId` pour une séance de deck (`PuzzleSession`,
 * onglet Entraîner) ; `deckId` omis pour la Séance recommandée de l'accueil
 * (`RecommendedPuzzleSession`, `training-recommendations-card.tsx`), qui
 * enchaîne les puzzles dus tous decks confondus, sans jamais rediriger vers
 * l'onglet Entraîner (cahier des charges : flux continu en place).
 *
 * `deckId === "daily"` est un cas à part : ce deck n'existe jamais dans
 * `puzzles.deck` (voir `ensureDailySet`) — la restriction se fait donc par
 * `puzzleId IN (sélection figée du jour)` plutôt que par égalité de deck, et
 * SANS le filtre `due <= now` : la sélection du jour fait elle-même office de
 * « à faire aujourd'hui », qu'une carte choisie pour son échec récent ait ou
 * non déjà un `due` strictement passé.
 */
function nextPuzzleRow(where: SQL) {
  return db
    .select({
      id: puzzles.id,
      deck: puzzles.deck,
      fenBefore: puzzles.fenBefore,
      solution: puzzles.solution,
      solutionSan: puzzles.solutionSan,
      motifs: puzzles.motifs,
      moveId: puzzles.moveId,
      gameId: puzzles.gameId,
    })
    .from(reviews)
    .innerJoin(puzzles, eq(reviews.puzzleId, puzzles.id))
    .where(where)
    .orderBy(asc(reviews.due))
    .limit(1);
}

export async function getNextDuePuzzle(deckId?: DeckId, now: Date = new Date()): Promise<DeckPuzzle | null> {
  let row;
  if (deckId === "daily") {
    const dailyIds = await ensureDailySet(now);
    [row] = dailyIds.length === 0 ? [] : await nextPuzzleRow(inArray(puzzles.id, dailyIds));
  } else {
    [row] = await nextPuzzleRow(deckId ? and(eq(puzzles.deck, deckId), lte(reviews.due, now))! : lte(reviews.due, now));
  }

  if (!row) return null;

  const { moveId, gameId, ...puzzle } = row;
  return { ...puzzle, setupMove: await findSetupMove(moveId, gameId) };
}
