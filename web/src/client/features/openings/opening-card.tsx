import Link from "next/link";
import { CircleCheck, RotateCcw } from "lucide-react";
import type { MasteryStars } from "@/core/curriculum/opening-mastery";
import type { OpeningReviewStatus } from "@/server/queries/opening-progress";
import type { OpeningSummary } from "@/server/queries/openings";
import { Chip } from "@/components/ui/chip";
import { COURSE_STATE_DISPLAY, courseState, displayOpeningName } from "./opening-display";
import { Stars } from "./stars";

const REVIEW_CHIP: Record<OpeningReviewStatus, { label: string; icon: typeof RotateCcw; tone: "warning" | "success" }> = {
  due: { label: "À réviser", icon: RotateCcw, tone: "warning" },
  mastered: { label: "Maîtrisé", icon: CircleCheck, tone: "success" },
};

/** Carte d'ouverture : nom, ECO, état du cours (icône + libellé), révision, étoiles. */
export function OpeningCard({
  opening,
  reviewStatus,
  stars,
}: {
  opening: OpeningSummary;
  reviewStatus?: OpeningReviewStatus;
  stars?: MasteryStars;
}) {
  const state = COURSE_STATE_DISPLAY[courseState(opening.id)];
  const review = reviewStatus ? REVIEW_CHIP[reviewStatus] : null;

  return (
    <Link
      href={`/ouvertures/${opening.id}`}
      className="flex min-h-[68px] flex-col justify-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-muted"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate font-medium text-foreground">{displayOpeningName(opening.name)}</span>
        <span className="shrink-0 font-mono text-xs text-foreground-subtle">{opening.eco}</span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5">
        <Chip icon={state.icon} tone={state.tone}>
          {state.label}
        </Chip>
        {review && (
          <Chip icon={review.icon} tone={review.tone}>
            {review.label}
          </Chip>
        )}
        {stars !== undefined && stars > 0 && <Stars count={stars} className="ml-auto text-xs" />}
      </span>
    </Link>
  );
}
