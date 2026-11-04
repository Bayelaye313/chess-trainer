import type { Metadata } from "next";
import { SectionSwitcher, TRAINING_SECTIONS } from "@/components/ui/section-switcher";
import { ReviewsScreen } from "@/client/features/reviews/reviews-screen";
import { listDeckOverviews } from "@/server/queries/reviews";

export const metadata: Metadata = { title: "Réviser" };
// Les cartes dues changent à chaque révision et à chaque synchro : jamais figées au build.
export const dynamic = "force-dynamic";

export default async function EntrainerPage() {
  const decks = await listDeckOverviews();
  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <SectionSwitcher links={TRAINING_SECTIONS} label="Sections de S'entraîner" />
      <ReviewsScreen initialDecks={decks} />
    </div>
  );
}
