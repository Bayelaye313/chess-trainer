import type { ReactNode } from "react";
import { Dumbbell, TriangleAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ShowMore } from "@/components/ui/show-more";
import { Stat } from "@/components/ui/stat";
import { displayOpeningName } from "@/client/features/openings/opening-display";
import type { GamePhase } from "@/core/chess/types";
import { MAIN_LINE_VARIATION_KEY } from "@/core/curriculum/opening-variation-key";
import type { PlayerProgressOverview } from "@/server/queries/progress";
import type { TrackedTacticalMotif } from "@/core/analysis/types";
import { MOTIF_LABEL, PHASE_LABEL, accuracyBarClass, accuracyTextClass } from "@/lib/labels";

const PHASE_ORDER: readonly GamePhase[] = ["opening", "middlegame", "endgame"];
const MOTIF_ORDER: readonly TrackedTacticalMotif[] = ["fork", "pin"];

function ProgressBar({ ratio, barClass, label }: { ratio: number; barClass: string; label: string }) {
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio)} className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
      <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.max(0, Math.min(100, ratio))}%` }} />
    </div>
  );
}

function PercentRow({ label, value, detail }: { label: string; value: number | null; detail: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-foreground-muted">
          <span className={`font-mono ${accuracyTextClass(value)}`}>{value !== null ? `${value} %` : "—"}</span> · {detail}
        </span>
      </div>
      <div className="mt-1.5">
        <ProgressBar ratio={value ?? 0} barClass={accuracyBarClass(value)} label={label} />
      </div>
    </div>
  );
}

function PhaseAccuracy({ phaseAccuracy }: { phaseAccuracy: PlayerProgressOverview["phaseAccuracy"] }) {
  return (
    <section aria-labelledby="phases-titre">
      <h2 id="phases-titre" className="mb-3 font-display text-lg font-semibold">
        Précision par phase
      </h2>
      <div className="space-y-4">
        {PHASE_ORDER.map((phase) => {
          const stats = phaseAccuracy[phase];
          return <PercentRow key={phase} label={PHASE_LABEL[phase]} value={stats.accuracy} detail={`${stats.movesAnalysed} coup${stats.movesAnalysed > 1 ? "s" : ""}`} />;
        })}
      </div>
    </section>
  );
}

function TacticalMotifs({ tacticalMotifs }: { tacticalMotifs: PlayerProgressOverview["tacticalMotifs"] }) {
  return (
    <section aria-labelledby="motifs-titre">
      <h2 id="motifs-titre" className="font-display text-lg font-semibold">
        Fourchettes et clouages
      </h2>
      <p className="mb-3 text-sm text-foreground-muted">Occasions trouvées contre manquées.</p>
      <div className="space-y-4">
        {MOTIF_ORDER.map((motif) => {
          const stats = tacticalMotifs[motif];
          const total = stats.found + stats.missed;
          return <PercentRow key={motif} label={MOTIF_LABEL[motif]} value={stats.successRate} detail={`${stats.found}/${total} trouvée${stats.found > 1 ? "s" : ""}`} />;
        })}
      </div>
    </section>
  );
}

/** Lignes du tableau visibles avant « Voir tout ». */
const OPENING_ROWS = 8;

export function OpeningPerformanceTable({ openingPerformance }: { openingPerformance: PlayerProgressOverview["openingPerformance"] }) {
  return (
    <section aria-labelledby="perf-ouvertures-titre">
      <h2 id="perf-ouvertures-titre" className="mb-3 font-display text-lg font-semibold">
        Performance par ouverture
      </h2>
      {openingPerformance.length === 0 ? (
        <p className="text-sm text-foreground-muted">Aucune ouverture identifiée pour l&apos;instant : les parties importées n&apos;ont pas encore de code ECO.</p>
      ) : (
        <ShowMore
          limit={OPENING_ROWS}
          variant="table"
          className="w-full text-sm"
          head={
            <thead className="bg-surface">
              <tr className="text-left text-foreground-muted">
                <th scope="col" className="px-3 py-2 font-medium">Ouverture</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Parties</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Victoires</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Précision</th>
                <th scope="col" className="px-3 py-2 text-right font-medium" title="Demi-coup moyen de ta première gaffe">1re gaffe (ply)</th>
              </tr>
            </thead>
          }
        >
          {openingPerformance.map((opening) => (
            <tr key={opening.eco}>
              <td className="px-3 py-2">
                <p className="font-medium">{displayOpeningName(opening.name)}</p>
                <p className="font-mono text-xs text-foreground-subtle">{opening.eco}</p>
              </td>
              <td className="px-3 py-2 text-right font-mono text-foreground-muted">{opening.gamesPlayed}</td>
              <td className={`px-3 py-2 text-right font-mono ${accuracyTextClass(opening.winRate)}`}>{opening.winRate} %</td>
              <td className={`px-3 py-2 text-right font-mono ${accuracyTextClass(opening.accuracy)}`}>{opening.accuracy !== null ? `${opening.accuracy} %` : "—"}</td>
              <td className="px-3 py-2 text-right font-mono text-foreground-muted">{opening.avgMistakePly ?? "—"}</td>
            </tr>
          ))}
        </ShowMore>
      )}
    </section>
  );
}

function StrugglingOpeningBanner({ opening }: { opening: PlayerProgressOverview["strugglingOpening"] }) {
  if (!opening) return null;
  const plySentence = opening.avgMistakePly !== null ? ` Tu as tendance à faire des gaffes au coup ${opening.avgMistakePly}.` : "";
  return (
    <div role="note" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-l-4 border-border border-l-blunder bg-surface px-4 py-3">
      <p className="flex min-w-0 flex-1 items-start gap-2 text-sm text-foreground">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
        <span>
          <span className="font-medium">Ouverture en difficulté :</span> <span className="font-mono">{opening.winRate} %</span> de victoires avec{" "}
          {displayOpeningName(opening.name)}.{plySentence}
        </span>
      </p>
      {opening.openingSlug && (
        <ButtonLink href={`/ouvertures/${opening.openingSlug}?drill=${MAIN_LINE_VARIATION_KEY}&side=${opening.playerSide === "b" ? "black" : "white"}`}>
          <Dumbbell aria-hidden="true" />
          Driller cette ouverture
        </ButtonLink>
      )}
    </div>
  );
}

/**
 * Progrès : 3 chiffres, précision par phase et motifs, puis `courseGames`
 * (« Mes ouvertures face au cours ») AVANT le tableau par ouverture.
 */
export function ProgressOverview({ overview, courseGames }: { overview: PlayerProgressOverview; courseGames?: ReactNode }) {
  if (overview.gamesAnalysed === 0) {
    return (
      <EmptyState title="Aucune partie analysée pour l'instant">
        Joue une partie ou lie ton compte Chess.com / Lichess dans les Réglages pour voir ton profil de progression.
      </EmptyState>
    );
  }

  const { blunderCount, totalBlunders } = overview.hangingPieces;
  const hangingRate = totalBlunders > 0 ? Math.round((blunderCount / totalBlunders) * 100) : null;

  return (
    <div className="space-y-8">
      <StrugglingOpeningBanner opening={overview.strugglingOpening} />

      <div className="grid grid-cols-3 gap-4 border-y border-border py-4">
        <Stat label="Précision globale" value={overview.overallAccuracy !== null ? `${overview.overallAccuracy} %` : "—"} valueClassName={accuracyTextClass(overview.overallAccuracy)} />
        <Stat label="Parties analysées" value={overview.gamesAnalysed} />
        <Stat
          label="Pièces laissées en prise"
          value={hangingRate !== null ? `${hangingRate} %` : "—"}
          hint={totalBlunders > 0 ? `${blunderCount} sur ${totalBlunders} gaffe${totalBlunders > 1 ? "s" : ""}` : "Aucune gaffe analysée"}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <PhaseAccuracy phaseAccuracy={overview.phaseAccuracy} />
        <TacticalMotifs tacticalMotifs={overview.tacticalMotifs} />
      </div>

      {courseGames}

      <OpeningPerformanceTable openingPerformance={overview.openingPerformance} />
    </div>
  );
}
