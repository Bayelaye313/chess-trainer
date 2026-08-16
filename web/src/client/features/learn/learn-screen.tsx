"use client";

/**
 * Orchestrateur de l'onglet « Apprendre » : bascule entre le catalogue (5
 * catégories en accordéon) et la session d'exercice en cours — même schéma
 * que `ReviewsScreen` pour « Entraîner ». `initialCategories` vient du Server
 * Component (`app/apprendre/page.tsx`, voir `listCurriculumOverview`) ; on ne
 * retourne au catalogue qu'après un aller-retour serveur, pour que les
 * compteurs de progression reflètent la séance qui vient de se terminer.
 */
import { useState } from "react";
import { getCurriculumOverview } from "@/server/actions/curriculum";
import type { CurriculumCategoryOverview } from "@/server/queries/curriculum";
import { CategorySection } from "./category-section";
import { ThemeSession } from "./theme-session";

export function LearnScreen({ initialCategories }: { initialCategories: CurriculumCategoryOverview[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  async function exitSession() {
    setSelectedThemeId(null);
    setCategories(await getCurriculumOverview());
  }

  if (selectedThemeId) {
    return <ThemeSession themeId={selectedThemeId} onExit={exitSession} />;
  }

  const totalThemes = categories.reduce((sum, category) => sum + category.themes.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Apprendre</h1>
        <p className="mt-2 max-w-prose text-sm text-foreground-muted">
          L&apos;académie d&apos;échecs : {totalThemes} thèmes structurés en modules, du motif de base à la
          position de tournoi. Une progression linéaire, sans répétition espacée — enchaîne les exercices
          d&apos;un thème dans l&apos;ordre, à ton rythme.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} onSelectTheme={setSelectedThemeId} />
        ))}
      </div>
    </div>
  );
}
