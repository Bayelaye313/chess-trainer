import Link from "next/link";
import { GAMES_PAGE_SIZE, listGamesSummary } from "@/server/queries/games";
import { describeGameResult, IMPORT_SOURCE_LABEL } from "@/lib/labels";

function accuracyClass(accuracy: number | null): string {
  if (accuracy === null) return "text-foreground-muted";
  if (accuracy >= 90) return "text-excellent";
  if (accuracy >= 75) return "text-good";
  if (accuracy >= 55) return "text-inaccuracy";
  return "text-blunder";
}

function sourceLabel(source: "local" | "chesscom" | "lichess"): string {
  return source === "local" ? "Local" : IMPORT_SOURCE_LABEL[source];
}

export default async function GamesPage({
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
        <h1 className="text-2xl font-semibold tracking-tight">Mes parties</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Parties jouées ou importées, avec ta précision approximative sur chacune.
        </p>
      </div>

      {games.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          Aucune partie pour l&apos;instant — joue une partie ou importe-en depuis
          Chess.com/Lichess.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {games.map((g) => (
            <li key={g.id}>
              <Link
                href={`/games/${g.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm hover:bg-surface-muted"
              >
                <div>
                  <p className="font-medium">
                    {g.playerColor === "w" ? "Blancs" : "Noirs"} contre{" "}
                    {g.opponentName ?? "adversaire inconnu"}
                    {g.opponentRating ? ` (${g.opponentRating})` : ""}
                  </p>
                  <p className="text-foreground-muted">
                    {sourceLabel(g.source)} — {g.playedAt.toLocaleDateString("fr-FR")} —{" "}
                    {g.result ? describeGameResult(g.result) : "résultat inconnu"} —{" "}
                    {g.movesAnalysed} coup{g.movesAnalysed > 1 ? "s" : ""} analysé
                    {g.movesAnalysed > 1 ? "s" : ""}
                  </p>
                </div>
                <span className={`shrink-0 font-mono text-base font-medium ${accuracyClass(g.accuracy)}`}>
                  {g.accuracy !== null ? `${g.accuracy}%` : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {(page > 1 || hasMore) && (
        <div className="flex justify-between text-sm">
          <Link
            href={`/games?page=${page - 1}`}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none text-foreground-muted opacity-40" : "text-accent"}
          >
            ← Plus récentes
          </Link>
          <Link
            href={`/games?page=${page + 1}`}
            aria-disabled={!hasMore}
            className={!hasMore ? "pointer-events-none text-foreground-muted opacity-40" : "text-accent"}
          >
            Plus anciennes ({GAMES_PAGE_SIZE}/page) →
          </Link>
        </div>
      )}
    </div>
  );
}
