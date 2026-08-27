"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chessboard, type SquareRenderer } from "react-chessboard";
import { useEngine } from "@/client/engine/engine-context";
import { findKeyMoments, type TimelinePly } from "@/core/analysis/timeline";
import { isReviewable } from "@/core/chess/types";
import { arrowsFromEngineLines, OPPONENT_MOVE_SQUARE_COLOR, qualitySquareColor } from "@/lib/labels";
import type { Game } from "@/server/db/schema";
import type { GameOverview as GameOverviewData } from "@/server/queries/games";
import { EvaluationBar, type EvalScore } from "../board/evaluation-bar";
import { ExplorePanel } from "../board/explore-panel";
import { QualityBadge } from "../board/quality-badge";
import { useExploreMode } from "../board/use-explore-mode";
import { EvalGraph } from "./eval-graph";
import { GameOverview } from "./game-overview";
import { KeyMomentsNav } from "./key-moments-nav";
import { type DrillMistake, MistakesDrillBoard } from "./mistakes-drill-board";
import { MoveList } from "./move-list";
import { RetryBoard } from "./retry-board";

export function GameReviewScreen({
  game,
  timeline,
  accuracy,
  overview,
}: {
  game: Game;
  timeline: TimelinePly[];
  accuracy: number | null;
  overview: GameOverviewData;
}) {
  const { engine } = useEngine();
  const [currentPly, setCurrentPly] = useState(0);
  const [retryPly, setRetryPly] = useState<number | null>(null);
  const [drillActive, setDrillActive] = useState(false);

  const keyMoments = useMemo(() => findKeyMoments(timeline), [timeline]);

  // « Rejouer mes erreurs » : mêmes coups que les decks de révision
  // (`isReviewable` — gaffe ou imprécision), restreints à ceux du joueur
  // (rejouer une erreur adverse n'aurait pas de sens : ce n'est pas à lui de
  // trouver le coup) et à ceux dont l'analyse a bien produit un meilleur coup.
  const mistakes = useMemo<DrillMistake[]>(
    () =>
      timeline
        .filter(
          (entry): entry is TimelinePly & { analysis: NonNullable<TimelinePly["analysis"]> } =>
            entry.analysis !== null &&
            entry.analysis.byPlayer &&
            isReviewable(entry.analysis.quality) &&
            entry.analysis.bestUci !== null &&
            entry.analysis.bestSan !== null,
        )
        .map((entry) => ({
          ply: entry.ply,
          fenBefore: entry.fenBefore,
          bestUci: entry.analysis.bestUci!,
          bestSan: entry.analysis.bestSan!,
        })),
    [timeline],
  );

  // `goToPly` doit pouvoir faire sortir une exploration en cours (navigation
  // classique = abandon de la ligne sandbox), et le mode exploration doit
  // pouvoir déclencher `goToPly` (glisser exactement le coup réel = simple
  // navigation, pas de bascule en exploration) : dépendance circulaire entre
  // les deux hooks, résolue via une ref plutôt qu'en fusionnant leur état.
  const goToPlyRef = useRef<(ply: number) => void>(() => {});

  const fen = currentPly === 0 ? game.initialFen : timeline[currentPly - 1].fenAfter;
  const realNextUci = currentPly < timeline.length ? timeline[currentPly].uci : null;

  const explore = useExploreMode({
    engine,
    anchorFen: fen,
    realNextUci,
    onPlayRealMove: () => goToPlyRef.current(currentPly + 1),
  });

  const goToPly = useCallback(
    (ply: number) => {
      explore.exit();
      setRetryPly(null);
      setDrillActive(false);
      setCurrentPly(Math.max(0, Math.min(timeline.length, ply)));
    },
    [timeline.length, explore],
  );
  // Toujours le dernier `goToPly` en date, sans jamais muter la ref pendant
  // le rendu (interdit) : l'effet s'exécute juste après le commit, largement
  // avant qu'un glisser-déposer utilisateur ne puisse invoquer `onPlayRealMove`.
  useEffect(() => {
    goToPlyRef.current = goToPly;
  }, [goToPly]);

  const startDrill = useCallback(() => {
    explore.exit();
    setRetryPly(null);
    setDrillActive(true);
  }, [explore]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (retryPly !== null || drillActive) return;
      if (event.key === "ArrowLeft") goToPly(currentPly - 1);
      if (event.key === "ArrowRight") goToPly(currentPly + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentPly, retryPly, drillActive, goToPly]);

  const retryEntry = retryPly !== null ? timeline[retryPly - 1] : null;
  const canRetry = retryEntry?.analysis?.bestUci && retryEntry.analysis.bestSan;

  // Coup affiché sur l'échiquier : ses cases de départ/arrivée reprennent la
  // même couleur que le journal, joueur COMME adversaire — les deux camps sont
  // analysés depuis l'import. Le gris neutre ne sert plus qu'aux coups où
  // l'analyse a échoué (voir `analyseImportedGame`, ce cas reste possible mais
  // rare). Une seule source de couleur, voir `qualitySquareColor`.
  //
  // En exploration, le plateau ne montre plus la partie réelle : ces mêmes
  // codes couleur/badge se reportent sur le DERNIER coup exploré (neutre tant
  // que son évaluation n'est pas encore revenue du moteur).
  const currentEntry = currentPly > 0 ? timeline[currentPly - 1] : null;
  const lastExplorerMove = explore.explorerMoves[explore.explorerMoves.length - 1] ?? null;
  const exploreQuality = explore.evaluation.status === "ready" ? explore.evaluation.evaluated.quality : null;

  // Score affiché par la barre d'évaluation verticale — mémoïsé : `EvaluationBar`
  // est un `memo()`, un objet recréé à chaque rendu casserait la comparaison
  // de props et rendrait ce memo() inutile. `null` = rien de fiable à montrer
  // (évaluation en vol côté Exploration, ou coup dont l'analyse a échoué).
  const currentScore: EvalScore | null = useMemo(() => {
    if (explore.isExploring) {
      return explore.evaluation.status === "ready"
        ? { cp: explore.evaluation.evaluated.cpAfter, mate: explore.evaluation.evaluated.mateAfter }
        : null;
    }
    if (currentPly === 0) return { cp: 0, mate: null };
    return currentEntry?.analysis
      ? { cp: currentEntry.analysis.cpAfter, mate: currentEntry.analysis.mateAfter }
      : null;
  }, [explore.isExploring, explore.evaluation, currentPly, currentEntry]);

  // Flèches dégradées (vert/bleu/ambre) matérialisant les lignes du moteur —
  // uniquement en Mode Exploration, seul moment où une analyse MultiPV étendue
  // vient d'être faite (voir `use-explore-mode.ts`). La navigation normale du
  // timeline lit des données déjà importées (un seul `bestUci`, pas de lignes
  // candidates) : pas de flèches hors exploration, pour ne jamais relancer le
  // moteur au simple fil des touches ← →.
  const arrows = useMemo(
    () => (explore.evaluation.status === "ready" ? arrowsFromEngineLines(explore.evaluation.evaluated.bestLines) : []),
    [explore.evaluation],
  );

  const boardHighlightColor = explore.isExploring
    ? lastExplorerMove
      ? (exploreQuality ? qualitySquareColor(exploreQuality) : OPPONENT_MOVE_SQUARE_COLOR)
      : null
    : currentEntry
      ? currentEntry.analysis
        ? qualitySquareColor(currentEntry.analysis.quality)
        : OPPONENT_MOVE_SQUARE_COLOR
      : null;
  const highlightFrom = explore.isExploring ? lastExplorerMove?.from : currentEntry?.uci.slice(0, 2);
  const highlightTo = explore.isExploring ? lastExplorerMove?.to : currentEntry?.uci.slice(2, 4);
  const boardSquareStyles: Record<string, { backgroundColor: string }> =
    boardHighlightColor && highlightFrom && highlightTo
      ? { [highlightFrom]: { backgroundColor: boardHighlightColor }, [highlightTo]: { backgroundColor: boardHighlightColor } }
      : {};
  // La pastille de qualité, elle, ne se pose que sur la case d'arrivée du coup
  // du joueur — l'adversaire n'a pas de qualité à afficher.
  const badgeSquare = explore.isExploring ? (lastExplorerMove?.to ?? null) : currentEntry?.analysis ? currentEntry.uci.slice(2, 4) : null;
  const badgeQuality = explore.isExploring ? exploreQuality : (currentEntry?.analysis?.quality ?? null);

  const squareRenderer: SquareRenderer = ({ square, children }) => (
    <div style={{ width: "100%", height: "100%", ...(boardSquareStyles[square] ?? {}) }}>
      {children}
      {badgeQuality && square === badgeSquare && (
        <span className="pointer-events-none absolute right-0.5 top-0.5">
          <QualityBadge quality={badgeQuality} />
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            {game.playerColor === "w" ? "Blancs" : "Noirs"} contre{" "}
            {game.opponentName ?? "adversaire inconnu"}
          </h1>
          <p className="text-sm text-foreground-muted">
            {game.playedAt.toLocaleDateString("fr-FR")}
            {accuracy !== null ? ` — précision approximative ${accuracy}%` : ""}
          </p>
        </div>
        <Link href="/analyse" className="shrink-0 text-sm text-accent">
          ← Analyse
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {drillActive ? (
            <MistakesDrillBoard
              key={mistakes.length}
              mistakes={mistakes}
              playerColor={game.playerColor}
              onExit={() => setDrillActive(false)}
            />
          ) : retryEntry && canRetry ? (
            <RetryBoard
              key={retryPly}
              fenBefore={retryEntry.fenBefore}
              playerColor={game.playerColor}
              bestUci={retryEntry.analysis!.bestUci!}
              bestSan={retryEntry.analysis!.bestSan!}
              onExit={() => setRetryPly(null)}
            />
          ) : (
            <div className="rounded-lg border border-border bg-surface p-5">
              {explore.isExploring && (
                <div className="mb-4">
                  <ExplorePanel
                    explorerMoves={explore.explorerMoves}
                    evaluation={explore.evaluation}
                    onExit={() => explore.exit()}
                  />
                </div>
              )}
              <div className="mx-auto flex max-w-[480px] items-stretch gap-2">
                <EvaluationBar score={currentScore} />
                <div className="min-w-0 flex-1">
                  <Chessboard
                    options={{
                      id: "review-board",
                      position: explore.fen,
                      boardOrientation: game.playerColor === "w" ? "white" : "black",
                      onPieceDrop: explore.onPieceDrop,
                      canDragPiece: explore.canDragPiece,
                      squareRenderer,
                      arrows,
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goToPly(currentPly - 1)}
                  disabled={currentPly === 0}
                  className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-30"
                >
                  ← Précédent
                </button>
                <span className="font-mono text-sm text-foreground-muted">
                  {currentPly} / {timeline.length}
                </span>
                <button
                  type="button"
                  onClick={() => goToPly(currentPly + 1)}
                  disabled={currentPly === timeline.length}
                  className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-30"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          <EvalGraph
            timeline={timeline}
            keyMoments={keyMoments}
            currentPly={currentPly}
            onSelectPly={goToPly}
          />

          <KeyMomentsNav moments={keyMoments} onSelect={goToPly} />

          {!drillActive && mistakes.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-4 text-center">
              <p className="mb-2 text-sm text-foreground-muted">
                {mistakes.length} erreur{mistakes.length > 1 ? "s" : ""} à corriger dans cette partie.
              </p>
              <button
                type="button"
                onClick={startDrill}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Rejouer mes erreurs
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
              Fil de notation
            </h2>
            <div className="mt-3">
              <MoveList
                timeline={timeline}
                currentPly={currentPly}
                onSelectPly={goToPly}
                onRetry={(ply) => setRetryPly(ply)}
              />
            </div>
          </div>

          <GameOverview overview={overview} />
        </div>
      </div>
    </div>
  );
}
