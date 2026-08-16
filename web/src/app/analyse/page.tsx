import { RecentGamesList } from "@/client/features/home/recent-games-list";
import { GAMES_PAGE_SIZE, listGamesSummary } from "@/server/queries/games";

// Les nouvelles parties arrivent en continu via la synchro en tâche de fond —
// jamais de rendu statique figé au build, comme l'accueil.
export const dynamic = "force-dynamic";

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { games, hasMore } = await listGamesSummary(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analyse</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Choisis une partie pour la revoir coup par coup : qualité de chaque coup, barre
          d&apos;évaluation, exploration libre.
        </p>
      </div>

      <RecentGamesList
        games={games}
        page={page}
        hasMore={hasMore}
        pageSize={GAMES_PAGE_SIZE}
        paginationHref={(target) => `/analyse?page=${target}`}
        gameHref={(id) => `/analyse/${id}`}
      />
    </div>
  );
}
