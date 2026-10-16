import { LearnScreen, type LearnView } from "@/client/features/learn/learn-screen";
import type { CurriculumCategoryOverview } from "@/server/queries/curriculum";
import { listCurriculumOverview } from "@/server/queries/curriculum";

/**
 * Résout `?themeId=`/`?categoryId=` vers la vue initiale de `LearnScreen` —
 * le deep-link du Coach (« 🎯 S'exercer sur… », `coach-report.tsx`) et du
 * bandeau « Ouverture en difficulté »-like recommandations tactiques.
 * `themeId` prend le pas sur `categoryId` (il l'implique) ; sans
 * correspondance dans le catalogue déjà chargé, retombe sur `undefined` —
 * `LearnScreen` affiche alors son accueil habituel, jamais une page cassée.
 *
 * Résout vers `lesson`, jamais directement vers `session` (audit UX du
 * 2026-09-02) : même un deep-link doit d'abord montrer la Page de Cours
 * avant l'échiquier — cohérent avec la navigation normale (`ThemePath`).
 */
function resolveInitialView(
  categories: readonly CurriculumCategoryOverview[],
  themeId: string | undefined,
  categoryId: string | undefined,
): LearnView | undefined {
  if (themeId) {
    const category = categories.find((c) => c.themes.some((t) => t.id === themeId));
    if (category) return { kind: "lesson", categoryId: category.id, themeId };
  }
  if (categoryId && categories.some((c) => c.id === categoryId)) {
    return { kind: "themes", categoryId };
  }
  return undefined;
}

export default async function ApprendrePage({
  searchParams,
}: {
  searchParams: Promise<{ themeId?: string; categoryId?: string }>;
}) {
  const { themeId, categoryId } = await searchParams;
  const categories = await listCurriculumOverview();
  const initialView = resolveInitialView(categories, themeId, categoryId);

  return <LearnScreen initialCategories={categories} initialView={initialView} />;
}
