"use client";

import { BoardPanel } from "./board-panel";
import { MoveFeed } from "./move-feed";
import { SetupPanel } from "./setup-panel";
import { usePlayGame } from "./use-play-game";

export function PlayScreen() {
  const game = usePlayGame();
  const hasGame = game.status !== "setup";
  // Reste affiché après la fin d'une partie : lancer la suivante ne demande
  // qu'un nouveau clic, sans revenir en arrière dans l'interface.
  const showSetup = game.status === "setup" || game.status === "over";

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

        {showSetup && (
          <SetupPanel
            engineReady={game.engineReady}
            loading={game.status === "loading"}
            onStart={game.startNewGame}
          />
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
          />
        )}
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
