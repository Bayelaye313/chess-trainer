import Link from "next/link";
import type { ReportSummary } from "@/server/queries/progress";
import { accuracyTextClass } from "@/lib/labels";

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className={`mt-0.5 font-mono text-lg font-semibold ${valueClass ?? ""}`}>{value}</p>
    </div>
  );
}

/**
 * Carte d'aperçu "Synthèse du Rapport Récent" — vue condensée de
 * `getReportSummary`, raccourci vers `/rapport`. Entrée animée en CSS pur
 * (voir la note sur Framer Motion dans `components/ui/nav.tsx`).
 */
export function ReportSummaryCard({ summary }: { summary: ReportSummary }) {
  return (
    <Link
      href="/rapport"
      className="animate-fade-up-in flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/40"
      style={{ animationDelay: "60ms" }}
    >
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
          Synthèse du rapport récent
        </p>

        {summary.gamesAnalysed === 0 ? (
          <p className="mt-3 text-sm text-foreground-muted">
            Pas encore de partie analysée — les statistiques apparaîtront ici.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat
              label="Précision globale"
              value={summary.overallAccuracy !== null ? `${summary.overallAccuracy}%` : "—"}
              valueClass={accuracyTextClass(summary.overallAccuracy)}
            />
            <Stat
              label="Taux de victoire"
              value={summary.winRate !== null ? `${summary.winRate}%` : "—"}
              valueClass={accuracyTextClass(summary.winRate)}
            />
            <Stat label="Gaffes" value={String(summary.totalBlunders)} valueClass="text-blunder" />
            <Stat label="Coups brillants" value={String(summary.totalBrilliant)} valueClass="text-brilliant" />
          </div>
        )}
      </div>
      <span className="mt-4 text-sm font-medium text-accent">Voir le rapport complet →</span>
    </Link>
  );
}
