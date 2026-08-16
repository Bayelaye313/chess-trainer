"use server";

/**
 * Pont client/serveur pour l'onglet « Apprendre » — même rôle que
 * `server/actions/practice.ts` pour « Entraîner » : aucune logique propre
 * ici, juste une redirection vers `server/queries/curriculum.ts`.
 */
import {
  completeThemePuzzle,
  getThemeSession,
  listCurriculumOverview,
  type CurriculumCategoryOverview,
  type CurriculumThemeOverview,
  type ThemeSession,
} from "@/server/queries/curriculum";

export async function getCurriculumOverview(): Promise<CurriculumCategoryOverview[]> {
  return listCurriculumOverview();
}

export async function getThemePuzzleSession(themeId: string): Promise<ThemeSession | null> {
  return getThemeSession(themeId);
}

export async function submitThemePuzzleSolved(themeId: string): Promise<CurriculumThemeOverview | null> {
  return completeThemePuzzle(themeId);
}
