import "server-only";

/**
 * Lectures et écritures de la répétition espacée du Mode Entraînement des
 * ouvertures — même rôle que `spaced-repetition.ts` pour les puzzles FSRS,
 * mais sur `server/srs/opening-repetition.ts` (calendrier à intervalles
 * fixes, pas FSRS — voir son docstring). Écrit par `use-opening-drill.ts` à
 * la fin de chaque drill « Ligne principale »/« Variante » (jamais en mode
 * Aléatoire) ; lu par `OpeningsScreen` (badges 🔴/🟢, bouton "Lancer les
 * révisions du jour") et par `OpeningExplorer` (relance automatique d'une
 * variante précise depuis cette file, `?drill=<clé>`).
 */
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/server/db";
import { openingProgress } from "@/server/db/schema";
import type { OpeningProgress } from "@/server/db/schema/opening-progress";
import { LOCAL_USER_ID } from "@/server/queries/curriculum";
import { starsForAccuracy, type MasteryStars } from "@/core/curriculum/opening-mastery";
import { type TrackedDrillSelection, variationKeyFor } from "@/core/curriculum/opening-variation-key";
import { scheduleOpeningReview } from "@/server/srs/opening-repetition";

export interface RecordOpeningDrillInput {
  openingId: string;
  selection: TrackedDrillSelection;
  /** Libellé affichable dénormalisé — "Ligne principale" ou le nom de la variante, voir `variationLabelFor`. */
  variationLabel: string;
  /** Coups théoriques trouvés (corrects + hors-répertoire) — `score.correct` du hook. */
  correct: number;
  /** Coups tentés, fautes comprises — `score.attempted` du hook. */
  attempted: number;
}

export interface OpeningProgressRow {
  openingId: string;
  variationKey: string;
  variationLabel: string;
  attemptsCount: number;
  streak: number;
  lastAccuracy: number;
  nextReviewDate: Date;
  lastPracticedAt: Date;
}

/**
 * Persiste le résultat d'un drill terminé et renvoie le nouvel état — upsert
 * sur la clé composite (utilisateur, ouverture, variante) : `attemptsCount`
 * et `streak` repartent de l'existant (0 si première tentative), voir
 * `scheduleOpeningReview`.
 */
export async function recordOpeningDrillResult(
  input: RecordOpeningDrillInput,
  userId: string = LOCAL_USER_ID,
  now: Date = new Date(),
): Promise<OpeningProgressRow> {
  const variationKey = variationKeyFor(input.selection);

  const [existing] = await db
    .select()
    .from(openingProgress)
    .where(
      and(
        eq(openingProgress.userId, userId),
        eq(openingProgress.openingId, input.openingId),
        eq(openingProgress.variationKey, variationKey),
      ),
    )
    .limit(1);

  const scheduled = scheduleOpeningReview(
    { attemptsCount: existing?.attemptsCount ?? 0, streak: existing?.streak ?? 0 },
    { correct: input.correct, attempted: input.attempted },
    now,
  );

  const values = {
    userId,
    openingId: input.openingId,
    variationKey,
    variationLabel: input.variationLabel,
    attemptsCount: scheduled.attemptsCount,
    streak: scheduled.streak,
    lastAccuracy: scheduled.lastAccuracy,
    nextReviewDate: scheduled.nextReviewDate,
    lastPracticedAt: now,
  };

  await db
    .insert(openingProgress)
    .values(values)
    .onConflictDoUpdate({
      target: [openingProgress.userId, openingProgress.openingId, openingProgress.variationKey],
      set: {
        attemptsCount: values.attemptsCount,
        streak: values.streak,
        lastAccuracy: values.lastAccuracy,
        nextReviewDate: values.nextReviewDate,
        lastPracticedAt: values.lastPracticedAt,
        variationLabel: values.variationLabel,
      },
    });

  return values;
}

export type OpeningReviewStatus = "due" | "mastered";

export interface OpeningReviewSummary {
  openingId: string;
  status: OpeningReviewStatus;
  /** Échéance la plus proche parmi les variantes suivies de cette ouverture. */
  nextReviewDate: Date;
}

/**
 * Statut de révision par ouverture, pour les badges de `OpeningsScreen`. Une
 * ouverture jamais entraînée (aucune ligne en base) n'apparaît PAS dans le
 * résultat — pas de badge tant qu'il n'y a aucune progression à annoncer,
 * plutôt qu'un 🔴 trompeur qui laisserait croire à une régression.
 */
export async function listOpeningReviewSummaries(
  userId: string = LOCAL_USER_ID,
  now: Date = new Date(),
): Promise<OpeningReviewSummary[]> {
  const rows = await db.select().from(openingProgress).where(eq(openingProgress.userId, userId));

  const byOpening = new Map<string, OpeningProgress[]>();
  for (const row of rows) {
    const list = byOpening.get(row.openingId) ?? [];
    list.push(row);
    byOpening.set(row.openingId, list);
  }

  return Array.from(byOpening.entries()).map(([openingId, variations]) => {
    const nextReviewDate = variations.reduce(
      (earliest, row) => (row.nextReviewDate < earliest ? row.nextReviewDate : earliest),
      variations[0].nextReviewDate,
    );
    return {
      openingId,
      status: nextReviewDate.getTime() <= now.getTime() ? "due" : "mastered",
      nextReviewDate,
    };
  });
}

