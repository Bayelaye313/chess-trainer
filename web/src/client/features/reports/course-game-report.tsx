import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ShowMore } from "@/components/ui/show-more";
import { Stat } from "@/components/ui/stat";
import { displayOpponentName } from "@/client/features/play/bot-display";
import { moveNumberLabel, type CourseMoveOption, type RecurringMove } from "@/core/curriculum/course-game-match";
import type { CourseGameReport, CourseGameRow } from "@/server/queries/course-games";
import {
  GAME_OUTCOME_BADGE_CLASS,
  GAME_OUTCOME_LABEL,
  QUALITY_LABEL,
  QUALITY_TEXT_CLASS,
  accuracyTextClass,
  gameOutcomeForPlayer,
} from "@/lib/labels";

function courseLink(openingId: string, chapterIndex: number | null, nodeId: string | null): string {
  if (chapterIndex === null || nodeId === null) return `/ouvertures/${openingId}/cours`;
  return `/ouvertures/${openingId}/cours?chapitre=${chapterIndex}&noeud=${encodeURIComponent(nodeId)}`;
}

function expectedLabel(expected: readonly CourseMoveOption[]): string {
  return expected.map((m) => m.san).join(" ou ");
}

/** Une sortie du cours n'est pas forcément une faute : le badge dit ce que le moteur en pensait. */
function QualityTag({ quality }: { quality: RecurringMove["quality"] }) {
  return <span className={`text-xs font-medium ${QUALITY_TEXT_CLASS[quality]}`}>{QUALITY_LABEL[quality]}</span>;
}

