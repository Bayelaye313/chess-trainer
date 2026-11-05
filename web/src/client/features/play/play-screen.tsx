"use client";

import type { ReactNode } from "react";
import { Chessboard } from "react-chessboard";
import { ListOrdered, Route } from "lucide-react";
import { pickBotStartLine, type BotStartLine } from "@/core/training/daily-plan";
import { ESPORT_BOARD_OPTIONS } from "@/client/features/board/board-theme";
import { BoardPanel } from "./board-panel";
import { PlayCoachBubble } from "./coach-bubble";
import { GameResultPanel } from "./game-result-panel";
import { MoveFeed } from "./move-feed";
import { SetupPanel } from "./setup-panel";
import { usePlayGame } from "./use-play-game";

/**
 * Lancement et partie en cours contre le bot (`/jouer`). La logique de jeu
 * reste dans `usePlayGame` ; seul l'agencement change : l'échiquier à
 * gauche (en premier sur mobile pendant la partie), le réglage ou le fil
 * de la partie à droite.
 *
 * `startLines` : lignes imposées par le Plan du jour appliqué (voir
 * `server/queries/daily-plan.ts#listBotStartLines`), tirées au lancement
 * selon la couleur. `autoStart` : lancement immédiat avec le dernier réglage.
 * `planPanel` : formulaire du Plan du jour, affiché avec le réglage (hors partie).
 */
export function PlayScreen({
  startLines = [],
  autoStart = false,
  planPanel,
}: {
  startLines?: readonly BotStartLine[];
  autoStart?: boolean;
  planPanel?: ReactNode;
}) {
  const game = usePlayGame();
  const hasGame = game.status !== "setup";
  // Reste affiché après la fin d'une partie : relancer ne demande qu'un clic.
  const showSetup = game.status === "setup" || game.status === "over";
  // Les demi-coups imposés par le Plan du jour (`bookPlies`) ne s'annulent jamais.
  const canTakeback = game.status === "playing" && game.feed.length >= game.bookPlies + 2;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_minmax(300px,1fr)] lg:items-start">
      <div className={hasGame ? "" : "order-last lg:order-none"}>
        {hasGame ? (
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
        ) : (
          // Échiquier au repos : la position de départ, sans interaction.
          <div className="mx-auto hidden w-full max-w-[560px] opacity-80 sm:block" aria-hidden="true" inert>
            <Chessboard options={{ ...ESPORT_BOARD_OPTIONS, id: "play-board-idle", allowDragging: false }} />
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Ici, pas dans BoardPanel : une erreur au lancement remet le statut à "setup". */}
        {game.error && (
          <p role="alert" className="rounded-md border border-blunder/40 bg-blunder/10 px-4 py-2 text-sm text-danger">
            {game.error}
          </p>
        )}

        {hasGame && game.startLine && (
          <p className="flex gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm">
            <Route aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-book" />
            <span>
              Plan du jour · {game.startLine.kind === "trap" ? "piège" : "ouverture"} imposé(e) :{" "}
              <span className="font-medium">{game.startLine.label}</span>
              {game.startLine.kind === "trap" && " — le bot tend le piège, à toi de l'éviter."}
            </span>
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

        {game.coachMessage && <PlayCoachBubble message={game.coachMessage} />}

        {showSetup && (
          <SetupPanel
            engineReady={game.engineReady}
            loading={game.status === "loading"}
            startLines={startLines}
            autoStart={autoStart}
            onStart={(color, profileId) => game.startNewGame(color, profileId, pickBotStartLine(startLines, color))}
          />
        )}

        {showSetup && planPanel}

        {hasGame && game.feed.length === 0 && game.status !== "over" && (
          <p className="text-sm text-foreground-muted">Le coach commente chacun de tes coups ici, et le fil de la partie s&apos;affiche dessous.</p>
        )}

        {hasGame && game.feed.length > 0 && (
          <section aria-labelledby="coups-joues">
            <h2 id="coups-joues" className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground-muted">
              <ListOrdered aria-hidden="true" className="size-4" />
              Coups
            </h2>
            <MoveFeed feed={game.feed} />
          </section>
        )}
      </div>
    </div>
  );
}
