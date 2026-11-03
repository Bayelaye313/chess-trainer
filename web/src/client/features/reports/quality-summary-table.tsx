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
import { ArrowRight } from "lucide-react";
import type { MoveQuality } from "@/core/chess/types";
import type { QualityTally } from "@/core/analysis/timeline";
import { QUALITY_BADGE_INK_CLASS, QUALITY_BG_CLASS, QUALITY_LABEL, QUALITY_SYMBOL } from "@/lib/labels";

/** Les 5 qualités demandées par l'audit — `okay`/`book` n'ont pas leur place dans un décompte de PERFORMANCE (un coup "correct" ou une position théorique ne sont ni une réussite ni une faute). */
const SUMMARY_QUALITIES: readonly MoveQuality[] = ["brilliant", "critical", "best", "inaccuracy", "blunder"];

function QualityRow({ quality, count }: { quality: MoveQuality; count: number }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-sm font-medium ${QUALITY_BG_CLASS[quality]} ${QUALITY_BADGE_INK_CLASS[quality]}`}
        aria-hidden="true"
      >
        {QUALITY_SYMBOL[quality]}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-lg text-foreground">{count}</p>
        <p className="text-sm text-foreground-muted">{QUALITY_LABEL[quality]}</p>
      </div>
    </div>
  );
}

/** Décompte des qualités de coup sur toutes les parties analysées. */
export function QualitySummaryTable({ tally }: { tally: QualityTally }) {
  return (
    <section aria-labelledby="qualites-titre">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="qualites-titre" className="font-display text-lg font-semibold">
          Qualité de tes coups
        </h2>
        <Link href="/rapport/brillants" className="inline-flex min-h-11 items-center gap-1 text-sm text-foreground-muted hover:text-foreground">
          Mes coups brillants
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-5">
        {SUMMARY_QUALITIES.map((quality) => (
          <QualityRow key={quality} quality={quality} count={tally[quality]} />
        ))}
      </div>
    </section>
  );
}
