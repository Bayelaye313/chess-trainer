import Link from "next/link";
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
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">Mes ouvertures face au cours</h2>
      <p className="mt-1 text-xs text-foreground-muted">
        Chaque partie rejouée dans le cours commenté : où tu l&apos;as quitté, et le coup que tu y joues le plus souvent.
      </p>
      {played.length === 0 ? (
        <p className="mt-3 text-sm text-foreground-muted">Aucune de tes parties n&apos;entre encore dans un cours d&apos;ouverture.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {played.map((row) => (
            <li key={row.openingId}>
              <Link
                href={`/rapport/ouvertures/${row.openingId}`}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 hover:bg-surface-muted/50"
              >
                <div className="min-w-0">
                  <p className="font-medium">{row.openingName}</p>
                  <p className="text-xs text-foreground-muted">
                    {row.gamesPlayed} partie{row.gamesPlayed > 1 ? "s" : ""}
                    {row.gamesWithCourseSide < row.gamesPlayed &&
                      ` (dont ${row.gamesPlayed - row.gamesWithCourseSide} côté adverse du cours)`}{" "}
                    · sorti du cours dans {row.gamesWithDeviation}
                    {row.topDeviation && (
                      <>
                        {" "}
                        · le plus souvent{" "}
                        <span className="font-mono text-inaccuracy">
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
                    <span className={`font-mono ${accuracyTextClass(row.winRate)}`}>{row.winRate}% victoires</span>
                  )}
                  <span className="text-accent">Voir les parties →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
