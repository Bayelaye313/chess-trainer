import "server-only";

/**
 * Lectures et écritures pour l'onglet « Apprendre » — l'académie d'échecs
 * structurée en modules thématiques (voir `core/curriculum/catalog.ts`).
 *
 * Volontairement dans le même fichier que le seed (`ensureCurriculumSeeded`)
 * et l'écriture de progression (`completeThemePuzzle`) : comme
 * `server/queries/spaced-repetition.ts` pour les decks FSRS, la frontière
 * "lecture pour Server Component" / "écriture appelée depuis une Server
 * Action" importe moins ici que de garder tout le vocabulaire du curriculum
 * au même endroit.
 *
 * Différence structurante avec `reviews.ts`/`spaced-repetition.ts` : pas de
 * FSRS, pas d'échéance. La progression est un simple curseur linéaire
 * (`completedCount`) — voir le docstring de `userThemeProgress`.
 */
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/server/db";
import { curriculumPuzzles, curriculumThemes, userThemeProgress } from "@/server/db/schema";
import type { CurriculumCategory, CurriculumLevel } from "@/server/db/schema/curriculum";
import { CURRICULUM_CATEGORIES, CURRICULUM_THEMES, type CurriculumCategoryMeta } from "@/core/curriculum/catalog";
import { buildDemoCurriculumPuzzleRows } from "@/server/db/seed/curriculum-puzzles";

/**
 * L'application tourne sur une base SQLite locale, sans compte ni
 * authentification (voir `server/db/index.ts`) — un seul utilisateur possible
 * aujourd'hui. `userThemeProgress.userId` garde malgré tout sa colonne : le
 * jour où un compte existe, seule cette constante change.
 */
export const LOCAL_USER_ID = "local";

/**
 * Évite l'aller-retour "déjà semé ?" à chaque requête dans le même process —
 * comme le cache de connexion de `server/db/index.ts`, remis à zéro par le
 * rechargement à chaud en développement, jamais en production.
 */
let seeded = false;

/**
 * Sème le catalogue des 141 thèmes et le contenu de démonstration au premier
 * accès. Idempotent par un simple test "la table est-elle vide ?" — à ce
 * volume (141 lignes, une poignée de puzzles), un aller-retour suffit et
 * évite 141 upserts ligne à ligne à chaque démarrage.
 *
 * Ne remet PAS à jour des thèmes déjà semés si `core/curriculum/catalog.ts`
 * change ensuite (nouveau titre, nouveau `totalPuzzles`...) — seule une base
 * vidée reprend le catalogue à jour. Une vraie migration de contenu (par
 * opposition à une migration de schéma) sortirait du cadre de cette fonction.
 */
export async function ensureCurriculumSeeded(): Promise<void> {
  if (seeded) return;

  const existing = await db.select({ id: curriculumThemes.id }).from(curriculumThemes).limit(1);
  if (existing.length === 0) {
    await db.insert(curriculumThemes).values(
      CURRICULUM_THEMES.map((theme) => ({
        id: theme.id,
        category: theme.category,
        author: theme.author,
        title: theme.title,
        description: theme.description,
        level: theme.level,
        totalPuzzles: theme.totalPuzzles,
        orderIndex: theme.orderIndex,
      })),
    );
    await db.insert(curriculumPuzzles).values(buildDemoCurriculumPuzzleRows());
  }

  seeded = true;
}

export interface CurriculumThemeOverview {
  id: string;
  title: string;
  description: string;
  level: CurriculumLevel;
  totalPuzzles: number;
  completedCount: number;
}

export interface CurriculumCategoryOverview extends CurriculumCategoryMeta {
  themes: CurriculumThemeOverview[];
}

/**
 * Vue complète pour l'écran d'accueil de l'académie : les 5 catégories, dans
 * l'ordre du catalogue, chacune avec ses thèmes et la progression de
 * l'utilisateur. `completedCount` est plafonné à `totalPuzzles` — au cas où
 * un import réduirait plus tard le total annoncé d'un thème déjà entamé.
 */
