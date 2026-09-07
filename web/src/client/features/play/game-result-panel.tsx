"use client";

/** Écran de bilan affiché dès que la partie se termine — Mat, Pat, ou Abandon (voir `use-play-game.ts#finalize`). */
import type { BotProfile, BotProfileId } from "@/core/chess/bot-profiles";
import type { GameOutcome } from "@/core/chess/termination";
import { accuracyTextClass, describeGameResult, TERMINATION_LABEL } from "@/lib/labels";

/** Même avatar que le sélecteur de profil (`setup-panel.tsx`) — un seul repère visuel par bot dans tout l'onglet. */
const PROFILE_AVATAR: Record<BotProfileId, string> = {
  poussin: "🐥",
  club: "🛡️",
  champion: "⚔️",
  stockfish: "🦾",
};

export function GameResultPanel({
  outcome,
  botProfile,
  accuracy,
  performanceElo,
  playerColor,
}: {
  outcome: GameOutcome | null;
  botProfile: BotProfile;
  accuracy: number | null;
  performanceElo: number;
  playerColor: "w" | "b";
}) {
  const playerWon = outcome ? (outcome.result === "1-0") === (playerColor === "w") : false;
  const isDraw = outcome?.result === "1/2-1/2";

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-border bg-surface-muted/60 text-xl"
          aria-hidden="true"
        >
          {PROFILE_AVATAR[botProfile.id]}
        </span>
        <div>
          <h2 className="text-lg font-semibold">
            {outcome
              ? isDraw
                ? "Partie nulle"
                : playerWon
                  ? "🏆 Victoire !"
                  : "Défaite"
              : "Partie terminée"}
          </h2>
          <p className="mt-0.5 text-sm text-foreground-muted">
            {outcome
              ? `${describeGameResult(outcome.result)} — ${TERMINATION_LABEL[outcome.termination]}, face à ${botProfile.label}`
              : `Face à ${botProfile.label}`}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-md border border-border p-4">
          <p className="text-xs uppercase tracking-wide text-foreground-muted">Précision</p>
          <p className={`mt-1 text-2xl font-semibold ${accuracyTextClass(accuracy)}`}>
            {accuracy !== null ? `${accuracy}%` : "—"}
          </p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="text-xs uppercase tracking-wide text-foreground-muted">Performance démontrée</p>
          <p className="mt-1 text-2xl font-semibold">⭐ {performanceElo} Elo</p>
        </div>
      </div>
    </section>
  );
}
