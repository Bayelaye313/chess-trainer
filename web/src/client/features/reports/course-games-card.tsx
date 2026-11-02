import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShowMore } from "@/components/ui/show-more";
import { displayOpeningName } from "@/client/features/openings/opening-display";
import { moveNumberLabel } from "@/core/curriculum/course-game-match";
import type { CourseGamesOverviewRow } from "@/server/queries/course-games";
import { accuracyTextClass } from "@/lib/labels";

/**
 * « Mes ouvertures face au cours » (onglet Rapport) : une ligne par cours
 * d'ouverture commenté que tes parties ont réellement rencontré, avec ta
 * sortie du cours la plus répétée — chaque ligne ouvre
 * `/rapport/ouvertures/[slug]`, la liste de ces parties une par une.
 */
export function CourseGamesCard({ rows }: { rows: readonly CourseGamesOverviewRow[] }) {
  const played = rows.filter((row) => row.gamesPlayed > 0);
  return (
    <section aria-labelledby="ouvertures-cours-titre">
      <h2 id="ouvertures-cours-titre" className="font-display text-lg font-semibold">
        Mes ouvertures face au cours
      </h2>
      <p className="mt-0.5 text-sm text-foreground-muted">Où tes parties quittent le cours commenté, et ce que tu y joues.</p>
      {played.length === 0 ? (
        <p className="mt-3 text-sm text-foreground-muted">Aucune de tes parties n&apos;entre encore dans un cours d&apos;ouverture.</p>
      ) : (
        <ShowMore limit={8} className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
          {played.map((row) => (
            <li key={row.openingId}>
              <Link
                href={`/rapport/ouvertures/${row.openingId}`}
                className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 hover:bg-surface-muted"
              >
                <div className="min-w-0">
                  <p className="font-medium">{displayOpeningName(row.openingName)}</p>
                  <p className="text-xs text-foreground-muted">
                    {row.gamesPlayed} partie{row.gamesPlayed > 1 ? "s" : ""}
                    {row.gamesWithCourseSide < row.gamesPlayed &&
                      ` (dont ${row.gamesPlayed - row.gamesWithCourseSide} côté adverse du cours)`}{" "}
                    · sorti du cours dans {row.gamesWithDeviation}
                    {row.topDeviation && (
                      <>
                        {" "}
                        · le plus souvent{" "}
                        <span className="font-mono text-warning">
                          {moveNumberLabel(row.topDeviation.ply)}
                          {row.topDeviation.playedSan}
                        </span>{" "}
                        ({row.topDeviation.count}×)
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {row.winRate !== null && (
                    <span className={`font-mono ${accuracyTextClass(row.winRate)}`}>{row.winRate} % de victoires</span>
                  )}
                  <ArrowRight aria-hidden="true" className="size-4 text-foreground-subtle" />
                </div>
              </Link>
            </li>
          ))}
        </ShowMore>
      )}
    </section>
  );
}
