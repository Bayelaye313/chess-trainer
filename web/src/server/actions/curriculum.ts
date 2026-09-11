"use server";

/**
 * Pont client/serveur pour l'onglet « Apprendre » — même rôle que
 * `server/actions/practice.ts` pour « Entraîner » : aucune logique propre
 * ici, juste une redirection vers `server/queries/curriculum.ts`.
 */
import {
  completeThemePuzzle,
  getThemeReviewSession,
  getThemeSession,
  listCurriculumOverview,
  type CurriculumCategoryOverview,
  type CurriculumThemeOverview,
  type ThemeReviewSession,
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

/**
 * Mode « Revoir les puzzles » — sert toute la vague d'un thème pour un rejeu
 * libre. Volontairement PAS de `submitThemeReviewSolved` symétrique : une
 * session de révision ne poste jamais rien au serveur (voir le docstring de
 * `getThemeReviewSession`), tout son avancement reste un état client pur
 * (`theme-review-session.tsx`).
 */
export async function getThemePuzzleReviewSession(themeId: string): Promise<ThemeReviewSession | null> {
  return getThemeReviewSession(themeId);
}
