/**
 * Tableau Statistique Consolidé — l'onglet Rapport (`app/rapport/page.tsx`) :
 * remplace l'ancienne section « Mes Chefs-d'œuvre » (déplacée en liste dédiée,
 * voir `app/rapport/brillants/page.tsx`) par un décompte global des qualités
 * de coup sur tout l'historique importé (`getMoveQualityTally`,
 * `server/queries/progress.ts`) — audit UX du 2026-09-02.
 *
 * Composant serveur, pas de state : un simple tableau, même palette que
 * `HallOfFame`/`ProgressOverview` (`QUALITY_SYMBOL`/`QUALITY_BG_CLASS`, voir
 * `lib/labels.ts`).
 */
import Link from "next/link";
import type { MoveQuality } from "@/core/chess/types";
import type { QualityTally } from "@/core/analysis/timeline";
import { QUALITY_BADGE_INK_CLASS, QUALITY_BG_CLASS, QUALITY_LABEL, QUALITY_SYMBOL } from "@/lib/labels";

/** Les 5 qualités demandées par l'audit — `okay`/`book` n'ont pas leur place dans un décompte de PERFORMANCE (un coup "correct" ou une position théorique ne sont ni une réussite ni une faute). */
const SUMMARY_QUALITIES: readonly MoveQuality[] = ["brilliant", "critical", "best", "inaccuracy", "blunder"];

function QualityRow({ quality, count }: { quality: MoveQuality; count: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${QUALITY_BG_CLASS[quality]} ${QUALITY_BADGE_INK_CLASS[quality]}`}
        aria-hidden="true"
      >
        {QUALITY_SYMBOL[quality]}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{QUALITY_LABEL[quality]}</p>
        <p className="font-mono text-xl font-semibold text-foreground">{count}</p>
      </div>
    </div>
  );
}

export function QualitySummaryTable({ tally }: { tally: QualityTally }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">📊 Tableau statistique</h2>
        <Link href="/rapport/brillants" className="text-sm text-accent hover:underline">
          Voir l&apos;historique de mes coups brillants →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SUMMARY_QUALITIES.map((quality) => (
          <QualityRow key={quality} quality={quality} count={tally[quality]} />
        ))}
      </div>
    </div>
  );
}
