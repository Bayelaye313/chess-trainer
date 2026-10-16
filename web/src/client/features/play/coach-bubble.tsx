/**
 * Bulle de dialogue 🎓 du Coach en direct, sous l'échiquier du Sparring Local
 * (`board-panel.tsx`) — met en forme un `CoachMessage`
 * (`core/analysis/coach-narrative.ts`), déjà en français, déjà complet.
 *
 * Distincte de `client/features/games/coach-bubble.tsx` (même esprit visuel
 * 🎓, même source `CoachMessage`, mais onglets différents) : pas de
 * dépendance croisée entre onglets, voir le docstring de ce fichier-là.
 */
import type { CoachMessage, CoachMessageTag } from "@/core/analysis/coach-narrative";

/** Couleur de bordure/fond par nature du message — même mapping que `games/coach-bubble.tsx`, dupliqué à dessein. */
const TAG_ACCENT_CLASS: Record<CoachMessageTag, string> = {
  deviation: "border-inaccuracy/40 bg-inaccuracy/10",
  brilliant: "border-brilliant/40 bg-brilliant/10",
  critical: "border-critical/40 bg-critical/10",
  missed_mate: "border-blunder/40 bg-blunder/10",
  hanging_piece: "border-blunder/40 bg-blunder/10",
  king_safety: "border-blunder/40 bg-blunder/10",
  missed_tactic: "border-inaccuracy/40 bg-inaccuracy/10",
  weak_square: "border-inaccuracy/40 bg-inaccuracy/10",
  open_file: "border-inaccuracy/40 bg-inaccuracy/10",
  blunder: "border-blunder/40 bg-blunder/10",
  inaccuracy: "border-inaccuracy/40 bg-inaccuracy/10",
};

export function PlayCoachBubble({ message }: { message: CoachMessage }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-md border p-3 text-sm ${TAG_ACCENT_CLASS[message.tag]}`}>
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-lg">
        🎓
      </span>
      <p className="text-foreground">{message.text}</p>
    </div>
  );
}
