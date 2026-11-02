import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleMinus, CircleX, Trophy, type LucideIcon } from "lucide-react";
import type { GameSummary } from "@/server/queries/games";
import { GAME_OUTCOME_LABEL, IMPORT_SOURCE_LABEL, accuracyTextClass, gameOutcomeForPlayer } from "@/lib/labels";
import { formatRelativeDate } from "@/lib/relative-time";
import { formatTimeControl } from "@/lib/time-control";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { displayOpponentName } from "@/client/features/play/bot-display";

type Outcome = ReturnType<typeof gameOutcomeForPlayer>;

/** Résultat : icône + libellé (jamais la couleur seule). */
const OUTCOME_STYLE: Record<Outcome, { icon: LucideIcon; className: string }> = {
  win: { icon: Trophy, className: "text-success" },
  loss: { icon: CircleX, className: "text-danger" },
  draw: { icon: CircleMinus, className: "text-foreground-muted" },
  unknown: { icon: CircleMinus, className: "text-foreground-subtle" },
};

function sourceLabel(source: GameSummary["source"]): string {
  return source === "local" ? "Contre le bot" : IMPORT_SOURCE_LABEL[source];
}

/**
 * Liste de parties. `compact` (accueil) : une ligne par partie, sans
 * cadence ni source. Pagination par liens (`paginationHref`).
 */
export function RecentGamesList({
  games,
  page,
  hasMore,
  pageSize,
  paginationHref,
  gameHref,
  compact = false,
}: {
  games: GameSummary[];
  page: number;
  hasMore: boolean;
  pageSize: number;
  paginationHref: (page: number) => string;
  gameHref: (id: string) => string;
  compact?: boolean;
}) {
  if (games.length === 0 && page === 1) {
    return (
      <EmptyState title="Aucune partie pour l'instant">
        Joue contre un bot ou lie ton compte Chess.com / Lichess dans les Réglages.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {games.map((game) => {
          const outcome = gameOutcomeForPlayer(game.result, game.playerColor);
          const style = OUTCOME_STYLE[outcome];
          const Icon = style.icon;
          return (
            <li key={game.id}>
              <Link href={gameHref(game.id)} className="flex min-h-14 items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-muted">
                <span className={`inline-flex w-24 shrink-0 items-center gap-1.5 font-medium ${style.className}`}>
                  <Icon aria-hidden="true" className="size-4" />
                  {GAME_OUTCOME_LABEL[outcome]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">
                    <span className="sr-only">{game.playerColor === "w" ? "Avec les Blancs contre " : "Avec les Noirs contre "}</span>
                    <span
                      aria-hidden="true"
                      className={`mr-1.5 inline-block size-2.5 rounded-full border border-border-strong align-middle ${game.playerColor === "w" ? "bg-[#f4f1ea]" : "bg-[#1b1b1b]"}`}
                    />
                    {displayOpponentName(game.opponentName)}
                    {game.opponentRating ? <span className="ml-1.5 font-mono text-xs text-foreground-muted">{game.opponentRating}</span> : null}
                  </span>
                  <span className="block truncate text-xs text-foreground-muted">
                    {compact ? formatRelativeDate(game.playedAt) : `${sourceLabel(game.source)} · ${formatTimeControl(game.timeControl)} · ${formatRelativeDate(game.playedAt)}`}
                  </span>
                </span>
                <span className={`shrink-0 font-mono text-sm ${accuracyTextClass(game.accuracy)}`} title="Précision">
                  {game.accuracy !== null ? `${game.accuracy} %` : "—"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {(page > 1 || hasMore) && (
        <nav aria-label="Pagination des parties" className="flex justify-between gap-3">
          <Link href={paginationHref(page - 1)} aria-disabled={page <= 1} className={buttonClass("ghost", "md", page <= 1 ? "pointer-events-none opacity-40" : "")}>
            <ArrowLeft aria-hidden="true" />
            Plus récentes
          </Link>
          <Link href={paginationHref(page + 1)} aria-disabled={!hasMore} className={buttonClass("ghost", "md", !hasMore ? "pointer-events-none opacity-40" : "")}>
            Plus anciennes ({pageSize} par page)
            <ArrowRight aria-hidden="true" />
          </Link>
        </nav>
      )}
    </div>
  );
}
