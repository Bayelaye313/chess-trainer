import type { GamePhase } from "@/core/chess/types";
import type { PlayerProgressOverview } from "@/server/queries/progress";
import type { TrackedTacticalMotif } from "@/core/analysis/types";
import { MOTIF_LABEL, PHASE_LABEL, accuracyBarClass, accuracyTextClass } from "@/lib/labels";

const PHASE_ORDER: readonly GamePhase[] = ["opening", "middlegame", "endgame"];
const MOTIF_ORDER: readonly TrackedTacticalMotif[] = ["fork", "pin"];

function StatTile({
  label,
  value,
  valueClass,
  hint,
}: {
  label: string;
  value: string;
  valueClass?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold ${valueClass ?? ""}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-foreground-muted">{hint}</p>}
    </div>
  );
}

/** Barre horizontale simple : `ratio` de 0 à 100, aucune dépendance externe. */
function ProgressBar({ ratio, barClass }: { ratio: number; barClass: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${barClass}`}
        style={{ width: `${Math.max(0, Math.min(100, ratio))}%` }}
      />
    </div>
  );
}

function PhaseAccuracyCard({ phaseAccuracy }: { phaseAccuracy: PlayerProgressOverview["phaseAccuracy"] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
        Précision par phase de jeu
      </h2>
      <div className="mt-4 space-y-4">
        {PHASE_ORDER.map((phase) => {
          const stats = phaseAccuracy[phase];
          return (
            <div key={phase}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{PHASE_LABEL[phase]}</span>
                <span className="text-foreground-muted">
                  {stats.accuracy !== null ? (
                    <span className={`font-mono ${accuracyTextClass(stats.accuracy)}`}>{stats.accuracy}%</span>
                  ) : (
                    <span className="font-mono">—</span>
                  )}{" "}
                  · {stats.movesAnalysed} coup{stats.movesAnalysed > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-1.5">
                <ProgressBar ratio={stats.accuracy ?? 0} barClass={accuracyBarClass(stats.accuracy)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TacticalMotifsCard({ tacticalMotifs }: { tacticalMotifs: PlayerProgressOverview["tacticalMotifs"] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
        Fourchettes et clouages
      </h2>
      <p className="mt-1 text-xs text-foreground-muted">
        Occasions où le meilleur coup exploitait le motif : trouvées contre manquées.
      </p>
      <div className="mt-4 space-y-4">
        {MOTIF_ORDER.map((motif) => {
          const stats = tacticalMotifs[motif];
          const total = stats.found + stats.missed;
          return (
            <div key={motif}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{MOTIF_LABEL[motif]}</span>
                <span className="text-foreground-muted">
                  {stats.successRate !== null ? (
                    <span className={`font-mono ${accuracyTextClass(stats.successRate)}`}>
                      {stats.successRate}%
                    </span>
                  ) : (
                    <span className="font-mono">—</span>
                  )}{" "}
                  · {stats.found}/{total} trouvée{stats.found > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-1.5">
                <ProgressBar ratio={stats.successRate ?? 0} barClass={accuracyBarClass(stats.successRate)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpeningPerformanceCard({
  openingPerformance,
}: {
  openingPerformance: PlayerProgressOverview["openingPerformance"];
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 sm:col-span-2">
      <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">Performance par ouverture</h2>
      {openingPerformance.length === 0 ? (
        <p className="mt-3 text-sm text-foreground-muted">
          Aucune ouverture identifiée pour l&apos;instant — les parties importées n&apos;ont pas encore de code ECO.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-foreground-muted">
                <th className="py-1.5 pr-4 font-medium">Ouverture</th>
                <th className="py-1.5 pr-4 font-medium">Parties</th>
                <th className="py-1.5 pr-4 font-medium">Victoires</th>
                <th className="py-1.5 pr-4 font-medium">Précision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {openingPerformance.map((opening) => (
                <tr key={opening.eco}>
                  <td className="py-2 pr-4">
                    <p className="font-medium">{opening.name}</p>
                    <p className="font-mono text-xs text-foreground-muted">{opening.eco}</p>
                  </td>
                  <td className="py-2 pr-4 text-foreground-muted">{opening.gamesPlayed}</td>
                  <td className="py-2 pr-4">
                    <span className={`font-mono ${accuracyTextClass(opening.winRate)}`}>{opening.winRate}%</span>
                  </td>
                  <td className="py-2 pr-4">
                    {opening.accuracy !== null ? (
                      <span className={`font-mono ${accuracyTextClass(opening.accuracy)}`}>
                        {opening.accuracy}%
                      </span>
                    ) : (
                      <span className="font-mono text-foreground-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Onglet « Rapport » : agrège les quatre axes de `aggregatePlayerProgress`
 * (voir `core/analysis/progress-insights.ts`) en cartes Tailwind — pas de
 * bibliothèque de graphes, de simples barres de progression HTML/CSS
 * suffisent à cette étape.
 */
export function ProgressOverview({ overview }: { overview: PlayerProgressOverview }) {
  if (overview.gamesAnalysed === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
        Aucune partie analysée pour l&apos;instant — joue une partie ou importe-en depuis Chess.com/Lichess pour
        voir apparaître ton profil de progression.
      </p>
    );
  }

  const { blunderCount, totalBlunders } = overview.hangingPieces;
  const hangingRate = totalBlunders > 0 ? Math.round((blunderCount / totalBlunders) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile
          label="Précision globale"
          value={overview.overallAccuracy !== null ? `${overview.overallAccuracy}%` : "—"}
          valueClass={accuracyTextClass(overview.overallAccuracy)}
        />
        <StatTile label="Parties analysées" value={String(overview.gamesAnalysed)} />
        <StatTile
          label="Pièces laissées en prise"
          value={hangingRate !== null ? `${hangingRate}%` : "—"}
          valueClass={hangingRate !== null && hangingRate > 0 ? "text-blunder" : ""}
          hint={
            totalBlunders > 0
              ? `${blunderCount} sur ${totalBlunders} gaffe${totalBlunders > 1 ? "s" : ""}`
              : "Aucune gaffe analysée"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PhaseAccuracyCard phaseAccuracy={overview.phaseAccuracy} />
        <TacticalMotifsCard tacticalMotifs={overview.tacticalMotifs} />
        <OpeningPerformanceCard openingPerformance={overview.openingPerformance} />
      </div>
    </div>
  );
}
