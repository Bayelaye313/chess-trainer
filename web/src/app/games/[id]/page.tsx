import { notFound } from "next/navigation";
import { GameReviewScreen } from "@/client/features/games/game-review-screen";
import { getGameDetail } from "@/server/queries/games";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getGameDetail(id);
  if (!detail) notFound();

  return (
    <GameReviewScreen
      game={detail.game}
      timeline={detail.timeline}
      accuracy={detail.accuracy}
      overview={detail.overview}
    />
  );
}
