/**
 * Bulle de dialogue du Coach Virtuel, en Revue de partie
 * (`game-review-screen.tsx`) — met en forme un `CoachMessage`
 * (`core/analysis/coach-narrative.ts`), déjà en français, déjà complet.
 *
 * Distincte de `client/features/learn/coach-bubble.tsx` (même habillage,
 * mais props et domaine différents — l'Académie n'a ni `quality` ni
 * `MoveQuality`) : pas de dépendance croisée entre les deux onglets.
 */
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

/** Bulle du coach en revue de partie — mêmes jetons que les autres bulles (`components/ui/coach.ts`). */
export function CoachBubble({ message }: { message: CoachMessage }) {
  return (
    <div className={`${COACH_BUBBLE_CLASS} ${COACH_TONE_CLASS[TAG_TONE[message.tag]]}`}>
      <GraduationCap aria-hidden="true" className={COACH_ICON_CLASS} />
      <p className="text-foreground">{message.text}</p>
    </div>
  );
}
