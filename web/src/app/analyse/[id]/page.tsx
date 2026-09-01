import { notFound } from "next/navigation";
import { GameReviewScreen, type GameDeviation } from "@/client/features/games/game-review-screen";
import { getGameDetail } from "@/server/queries/games";
import { getOpeningDetail } from "@/server/queries/openings";

export default async function GameDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  /**
   * `?openingId=&ply=` : lien depuis le journal « Erreurs d'ouverture »
   * (`OpeningMistakesHub`) — ouvre directement cette partie au coup exact où
   * elle a quitté la théorie de `openingId`. Résolu ici plutôt que passé tel
   * quel : le coup théorique attendu est recalculé côté serveur depuis le
   * catalogue (`getOpeningDetail`), jamais fait confiance à des paramètres
   * d'URL qui pourraient être périmés ou trafiqués.
   */
  searchParams: Promise<{ openingId?: string; ply?: string }>;
}) {
  const { id } = await params;
  const { openingId, ply } = await searchParams;
  const detail = await getGameDetail(id);
  if (!detail) notFound();

  const deviation = resolveDeviation(openingId, ply);

  return (
    <GameReviewScreen
      game={detail.game}
      timeline={detail.timeline}
      accuracy={detail.accuracy}
      overview={detail.overview}
      deviation={deviation}
    />
  );
}

/**
 * Résout `?openingId=&ply=` vers le coup théorique attendu à cette
 * profondeur — `null` si les paramètres sont absents, invalides, ou pointent
 * vers une position que le catalogue ne couvre plus (ouverture modifiée
 * depuis) : `GameReviewScreen` retombe alors simplement sur son affichage
 * normal, sans bandeau de déviation.
 */
function resolveDeviation(openingId: string | undefined, plyParam: string | undefined): GameDeviation | null {
  if (!openingId || !plyParam) return null;
  const ply = Number(plyParam);
  if (!Number.isInteger(ply) || ply < 1) return null;

  const openingDetail = getOpeningDetail(openingId);
  const expected = openingDetail?.plies[ply - 1];
  if (!openingDetail || !expected) return null;

  return { ply, expectedSan: expected.san, expectedUci: expected.uci, openingName: openingDetail.opening.name };
}
