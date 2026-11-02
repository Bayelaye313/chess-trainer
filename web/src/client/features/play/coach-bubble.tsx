import { GraduationCap } from "lucide-react";
import type { CoachMessage, CoachMessageTag } from "@/core/analysis/coach-narrative";
import { COACH_BUBBLE_CLASS, COACH_ICON_CLASS, COACH_TONE_CLASS, type CoachTone } from "@/components/ui/coach";

const TAG_TONE: Record<CoachMessageTag, CoachTone> = {
  deviation: "warning",
  brilliant: "brilliant",
  critical: "info",
  missed_mate: "danger",
  hanging_piece: "danger",
  king_safety: "danger",
  missed_tactic: "warning",
  weak_square: "warning",
  open_file: "warning",
  blunder: "danger",
  inaccuracy: "warning",
};

/** Commentaire du coach pendant une partie contre le bot. */
export function PlayCoachBubble({ message }: { message: CoachMessage }) {
  return (
    <div role="status" aria-live="polite" className={`${COACH_BUBBLE_CLASS} ${COACH_TONE_CLASS[TAG_TONE[message.tag]]}`}>
      <GraduationCap aria-hidden="true" className={COACH_ICON_CLASS} />
      <p className="text-foreground">{message.text}</p>
    </div>
  );
}