function RecurringList({
  openingId,
  title,
  hint,
  items,
  empty,
  describe,
}: {
  openingId: string;
  title: string;
  hint: string;
  items: readonly RecurringMove[];
  empty: string;
  describe: (item: RecurringMove) => string;
}) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-0.5 text-sm text-foreground-muted">{hint}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-foreground-muted">{empty}</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item.positionKey}|${item.playedUci}`}
              className={`rounded-md border border-l-4 bg-surface px-3 py-2 ${index === 0 && item.count >= 2 ? "border-border border-l-inaccuracy" : "border-border border-l-border"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm">
                  <span className="font-mono font-semibold">
                    {moveNumberLabel(item.ply)}
                    {item.playedSan}
                  </span>{" "}
                  <span className="text-foreground-muted">— {describe(item)}</span>
                </p>
                <span className="font-mono text-sm">
                  {item.count}× <QualityTag quality={item.quality} />
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm">
                {item.chapterIndex !== null && (
                  <Link href={courseLink(openingId, item.chapterIndex, item.nodeId)} className="inline-flex min-h-11 items-center text-foreground-muted underline-offset-4 hover:text-foreground hover:underline">
                    Voir la position dans le cours
                  </Link>
                )}
                <details className="group">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 text-foreground-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
                    {item.gameIds.length} partie{item.gameIds.length > 1 ? "s" : ""}
                    <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <span className="flex flex-wrap gap-x-3">
                    {item.gameIds.map((gameId, gameIndex) => (
                      <Link key={gameId} href={`/analyse/${gameId}?course=${openingId}&reviewPly=${item.ply}`} className="inline-flex min-h-11 items-center text-foreground underline underline-offset-4">
                        Partie {gameIndex + 1}
                      </Link>
                    ))}
                  </span>
                </details>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ExitCell({ row }: { row: CourseGameRow }) {
  const { deviation, exit, followedPlies } = row.match;
  if (deviation) {
    return (
      <div>
        <p>
          <span className="font-medium text-warning">Tu as quitté le cours</span> au coup{" "}
          <span className="font-mono">
            {moveNumberLabel(deviation.ply)}
            {deviation.playedSan}
          </span>{" "}
          <QualityTag quality={deviation.quality} />
        </p>
        <p className="text-xs text-foreground-muted">Le cours prévoit {expectedLabel(deviation.expected)}</p>
      </div>
    );
  }
  if (exit?.by === "opponent") {
    return (
      <div>
        <p>
          <span className="text-foreground">L&apos;adversaire</span> sort du cours au coup{" "}
          <span className="font-mono">
            {moveNumberLabel(exit.ply)}
            {exit.playedSan}
          </span>
        </p>
        <p className="text-xs text-foreground-muted">Tu as suivi le cours sans faute ({followedPlies} demi-coups)</p>
      </div>
    );
  }
  return (
    <p>
      <span className="font-medium text-success">Cours suivi jusqu&apos;au bout</span>{" "}
      <span className="text-xs text-foreground-muted">({followedPlies} demi-coups)</span>
    </p>
  );
}

/**
 * Page « Rapport › ouverture » : tes parties dans un cours d'ouverture, une
 * par une, avec pour chacune l'endroit exact où tu as quitté le cours ; en
 * tête, la sortie du cours et la gaffe que tu répètes le plus.
 */
export function CourseGameReportView({ report }: { report: CourseGameReport }) {
  const { openingId, games } = report;
  const deviated = games.filter((g) => g.match.deviation !== null).length;
  const otherSide = games.filter((g) => !g.withCourseSide).length;
  const recurringMistakes = report.mistakes.filter((m) => m.count >= 2);
  const shownMistakes = recurringMistakes.length > 0 ? recurringMistakes.slice(0, 5) : report.mistakes.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 border-y border-border py-4 sm:grid-cols-4">
        <Tile label="Parties" value={String(games.length)} hint={otherSide > 0 ? `dont ${otherSide} côté adverse du cours` : undefined} />
        <Tile label="Sorties du cours" value={`${deviated}`} hint={games.length > 0 ? `${Math.round((deviated / games.length) * 100)}% des parties` : undefined} />
        <Tile label="Victoires en suivant le cours" value={report.winRateInCourse !== null ? `${report.winRateInCourse}%` : "—"} valueClass={accuracyTextClass(report.winRateInCourse)} />
        <Tile label="Victoires après l'avoir quitté" value={report.winRateOffCourse !== null ? `${report.winRateOffCourse}%` : "—"} valueClass={accuracyTextClass(report.winRateOffCourse)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecurringList
          openingId={openingId}
          title="Où tu quittes le cours"
          hint="Tes coups hors cours, du plus répété au plus rare."
          items={report.deviations.slice(0, 5)}
          empty="Tu n'as jamais quitté le cours quand il avait une réponse."
          describe={(item) => `au lieu de ${expectedLabel(item.expected)}`}
        />
        <RecurringList
          openingId={openingId}
          title={recurringMistakes.length > 0 ? "Les gaffes que tu répètes" : "Tes premières gaffes"}
          hint={
            recurringMistakes.length > 0
              ? "Même position, même mauvais coup, dans plusieurs parties."
              : "Aucune gaffe ne se répète encore à la même position : voici les plus précoces."
          }
          items={recurringMistakes.length > 0 ? shownMistakes : [...shownMistakes].sort((a, b) => a.ply - b.ply)}
          empty="Aucune gaffe ni imprécision dans ces parties."
          describe={(item) =>
            item.expected.length > 0 ? `le cours prévoit ${expectedLabel(item.expected)}` : item.bestSan ? `le moteur préférait ${item.bestSan}` : "hors cours"
          }
        />
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold">Toutes tes parties</h2>
        <p className="mt-0.5 text-sm text-foreground-muted">La revue démarre au coup où tu as quitté le cours.</p>
        <ShowMore limit={10} className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
          {games.map((row) => {
            const outcome = gameOutcomeForPlayer(row.result, row.playerColor);
            // La revue s'ouvre sur la position APRÈS le coup qui quitte le cours (`currentPly` = demi-coups joués).
            const startPly = row.match.deviation?.ply ?? (row.match.exit?.by === "opponent" ? row.match.exit.ply : row.match.followedPlies);
            return (
              <li key={row.gameId}>
                <Link
                  href={`/analyse/${row.gameId}?course=${openingId}&reviewPly=${startPly}`}
                  className="grid gap-2 px-4 py-2.5 text-sm hover:bg-surface-muted sm:grid-cols-[9rem_1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-medium">{displayOpponentName(row.opponentName)}</p>
                    <p className="text-xs text-foreground-muted">
                      {row.playedAt.toLocaleDateString("fr-FR")} · {row.playerColor === "w" ? "Blancs" : "Noirs"}
                      {!row.withCourseSide && " (côté adverse)"}
                    </p>
                  </div>
                  <ExitCell row={row} />
                  <div className="flex items-center gap-2 sm:justify-end">
                    {row.firstMistake && (
                      <span className={`font-mono text-xs ${QUALITY_TEXT_CLASS[row.firstMistake.quality]}`}>
                        1re {row.firstMistake.quality === "blunder" ? "gaffe" : "imprécision"} : {moveNumberLabel(row.firstMistake.ply)}
                        {row.firstMistake.san}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${GAME_OUTCOME_BADGE_CLASS[outcome]}`}>{GAME_OUTCOME_LABEL[outcome]}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ShowMore>
      </section>
    </div>
  );
}

function Tile({ label, value, valueClass, hint }: { label: string; value: string; valueClass?: string; hint?: string }) {
  return <Stat label={label} value={value} valueClassName={valueClass} hint={hint} />;
}