export async function listCurriculumOverview(userId: string = LOCAL_USER_ID): Promise<CurriculumCategoryOverview[]> {
  await ensureCurriculumSeeded();

  const themeRows = await db
    .select()
    .from(curriculumThemes)
    .orderBy(asc(curriculumThemes.category), asc(curriculumThemes.orderIndex));
  const progressRows = await db
    .select({ themeId: userThemeProgress.themeId, completedCount: userThemeProgress.completedCount })
    .from(userThemeProgress)
    .where(eq(userThemeProgress.userId, userId));
  const completedByTheme = new Map(progressRows.map((row) => [row.themeId, row.completedCount]));

  const themesByCategory = new Map<CurriculumCategory, CurriculumThemeOverview[]>();
  for (const theme of themeRows) {
    const list = themesByCategory.get(theme.category) ?? [];
    list.push({
      id: theme.id,
      title: theme.title,
      description: theme.description,
      level: theme.level,
      totalPuzzles: theme.totalPuzzles,
      completedCount: Math.min(completedByTheme.get(theme.id) ?? 0, theme.totalPuzzles),
    });
    themesByCategory.set(theme.category, list);
  }

  return CURRICULUM_CATEGORIES.map((category) => ({
    ...category,
    themes: themesByCategory.get(category.id) ?? [],
  }));
}

export interface ThemePuzzle {
  id: string;
  themeId: string;
  orderIndex: number;
  fen: string;
  solution: string[];
  solutionSan: string[];
}

export interface ThemeSession {
  themeId: string;
  title: string;
  totalPuzzles: number;
  completedCount: number;
  /**
   * Le puzzle à présenter maintenant. `null` si le thème est épuisé —
   * soit parce que `completedCount` a atteint `totalPuzzles`, soit parce que
   * le contenu au-delà de ce que la démo couvre n'a pas encore été importé
   * (voir `server/db/seed/curriculum-puzzles.ts`) : les deux cas se
   * traitent pareil côté écran, "plus rien à résoudre ici pour l'instant".
   */
  puzzle: ThemePuzzle | null;
}

/** Session courante d'un thème : sa progression et le prochain puzzle à résoudre. `null` si le thème n'existe pas. */
export async function getThemeSession(themeId: string, userId: string = LOCAL_USER_ID): Promise<ThemeSession | null> {
  await ensureCurriculumSeeded();

  const [theme] = await db.select().from(curriculumThemes).where(eq(curriculumThemes.id, themeId)).limit(1);
  if (!theme) return null;

  const [progress] = await db
    .select({ completedCount: userThemeProgress.completedCount })
    .from(userThemeProgress)
    .where(and(eq(userThemeProgress.userId, userId), eq(userThemeProgress.themeId, themeId)))
    .limit(1);
  const completedCount = Math.min(progress?.completedCount ?? 0, theme.totalPuzzles);

  const [puzzleRow] =
    completedCount >= theme.totalPuzzles
      ? []
      : await db
          .select()
          .from(curriculumPuzzles)
          .where(and(eq(curriculumPuzzles.themeId, themeId), gte(curriculumPuzzles.orderIndex, completedCount)))
          .orderBy(asc(curriculumPuzzles.orderIndex))
          .limit(1);

  return {
    themeId: theme.id,
    title: theme.title,
    totalPuzzles: theme.totalPuzzles,
    completedCount,
    puzzle: puzzleRow ?? null,
  };
}

/**
 * Valide un puzzle résolu : avance le curseur linéaire d'un cran (jamais deux
 * fois pour le même puzzle grâce au verrou `graded` côté client, comme
 * `PuzzleBoard` — voir `theme-puzzle-board.tsx`) et marque le thème terminé
 * si c'était son dernier puzzle. Pas de notion d'échec ici : contrairement à
 * FSRS, un exercice d'« Apprendre » ne se solde pas par une note — on le
 * refait jusqu'à trouver la suite, puis on avance (voir
 * `theme-puzzle-board.tsx`).
 */
export async function completeThemePuzzle(
  themeId: string,
  userId: string = LOCAL_USER_ID,
  now: Date = new Date(),
): Promise<CurriculumThemeOverview | null> {
  const [theme] = await db.select().from(curriculumThemes).where(eq(curriculumThemes.id, themeId)).limit(1);
  if (!theme) return null;

  const [existing] = await db
    .select({ completedCount: userThemeProgress.completedCount })
    .from(userThemeProgress)
    .where(and(eq(userThemeProgress.userId, userId), eq(userThemeProgress.themeId, themeId)))
    .limit(1);

  const completedCount = Math.min((existing?.completedCount ?? 0) + 1, theme.totalPuzzles);
  const completedAt = completedCount >= theme.totalPuzzles ? now : null;

  await db
    .insert(userThemeProgress)
    .values({ userId, themeId, completedCount, completedAt, updatedAt: now })
    .onConflictDoUpdate({
      target: [userThemeProgress.userId, userThemeProgress.themeId],
      set: { completedCount, completedAt, updatedAt: now },
    });

  return {
    id: theme.id,
    title: theme.title,
    description: theme.description,
    level: theme.level,
    totalPuzzles: theme.totalPuzzles,
    completedCount,
  };
}