/**
 * Clés des variantes déjà pratiquées AU MOINS UNE FOIS pour une ouverture
 * donnée — sert à activer le bouton "Test Final" (`OpeningDrill`) : il ne
 * pioche que parmi les variantes que l'utilisateur a réellement consultées,
 * jamais parmi celles jamais vues (voir `core/curriculum/opening-variation-key.ts`
 * pour le format des clés).
 */
export async function listPracticedVariationKeys(
  openingId: string,
  userId: string = LOCAL_USER_ID,
): Promise<string[]> {
  const rows = await db
    .select({ variationKey: openingProgress.variationKey })
    .from(openingProgress)
    .where(and(eq(openingProgress.userId, userId), eq(openingProgress.openingId, openingId)));
  return rows.map((row) => row.variationKey);
}

export interface VariationAccuracy {
  variationKey: string;
  /** Dernier score en pourcentage (`OpeningProgressRow.lastAccuracy`) — sert à dériver les étoiles (`starsForAccuracy`). */
  lastAccuracy: number;
}

/**
 * Précision de chaque variante déjà pratiquée d'une ouverture — sert à
 * afficher les étoiles du sélecteur de Mode Entraînement (`OpeningDrill`) et
 * à calculer la prochaine variante non maîtrisée pour la transition
 * automatique (`findNextUnmasteredVariation`). Sœur de
 * `listPracticedVariationKeys`, en plus riche (celle-ci ne renvoie que les
 * clés, sans précision) — deux fonctions distinctes plutôt qu'une seule
 * élargie : la plupart des appelants de `listPracticedVariationKeys`
 * (gating du Test Final) n'ont besoin que des clés, pas du score.
 */
export async function listOpeningVariationAccuracies(
  openingId: string,
  userId: string = LOCAL_USER_ID,
): Promise<VariationAccuracy[]> {
  const rows = await db
    .select({ variationKey: openingProgress.variationKey, lastAccuracy: openingProgress.lastAccuracy })
    .from(openingProgress)
    .where(and(eq(openingProgress.userId, userId), eq(openingProgress.openingId, openingId)));
  return rows;
}

export interface OpeningMasterySummary {
  openingId: string;
  /** Étoiles dérivées de la précision MOYENNE de toutes les variantes suivies de cette ouverture — une vue d'ensemble, pas la performance d'une seule variante. */
  stars: MasteryStars;
  /** Nombre de variantes (ligne principale comprise) déjà pratiquées au moins une fois. */
  variationsTracked: number;
}

/**
 * Étoiles par ouverture, pour la carte du catalogue (`OpeningCard`) et la
 * barre de « Progression Totale » du répertoire (`OpeningsScreen`). Une
 * ouverture jamais pratiquée n'apparaît pas dans le résultat — même
 * convention que `listOpeningReviewSummaries`, pas de 0⭐ trompeur tant qu'il
 * n'y a aucune donnée.
 */
export async function listOpeningMasterySummaries(userId: string = LOCAL_USER_ID): Promise<OpeningMasterySummary[]> {
  const rows = await db
    .select({ openingId: openingProgress.openingId, lastAccuracy: openingProgress.lastAccuracy })
    .from(openingProgress)
    .where(eq(openingProgress.userId, userId));

  const byOpening = new Map<string, number[]>();
  for (const row of rows) {
    const list = byOpening.get(row.openingId) ?? [];
    list.push(row.lastAccuracy);
    byOpening.set(row.openingId, list);
  }

  return Array.from(byOpening.entries()).map(([openingId, accuracies]) => {
    const average = accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length;
    return { openingId, stars: starsForAccuracy(average), variationsTracked: accuracies.length };
  });
}

export interface DueReview {
  openingId: string;
  variationKey: string;
  variationLabel: string;
  nextReviewDate: Date;
}

/**
 * Toutes les variantes dues (échéance dépassée ou du jour), triées par
 * échéance — la file du bouton "⚡ Lancer les révisions du jour".
 */
export async function listDueReviews(userId: string = LOCAL_USER_ID, now: Date = new Date()): Promise<DueReview[]> {
  const rows = await db
    .select()
    .from(openingProgress)
    .where(and(eq(openingProgress.userId, userId), lte(openingProgress.nextReviewDate, now)));

  return rows
    .map((row) => ({
      openingId: row.openingId,
      variationKey: row.variationKey,
      variationLabel: row.variationLabel,
      nextReviewDate: row.nextReviewDate,
    }))
    .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());
}
