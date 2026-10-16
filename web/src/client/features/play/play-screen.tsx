"use client";

import { pickBotStartLine, type BotStartLine } from "@/core/training/daily-plan";
import { BoardPanel } from "./board-panel";
import { PlayCoachBubble } from "./coach-bubble";
import { GameResultPanel } from "./game-result-panel";
import { MoveFeed } from "./move-feed";
import { SetupPanel } from "./setup-panel";
import { usePlayGame } from "./use-play-game";

/**
 * `startLines` : lignes imposées par le Plan du jour appliqué (voir
 * `server/queries/daily-plan.ts#listBotStartLines`) — relues à chaque
 * rafraîchissement de la page, donc à jour dès le clic sur « Appliquer ».
 * Le tirage n'a lieu qu'au lancement, selon la couleur choisie.
 */
export function PlayScreen({ startLines = [] }: { startLines?: readonly BotStartLine[] }) {
  const game = usePlayGame();
  const hasGame = game.status !== "setup";
  // Reste affiché après la fin d'une partie : lancer la suivante ne demande
  // qu'un nouveau clic, sans revenir en arrière dans l'interface.
  const showSetup = game.status === "setup" || game.status === "over";
  // N'a de sens qu'une fois qu'un tour complet a eu lieu et que la main
  // revient au joueur — voir `use-play-game.ts#handleTakeback`.
  // Les demi-coups imposés par le Plan du jour (`bookPlies`) ne s'annulent jamais.
  const canTakeback = game.status === "playing" && game.feed.length >= game.bookPlies + 2;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        {/* Rendu ici, pas dans BoardPanel : une erreur au lancement remet le
            statut à "setup", où BoardPanel ne serait plus affiché. */}
        {game.error && (
          <p className="rounded-md border border-blunder/30 bg-blunder/10 px-4 py-2 text-sm text-blunder">
            {game.error}
          </p>
        )}

        {game.status === "over" && (
          <GameResultPanel
            outcome={game.outcome}
            botProfile={game.botProfile}
            accuracy={game.accuracy}
            performanceElo={game.performanceElo ?? game.botProfile.nominalElo}
            playerColor={game.playerColor}
          />
        )}

        {showSetup && (
          <SetupPanel
            engineReady={game.engineReady}
            loading={game.status === "loading"}
            startLines={startLines}
            onStart={(color, profileId) =>
              game.startNewGame(color, profileId, pickBotStartLine(startLines, color))
            }
          />
        )}

        {hasGame && game.startLine && (
          <p className="rounded-md border border-book/30 bg-book/10 px-4 py-2 text-xs text-foreground">
            Plan du jour · {game.startLine.kind === "trap" ? "piège" : "ouverture"} imposé(e) :{" "}
            <span className="font-medium">{game.startLine.label}</span>
            {game.startLine.kind === "trap" && " — le bot tend le piège, à toi de l'éviter."}
          </p>
        )}

        {hasGame && (
          <BoardPanel
            fen={game.fen}
            status={game.status}
            playerColor={game.playerColor}
            outcome={game.outcome}
            squareStyles={game.squareStyles}
            onPieceDrop={game.onPieceDrop}
            canDragPiece={game.canDragPiece}
            onTakeback={game.handleTakeback}
            onResign={game.handleResign}
            canTakeback={canTakeback}
          />
        )}

        {game.coachMessage && <PlayCoachBubble message={game.coachMessage} />}
      </div>

      {hasGame && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
            Coups
          </h2>
          <div className="mt-3">
            <MoveFeed feed={game.feed} />
          </div>
        </div>
      )}
    </div>
  );
}
