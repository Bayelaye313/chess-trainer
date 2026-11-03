import type { Metadata } from "next";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/page-header";
import { GamesSearchList } from "@/client/features/home/games-search-list";
import { GAMES_PAGE_SIZE, listGamesSummary } from "@/server/queries/games";

export const metadata: Metadata = { title: "Mes parties" };
export const dynamic = "force-dynamic";

/** Toutes les parties (recherche + pagination `?page=<n>`), ex-liste de l'accueil. */
export default async function PartiesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { games, hasMore } = await listGamesSummary(page);

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <PageHeader back={<BackLink href="/rapport">Progrès</BackLink>} title="Mes parties" description="Parties importées et parties contre le bot, des plus récentes aux plus anciennes." />
      <GamesSearchList games={games} page={page} hasMore={hasMore} pageSize={GAMES_PAGE_SIZE} />
    </div>
  );
}
