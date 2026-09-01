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
  /** `?drill=<clé>` : relance directe d'une variante précise — voir `OpeningsScreen`/`review-queue.ts`. */
  searchParams: Promise<{ drill?: string }>;
}) {
  const { slug } = await params;
  const { drill } = await searchParams;
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
      practicedVariationKeys={practicedVariationKeys}
      deviations={deviations}
      variationAccuracies={variationAccuracies}
    />
  );
}
