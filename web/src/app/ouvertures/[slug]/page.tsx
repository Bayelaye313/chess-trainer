import { notFound } from "next/navigation";
import { EsportCanvas } from "@/components/ui/esport-page";
import { compareOpenings } from "@/client/features/openings/opening-endurance-history";
import { OpeningExplorer } from "@/client/features/openings/opening-explorer";
import { OpeningStatsZone } from "@/client/features/openings/opening-stats-zone";
import { SANS_GUIDE_MODE } from "@/client/features/openings/opening-stats";
import { listEnduranceSessions } from "@/server/queries/opening-endurance";
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
   * `?mode=sans-guide` (bouton de la Zone Stats) : le drill démarre en
   * Manche 2, indices désactivés. Toute autre valeur est ignorée.
   */
  searchParams: Promise<{ drill?: string; side?: string; mode?: string }>;
}) {
  const { slug } = await params;
  const { drill, side, mode } = await searchParams;
  const playerSideOverride = side === "black" || side === "white" ? side : undefined;
  const detail = getOpeningDetail(slug);
  if (!detail) notFound();

  // Quatre lectures indépendantes de la progression/des parties importées —
  // en parallèle, comme `app/ouvertures/page.tsx`. L'historique d'endurance
  // est lu en entier : le rang de cette ouverture dépend des autres.
  const [deviations, practicedVariationKeys, variationAccuracies, enduranceSessions] = await Promise.all([
    getRepertoireDeviations(detail.plies),
    listPracticedVariationKeys(detail.opening.id),
    listOpeningVariationAccuracies(detail.opening.id),
    listEnduranceSessions(),
  ]);

  return (
    <EsportCanvas detail>
    <div className="space-y-6">
    <OpeningStatsZone
      openingId={detail.opening.id}
      openingName={detail.opening.name}
      playerSide={playerSideOverride ?? detail.opening.side}
      ranking={compareOpenings(enduranceSessions)}
    />
    <OpeningExplorer
      opening={detail.opening}
      plies={detail.plies}
      variations={detail.variations}
      drillVariationKey={drill}
      sideOverride={playerSideOverride}
      startInSansGuide={mode === SANS_GUIDE_MODE}
      practicedVariationKeys={practicedVariationKeys}
      deviations={deviations}
      variationAccuracies={variationAccuracies}
    />
    </div>
    </EsportCanvas>
  );
}
