import Link from "next/link";
import type { MasteryStars } from "@/core/curriculum/opening-mastery";
import type { OpeningReviewStatus } from "@/server/queries/opening-progress";
import type { OpeningSummary } from "@/server/queries/openings";
import { SIDE_LABEL, SideDot } from "./side-dot";
import { Stars } from "./stars";

/** Pas de badge tant que l'ouverture n'a jamais été pratiquée en Mode Entraînement — voir `listOpeningReviewSummaries`. */
const REVIEW_BADGE: Record<OpeningReviewStatus, { label: string; className: string }> = {
  due: { label: "🔴 À réviser", className: "border-blunder/40 bg-blunder/10 text-blunder" },
  mastered: { label: "🟢 Maîtrisé", className: "border-best/40 bg-best/10 text-best" },
};

export function OpeningCard({
  opening,
  reviewStatus,
  stars,
}: {
  opening: OpeningSummary;
  reviewStatus?: OpeningReviewStatus;
  /** Étoiles agrégées (précision moyenne de toutes les variantes suivies) — `undefined` tant que l'ouverture n'a jamais été pratiquée, voir `listOpeningMasterySummaries`. */
  stars?: MasteryStars;
}) {
  const badge = reviewStatus ? REVIEW_BADGE[reviewStatus] : null;

  return (
    <Link
      href={`/ouvertures/${opening.id}`}
      className="flex flex-col rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{opening.name}</h3>
        <span className="shrink-0 rounded-full border border-book/40 bg-book/10 px-2 py-0.5 text-[11px] font-medium text-book">
          {opening.eco}
        </span>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-foreground-muted">
        <SideDot side={opening.side} />
        {SIDE_LABEL[opening.side]}
      </div>

      <p className="mt-2 line-clamp-2 flex-1 text-xs text-foreground-muted">{opening.description}</p>

      {(badge || stars !== undefined) && (
        <div className="mt-2 flex items-center gap-2">
          {badge && (
            <span className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge.className}`}>
              {badge.label}
            </span>
          )}
          {stars !== undefined && <Stars count={stars} className="text-xs" />}
        </div>
      )}

      <p className="mt-3 truncate border-t border-border pt-2 font-mono text-[11px] text-foreground-muted">
        {opening.preview}
      </p>
    </Link>
  );
}
