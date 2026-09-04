/**
 * Bulle de dialogue 🎓 du Coach Virtuel, en Revue de partie
 * (`game-review-screen.tsx`) — met en forme un `CoachMessage`
 * (`core/analysis/coach-narrative.ts`), déjà en français, déjà complet.
 *
 * Distincte de `client/features/learn/coach-bubble.tsx` (même esprit visuel
 * 🎓, mais props et domaine différents — l'Académie n'a ni `quality` ni
 * `MoveQuality`) : pas de dépendance croisée entre les deux onglets.
 */
import type { CoachMessage, CoachMessageTag } from "@/core/analysis/coach-narrative";

/** Couleur de bordure/fond par nature du message — vert pour ce qui est réussi, ambre/rouge pour ce qui reste à corriger, neutre pour la théorie. */
const TAG_ACCENT_CLASS: Record<CoachMessageTag, string> = {
  deviation: "border-inaccuracy/40 bg-inaccuracy/10",
  brilliant: "border-brilliant/40 bg-brilliant/10",
  critical: "border-critical/40 bg-critical/10",
  missed_mate: "border-blunder/40 bg-blunder/10",
  hanging_piece: "border-blunder/40 bg-blunder/10",
  king_safety: "border-blunder/40 bg-blunder/10",
  missed_tactic: "border-inaccuracy/40 bg-inaccuracy/10",
  open_file: "border-inaccuracy/40 bg-inaccuracy/10",
  blunder: "border-blunder/40 bg-blunder/10",
  inaccuracy: "border-inaccuracy/40 bg-inaccuracy/10",
};

export function CoachBubble({ message }: { message: CoachMessage }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-md border p-3 text-sm ${TAG_ACCENT_CLASS[message.tag]}`}>
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-lg">
        🎓
      </span>
      <p className="text-foreground">{message.text}</p>
    </div>
  );
}
