"use client";

/** Écran de bilan affiché dès que la partie se termine — Mat, Pat, ou Abandon (voir `use-play-game.ts#finalize`). */
import { CircleX, Handshake, Trophy } from "lucide-react";
import type { BotProfile } from "@/core/chess/bot-profiles";
import { BOT_DISPLAY } from "./bot-display";
import type { GameOutcome } from "@/core/chess/termination";
import { accuracyTextClass, describeGameResult, TERMINATION_LABEL } from "@/lib/labels";

/** Même avatar que le sélecteur de profil (`setup-panel.tsx`) — un seul repère visuel par bot dans tout l'onglet. */

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

  const display = BOT_DISPLAY[botProfile.id];
  const Icon = outcome ? (isDraw ? Handshake : playerWon ? Trophy : CircleX) : display.icon;
  const title = outcome ? (isDraw ? "Partie nulle" : playerWon ? "Victoire" : "Défaite") : "Partie terminée";
  const opponent = `${display.name} (${display.level})`;

  return (
    <section aria-labelledby="bilan-partie" className="border-b border-border pb-5">
      <div className="flex items-center gap-3">
        <Icon aria-hidden="true" className={`size-7 shrink-0 ${outcome && !isDraw ? (playerWon ? "text-success" : "text-danger") : "text-foreground-muted"}`} />
        <div>
          <h2 id="bilan-partie" className="font-display text-xl font-semibold">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-foreground-muted">
            {outcome
              ? `${describeGameResult(outcome.result)} · ${TERMINATION_LABEL[outcome.termination]}, face à ${opponent}`
              : `Face à ${opponent}`}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-foreground-muted">Précision</dt>
          <dd className={`font-mono text-2xl font-medium ${accuracyTextClass(accuracy)}`}>{accuracy !== null ? `${accuracy}%` : "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-foreground-muted">Performance démontrée</dt>
          <dd className="font-mono text-2xl font-medium">{performanceElo} Elo</dd>
        </div>
      </dl>
    </section>
  );
}
