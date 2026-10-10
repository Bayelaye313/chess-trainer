import { EsportCanvas, EsportHeader } from "@/components/ui/esport-page";
import { PlayScreen } from "@/client/features/play/play-screen";
import { LinkedAccounts } from "@/client/features/home/linked-accounts";
import { GamesSearchList } from "@/client/features/home/games-search-list";
import { MistakesShortcutCard } from "@/client/features/home/mistakes-shortcut-card";
import { ReportSummaryCard } from "@/client/features/home/report-summary-card";
import { TrainingRecommendationsCard } from "@/client/features/reviews/training-recommendations-card";
import { GAMES_PAGE_SIZE, listGamesSummary } from "@/server/queries/games";
import { listDeckOverviews } from "@/server/queries/reviews";
import { getReportSummary } from "@/server/queries/progress";
import { listTrainingRecommendations } from "@/server/queries/training";
import { getTrainingPreferences } from "@/server/queries/settings";

// Tableau de bord principal : parties récentes, decks dus et synthèse du
// rapport évoluent en continu (synchro en tâche de fond) — jamais de rendu
// statique figé au build.
export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ games, hasMore }, decks, reportSummary, recommendations, preferences] = await Promise.all([
    listGamesSummary(page),
    listDeckOverviews(),
    getReportSummary(),
    listTrainingRecommendations(),
    getTrainingPreferences(),
  ]);

  const dueTotal = decks.reduce((sum, deck) => sum + deck.dueCount + deck.newCount, 0);

  return (
    <EsportCanvas>
    <div className="space-y-8">
      <EsportHeader eyebrow="Arène / 01" title="Défie le moteur.">
        Joue contre des bots, lie ton compte Chess.com ou Lichess pour une synchro automatique, et
        garde un œil sur ta progression.
      </EsportHeader>

      <PlayScreen />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LinkedAccounts />
        <MistakesShortcutCard dueTotal={dueTotal} />
        <ReportSummaryCard summary={reportSummary} />
        <TrainingRecommendationsCard recommendations={recommendations} preferences={preferences} />
      </div>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
          Parties récentes
        </h2>
        <div className="mt-3">
          <GamesSearchList games={games} page={page} hasMore={hasMore} pageSize={GAMES_PAGE_SIZE} />
        </div>
      </section>
    </div>
    </EsportCanvas>
  );
}
