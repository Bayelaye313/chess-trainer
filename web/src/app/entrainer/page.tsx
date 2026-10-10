import { EsportCanvas } from "@/components/ui/esport-page";
import { ReviewsScreen } from "@/client/features/reviews/reviews-screen";
import { listDeckOverviews } from "@/server/queries/reviews";

export default async function EntrainerPage() {
  const decks = await listDeckOverviews();

  return (
    <EsportCanvas>
      <ReviewsScreen initialDecks={decks} />
    </EsportCanvas>
  );
}
