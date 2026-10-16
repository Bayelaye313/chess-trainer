import Link from "next/link";
import type { GameSummary } from "@/server/queries/games";
import {
  GAME_OUTCOME_BADGE_CLASS,
  GAME_OUTCOME_LABEL,
  IMPORT_SOURCE_LABEL,
  accuracyTextClass,
  gameOutcomeForPlayer,
} from "@/lib/labels";
import { formatRelativeDate } from "@/lib/relative-time";
import { formatTimeControl } from "@/lib/time-control";

function sourceLabel(source: GameSummary["source"]): string {
  return source === "local" ? "Contre le moteur" : IMPORT_SOURCE_LABEL[source];
}

/** ♔ pour les Blancs, ♚ pour les Noirs — même glyphe des deux côtés, le trait fait la couleur. */
function PlayerColorIcon({ color }: { color: "w" | "b" }) {
  return (
    <span
      aria-hidden="true"
      className={`text-lg leading-none ${color === "w" ? "text-foreground" : "text-foreground-muted"}`}
    >
      {color === "w" ? "♔" : "♚"}
    </span>
  );
}

/**
 * Flux "Parties récentes" façon chessrank.org — lignes scannables, réutilisé
 * tel quel sur l'accueil (aperçu) et sur `/analyse` (écran de sélection avant
 * la revue coup par coup). `paginationHref`/`gameHref` diffèrent selon
 * l'appelant, le reste de la présentation est identique.
 */
export function RecentGamesList({
  games,
  page,
  hasMore,
  pageSize,
  paginationHref,
  gameHref,
}: {
  games: GameSummary[];
  page: number;
  hasMore: boolean;
  pageSize: number;
  paginationHref: (page: number) => string;
  gameHref: (id: string) => string;
}) {
  if (games.length === 0 && page === 1) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
        Aucune partie pour l&apos;instant — joue un bot ci-dessus ou lie ton compte Chess.com/Lichess.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {games.map((game) => {
          const outcome = gameOutcomeForPlayer(game.result, game.playerColor);
          return (
            <li key={game.id}>
              <Link
                href={gameHref(game.id)}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm transition-colors hover:bg-surface-muted"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${GAME_OUTCOME_BADGE_CLASS[outcome]}`}
                >
                  {GAME_OUTCOME_LABEL[outcome]}
                </span>

                <PlayerColorIcon color={game.playerColor} />

                <span className="min-w-0 flex-1 truncate font-medium">
                  {game.opponentName ?? "Adversaire inconnu"}
                  {game.opponentRating ? (
                    <span className="ml-1.5 font-mono text-xs text-foreground-muted">
                      {game.opponentRating}
                    </span>
                  ) : null}
                </span>

                <span className="shrink-0 text-xs text-foreground-muted">
                  {sourceLabel(game.source)} · {formatTimeControl(game.timeControl)}
                </span>

                <span className="shrink-0 text-xs text-foreground-muted">
                  {formatRelativeDate(game.playedAt)}
                </span>

                <span
                  className={`shrink-0 font-mono text-sm font-medium ${accuracyTextClass(game.accuracy)}`}
                >
                  {game.accuracy !== null ? `${game.accuracy}%` : "—"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {(page > 1 || hasMore) && (
        <div className="flex justify-between text-sm">
          <Link
            href={paginationHref(page - 1)}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none text-foreground-muted opacity-40" : "text-accent"}
          >
            ← Plus récentes
          </Link>
          <Link
            href={paginationHref(page + 1)}
            aria-disabled={!hasMore}
            className={!hasMore ? "pointer-events-none text-foreground-muted opacity-40" : "text-accent"}
          >
            Voir plus ({pageSize}/page) →
          </Link>
        </div>
      )}
    </div>
  );
}
