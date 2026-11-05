import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { HomeShortcuts } from "@/client/features/home/shortcuts";
import { ResumeCourse } from "@/client/features/home/resume-course";
import { RecentGamesList } from "@/client/features/home/recent-games-list";
import { TodaySession } from "@/client/features/reviews/training-recommendations-card";
import { listGamesSummary } from "@/server/queries/games";
import { listDeckOverviews } from "@/server/queries/reviews";
import { listTrainingRecommendations } from "@/server/queries/training";
import { getTrainingPreferences } from "@/server/queries/settings";
import { getDailySessionState } from "@/server/queries/daily-plan";

// Séance du jour, cartes dues et parties récentes évoluent en continu
// (synchro en tâche de fond) : jamais de rendu figé au build.
export const dynamic = "force-dynamic";

const RECENT_GAMES = 3;

/**
 * Aujourd'hui : « Continuer » (prochaine action de la séance), les cartes à
 * réviser, deux raccourcis et les 3 dernières parties. Le plan se règle dans
 * un tiroir ; la synchro des comptes n'a plus qu'une pastille d'en-tête.
 * `/?page=<n>` (ancienne pagination des parties) redirige vers `/parties`.
 */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ page?: string; puzzle?: string }> }) {
  const { id: userId } = await requireUser();
  const { page, puzzle } = await searchParams;
  if (page !== undefined) redirect(`/parties?page=${encodeURIComponent(page)}`);

  const [{ games }, decks, recommendations, preferences, sessionState] = await Promise.all([
    listGamesSummary(userId, 1),
    listDeckOverviews(userId),
    listTrainingRecommendations(userId),
    getTrainingPreferences(userId),
    getDailySessionState(userId),
  ]);
  const dueTotal = decks.reduce((sum, deck) => sum + deck.dueCount + deck.newCount, 0);

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
      <div className="space-y-6">
        <PageHeader title="Aujourd'hui" description="Ta séance, tes révisions et tes dernières parties." className="pb-0" />
        <TodaySession recommendations={recommendations} preferences={preferences} sessionState={sessionState} initialPuzzleId={puzzle} />
        <HomeShortcuts dueTotal={dueTotal} />
        <ResumeCourse />
      </div>

      <section aria-labelledby="parties-recentes" className="lg:pt-[88px]">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="parties-recentes" className="font-display text-lg font-semibold">
            Parties récentes
          </h2>
          <Link href="/parties" className="inline-flex min-h-11 items-center gap-1 text-sm text-foreground-muted hover:text-foreground">
            Voir tout
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <RecentGamesList games={games.slice(0, RECENT_GAMES)} page={1} hasMore={false} pageSize={RECENT_GAMES} paginationHref={() => "/parties"} gameHref={(id) => `/analyse/${id}`} compact />
      </section>
    </div>
  );
}
