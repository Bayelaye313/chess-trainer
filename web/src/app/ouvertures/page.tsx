import { EsportCanvas } from "@/components/ui/esport-page";
import { OpeningsScreen } from "@/client/features/openings/openings-screen";
import { listDueReviews, listOpeningMasterySummaries, listOpeningReviewSummaries } from "@/server/queries/opening-progress";
import { listEnduranceSessions } from "@/server/queries/opening-endurance";
import { listOpenings } from "@/server/queries/openings";

export default async function OuverturesPage() {
  const [reviewSummaries, dueReviews, masterySummaries, enduranceSessions] = await Promise.all([
    listOpeningReviewSummaries(),
    listDueReviews(),
    listOpeningMasterySummaries(),
    listEnduranceSessions(),
  ]);
  return (
    <EsportCanvas>
    <OpeningsScreen
      openings={listOpenings()}
      // Un composant client ne reçoit que des props sérialisables au sens RSC
      // — comme `DeckOverview` (`server/queries/reviews.ts`), on ne fait
      // jamais traverser cette frontière avec une `Date` brute : seuls les
      // champs réellement affichés par `OpeningsScreen` passent (`status`,
      // jamais `nextReviewDate`).
      reviewStatuses={reviewSummaries.map(({ openingId, status }) => ({ openingId, status }))}
      dueReviews={dueReviews.map(({ openingId, variationKey, variationLabel }) => ({
        openingId,
        variationKey,
        variationLabel,
      }))}
      masterySummaries={masterySummaries}
      // `playedAt` déjà en ISO : la liste traverse telle quelle la frontière RSC.
      enduranceSessions={enduranceSessions}
    />
    </EsportCanvas>
  );
}
