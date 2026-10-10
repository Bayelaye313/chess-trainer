import type { CurriculumCategory, CurriculumLevel } from "@/server/db/schema/curriculum";
import type { CurriculumCategoryOverview, CurriculumThemeOverview } from "@/server/queries/curriculum";

/**
 * Modèle de l'accueil « Apprendre » — refonte du 2026-10-10 : les thèmes sont
 * regroupés PAR CATÉGORIE (positionnel, Jesper Hall, mats, motifs, finales…),
 * chacune avec sa description et sa progression ; le niveau d'un thème n'est
 * plus qu'un badge sur sa fiche. Plus aucun verrou : tout thème qui a des
 * exercices est ouvert d'emblée (les paliers Bronze/Argent/Or mélangeaient
 * toutes les catégories et bloquaient l'accès sans raison pédagogique).
 */
export type PlaybookLessonState = "completed" | "active" | "available" | "empty";
export interface PlaybookThemeRow extends CurriculumThemeOverview { categoryId: CurriculumCategory; categoryLabel: string; state: PlaybookLessonState; progressPercent: number; rewardXp: number; }
export interface PlaybookCategorySection { id: CurriculumCategory; label: string; description: string; author: string | null; themes: readonly PlaybookThemeRow[]; masteredCount: number; totalCount: number; percent: number; }
export interface PlaybookModel { activeTheme: PlaybookThemeRow | null; sections: readonly PlaybookCategorySection[]; masteredThemes: number; totalThemes: number; earnedXp: number; levelXp: number; nextLevelXp: number; level: number; levelPercent: number; }

export const LEVEL_LABEL: Record<CurriculumLevel, string> = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };

const complete = (theme: CurriculumThemeOverview) => theme.totalPuzzles > 0 && theme.completedCount >= theme.totalPuzzles;
const authentic = (theme: CurriculumThemeOverview) => theme.totalPuzzles > 0;
const percent = (theme: CurriculumThemeOverview) => theme.totalPuzzles > 0 ? Math.min(100, Math.round(theme.completedCount / theme.totalPuzzles * 100)) : 0;
const reward = (level: CurriculumLevel, index: number) => ({ beginner: 80, intermediate: 160, advanced: 240 }[level] + index * 20);

export function buildPlaybookModel(categories: readonly CurriculumCategoryOverview[]): PlaybookModel {
  const raw = categories.flatMap((category) => category.themes.map((theme, index) => ({ ...theme, categoryId: category.id, categoryLabel: category.label, state: "available" as PlaybookLessonState, progressPercent: percent(theme), rewardXp: reward(theme.level, index) } satisfies PlaybookThemeRow)));
  // « Reprendre » : le premier thème entamé mais pas fini, sinon le premier jamais commencé.
  const active = raw.find((theme) => authentic(theme) && !complete(theme) && theme.completedCount > 0) ?? raw.find((theme) => authentic(theme) && !complete(theme));
  const rows = raw.map((theme) => ({ ...theme, state: !authentic(theme) ? "empty" : complete(theme) ? "completed" : active?.id === theme.id ? "active" : "available" } satisfies PlaybookThemeRow));
  const sections = categories.map((category) => {
    // L'ordre du catalogue est conservé : c'est lui qui numérote les modules (1 à 30, 1 à 25…).
    const themes = rows.filter((theme) => theme.categoryId === category.id && theme.state !== "empty");
    const masteredCount = themes.filter((theme) => theme.state === "completed").length;
    return { id: category.id, label: category.label, description: category.description, author: category.author, themes, masteredCount, totalCount: themes.length, percent: themes.length ? Math.round(masteredCount / themes.length * 100) : 0 } satisfies PlaybookCategorySection;
  }).filter((section) => section.themes.length > 0);
  const available = rows.filter(authentic); const masteredThemes = available.filter((theme) => theme.state === "completed").length; const earnedXp = available.filter((theme) => theme.state === "completed").reduce((sum, theme) => sum + theme.rewardXp, 0); const levelSize = 700; const level = Math.max(1, Math.floor(earnedXp / levelSize) + 1); const levelXp = earnedXp % levelSize;
  return { activeTheme: active ? rows.find((theme) => theme.id === active.id) ?? null : null, sections, masteredThemes, totalThemes: available.length, earnedXp, levelXp, nextLevelXp: level * levelSize, level, levelPercent: Math.round(levelXp / levelSize * 100) };
}
export const formatThemeProgress = (theme: Pick<PlaybookThemeRow, "completedCount" | "totalPuzzles">) => theme.totalPuzzles > 0 ? `${theme.completedCount} / ${theme.totalPuzzles}` : "En attente";
export const formatSectionProgress = (section: Pick<PlaybookCategorySection, "masteredCount" | "totalCount">) => `${section.masteredCount} / ${section.totalCount} maîtrisé${section.masteredCount > 1 ? "s" : ""}`;
