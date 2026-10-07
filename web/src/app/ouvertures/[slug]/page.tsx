import { notFound } from "next/navigation";
import { OpeningExplorer } from "@/client/features/openings/opening-explorer";
import { getRepertoireDeviations } from "@/server/queries/opening-mistakes";
import { listOpeningVariationAccuracies, listPracticedVariationKeys } from "@/server/queries/opening-progress";
import { getOpeningDetail } from "@/server/queries/openings";

export default async function OpeningDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  /**
   * `?drill=<clé>` : relance directe d'une variante précise — voir
   * `OpeningsScreen`/`review-queue.ts`.
   * `?side=white|black` (feuille de route Zone 4) : camp AVEC LEQUEL le
   * joueur a joué cette ouverture (bandeau « Ouverture en difficulté » du
   * Rapport) — force l'orientation du plateau du drill pour s'entraîner du
   * bon côté. Toute autre valeur est ignorée : on retombe sur la perspective
   * camp du catalogue (`opening.side`), comportement historique inchangé.
   */
  searchParams: Promise<{ drill?: string; side?: string }>;
}) {
  const { slug } = await params;
  const { drill, side } = await searchParams;
  const playerSideOverride = side === "black" || side === "white" ? side : undefined;
  const detail = getOpeningDetail(slug);
  if (!detail) notFound();

  // Trois lectures indépendantes de la progression/des parties importées —
  // en parallèle, comme `app/ouvertures/page.tsx`.
  const [deviations, practicedVariationKeys, variationAccuracies] = await Promise.all([
    getRepertoireDeviations(detail.plies),
    listPracticedVariationKeys(detail.opening.id),
    listOpeningVariationAccuracies(detail.opening.id),
  ]);

  return (
    <OpeningExplorer
      opening={detail.opening}
      plies={detail.plies}
      variations={detail.variations}
      drillVariationKey={drill}
      sideOverride={playerSideOverride}
      practicedVariationKeys={practicedVariationKeys}
      deviations={deviations}
      variationAccuracies={variationAccuracies}
    />
  );
}
