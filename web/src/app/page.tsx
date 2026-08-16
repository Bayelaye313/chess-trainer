import { PlayScreen } from "@/client/features/play/play-screen";
import { LinkedAccounts } from "@/client/features/home/linked-accounts";
import { RecentGamesList } from "@/client/features/home/recent-games-list";
import { MistakesShortcutCard } from "@/client/features/home/mistakes-shortcut-card";
import { ReportSummaryCard } from "@/client/features/home/report-summary-card";
import { GAMES_PAGE_SIZE, listGamesSummary } from "@/server/queries/games";
import { listDeckOverviews } from "@/server/queries/reviews";
import { getReportSummary } from "@/server/queries/progress";

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

  const [{ games, hasMore }, decks, reportSummary] = await Promise.all([
    listGamesSummary(page),
    listDeckOverviews(),
    getReportSummary(),
  ]);

  const dueTotal = decks.reduce((sum, deck) => sum + deck.dueCount + deck.newCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jouer contre des Bots</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Défie le moteur, lie ton compte Chess.com ou Lichess pour une synchro automatique, et
          garde un œil sur ta progression.
        </p>
      </div>

      <PlayScreen />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LinkedAccounts />
        <MistakesShortcutCard dueTotal={dueTotal} />
        <ReportSummaryCard summary={reportSummary} />
      </div>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
          Parties récentes
        </h2>
        <div className="mt-3">
          <RecentGamesList
            games={games}
            page={page}
            hasMore={hasMore}
            pageSize={GAMES_PAGE_SIZE}
            paginationHref={(target) => `/?page=${target}`}
            gameHref={(id) => `/analyse/${id}`}
          />
        </div>
      </section>
    </div>
  );
}
