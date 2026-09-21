import type { CurriculumLevel } from "@/server/db/schema/curriculum";
import type { CurriculumCategoryOverview, CurriculumThemeOverview } from "@/server/queries/curriculum";

export type PlaybookLessonState = "completed" | "active" | "available" | "locked" | "empty";
export interface PlaybookThemeRow extends CurriculumThemeOverview { categoryId: string; categoryLabel: string; state: PlaybookLessonState; progressPercent: number; rewardXp: number; }
export interface PlaybookTierLane { level: CurriculumLevel; label: string; description: string; themes: readonly PlaybookThemeRow[]; masteredCount: number; totalCount: number; percent: number; locked: boolean; }
export interface PlaybookModel { activeTheme: PlaybookThemeRow | null; activeCategoryId: string | null; tiers: readonly PlaybookTierLane[]; masteredThemes: number; totalThemes: number; earnedXp: number; levelXp: number; nextLevelXp: number; level: number; levelPercent: number; }
export const PLAYBOOK_TIER_ORDER: readonly CurriculumLevel[] = ["beginner", "intermediate", "advanced"];
export const PLAYBOOK_TIER_META: Record<CurriculumLevel, { label: string; description: string }> = {
  beginner: { label: "Bronze", description: "Fondamentaux tactiques" },
  intermediate: { label: "Argent", description: "Calcul & initiative" },
  advanced: { label: "Or", description: "Vision de compétition" },
};
const complete = (theme: CurriculumThemeOverview) => theme.totalPuzzles > 0 && theme.completedCount >= theme.totalPuzzles;
const authentic = (theme: CurriculumThemeOverview) => theme.totalPuzzles > 0;
const percent = (theme: CurriculumThemeOverview) => theme.totalPuzzles > 0 ? Math.min(100, Math.round(theme.completedCount / theme.totalPuzzles * 100)) : 0;
const reward = (level: CurriculumLevel, index: number) => ({ beginner: 80, intermediate: 160, advanced: 240 }[level] + index * 20);
function locked(level: CurriculumLevel, byLevel: ReadonlyMap<CurriculumLevel, readonly CurriculumThemeOverview[]>) {
  const index = PLAYBOOK_TIER_ORDER.indexOf(level);
  return index > 0 && PLAYBOOK_TIER_ORDER.slice(0, index).some((previous) => (byLevel.get(previous) ?? []).some((theme) => authentic(theme) && !complete(theme)));
}
export function buildPlaybookModel(categories: readonly CurriculumCategoryOverview[]): PlaybookModel {
  const byLevel = new Map<CurriculumLevel, CurriculumThemeOverview[]>();
  const raw = categories.flatMap((category) => category.themes.map((theme, index) => {
    const list = byLevel.get(theme.level) ?? []; list.push(theme); byLevel.set(theme.level, list);
    return { ...theme, categoryId: category.id, categoryLabel: category.label, state: "available" as PlaybookLessonState, progressPercent: percent(theme), rewardXp: reward(theme.level, index) } satisfies PlaybookThemeRow;
  }));
  const active = raw.find((theme) => authentic(theme) && !complete(theme) && !locked(theme.level, byLevel));
  const rows = raw.map((theme) => ({ ...theme, state: !authentic(theme) ? "empty" : complete(theme) ? "completed" : active?.id === theme.id ? "active" : locked(theme.level, byLevel) ? "locked" : "available" } satisfies PlaybookThemeRow));
  const tiers = PLAYBOOK_TIER_ORDER.map((level) => {
    const themes = rows.filter((theme) => theme.level === level); const available = themes.filter(authentic); const masteredCount = available.filter((theme) => theme.state === "completed").length;
    return { level, ...PLAYBOOK_TIER_META[level], themes, masteredCount, totalCount: available.length, percent: available.length ? Math.round(masteredCount / available.length * 100) : 0, locked: locked(level, byLevel) } satisfies PlaybookTierLane;
  });
  const available = rows.filter(authentic); const masteredThemes = available.filter((theme) => theme.state === "completed").length; const earnedXp = available.filter((theme) => theme.state === "completed").reduce((sum, theme) => sum + theme.rewardXp, 0); const levelSize = 700; const level = Math.max(1, Math.floor(earnedXp / levelSize) + 1); const levelXp = earnedXp % levelSize;
  return { activeTheme: active ? rows.find((theme) => theme.id === active.id) ?? null : null, activeCategoryId: active?.categoryId ?? null, tiers, masteredThemes, totalThemes: available.length, earnedXp, levelXp, nextLevelXp: level * levelSize, level, levelPercent: Math.round(levelXp / levelSize * 100) };
}
export const formatThemeProgress = (theme: Pick<PlaybookThemeRow, "completedCount" | "totalPuzzles">) => theme.totalPuzzles > 0 ? `${theme.completedCount} / ${theme.totalPuzzles}` : "En attente";
export const formatTierProgress = (lane: Pick<PlaybookTierLane, "masteredCount" | "totalCount">) => `${lane.masteredCount} / ${lane.totalCount} terminée${lane.totalCount > 1 ? "s" : ""}`;
