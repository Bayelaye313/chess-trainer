"use client";

import { ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX, Wrench } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { Disclosure } from "@/components/ui/disclosure";
import { displayOpponentName } from "@/client/features/play/bot-display";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chessboard, type SquareRenderer } from "react-chessboard";
import { ESPORT_BOARD_OPTIONS, lastMoveSquareStyles, qualityRingColor } from "@/client/features/board/board-theme";
import { useEngine } from "@/client/engine/engine-context";
import { buildCoachMessage, buildGameCoachFindings } from "@/core/analysis/coach-narrative";
import { buildLiveCommentaryFeed } from "@/core/analysis/live-commentary";
import { findKeyMoments, type TimelinePly } from "@/core/analysis/timeline";
import { isReviewable } from "@/core/chess/types";
import { arrowsFromEngineLines, playedVsBestArrows } from "@/lib/labels";
import type { Game } from "@/server/db/schema";
import type { GameOverview as GameOverviewData } from "@/server/queries/games";
import { EvaluationBar, type EvalScore } from "../board/evaluation-bar";
import { ExplorePanel } from "../board/explore-panel";
import { QualityBadge } from "../board/quality-badge";
import { useExploreMode } from "../board/use-explore-mode";
import { CoachBubble } from "./coach-bubble";
import { CoachReportPanel } from "./coach-report";
import { EvalGraph } from "./eval-graph";
import { GameOverview } from "./game-overview";
import { KeyMomentsNav } from "./key-moments-nav";
import { LiveBroadcastPanel } from "./live-broadcast-panel";
import { type DrillMistake, MistakesDrillBoard } from "./mistakes-drill-board";
import { classifyMoveFx, type MoveFxKind } from "@/core/analysis/move-fx";
import { MoveFxOverlay } from "./move-fx-overlay";
import { MoveList } from "./move-list";
import { PostGameReport } from "./post-game-report";
import { RetryBoard } from "./retry-board";
import { useMoveFx } from "./use-move-fx";
import { logTrainingEvent } from "@/server/actions/training";

/**
 * Coup théorique manqué dans CETTE partie, résolu côté serveur depuis le
 * catalogue d'ouvertures (voir `app/analyse/[id]/page.tsx#resolveDeviation`) —
 * soit un lien explicite depuis le journal « Erreurs d'ouverture »
 * (`OpeningMistakesHub`, `?openingId=&ply=`), soit détecté automatiquement à
 * l'ouverture de N'IMPORTE QUELLE partie (`getGameOpeningDeviation`,
 * `server/queries/opening-mistakes.ts`) quand ces paramètres sont absents.
 * Alimente la bulle du Coach (`buildCoachMessage`, `coach-narrative.ts`) au
 * coup exact de la déviation, avec un exercice de correction dédié (voir le
 * rendu de `repertoireCorrection` ci-dessous).
 */
export interface GameDeviation {
  ply: number;
  expectedSan: string;
  expectedUci: string;
  openingName: string;
}

export function GameReviewScreen({
  game,
  timeline,
  accuracy,
  overview,
  deviation = null,
  initialPly = null,
  previousGameId = null,
  nextGameId = null,
  navigationQuery = "",
}: {
  game: Game;
  timeline: TimelinePly[];
  accuracy: number | null;
  overview: GameOverviewData;
  deviation?: GameDeviation | null;
  initialPly?: number | null;
  /** Partie analysée plus récente/plus ancienne que celle-ci — voir `getAdjacentGameIds`, `server/queries/games.ts`. */
  previousGameId?: string | null;
  nextGameId?: string | null;
  /** Suffixe (`?course=…`) recopié sur ◀ ▶ : la navigation reste dans la liste d'où vient la partie (Rapport › ouverture). */
  navigationQuery?: string;
}) {
  const { engine } = useEngine();
  // Un seul retour : vers la liste d'où vient la partie (Rapport › ouverture si `?course=`, sinon Mes parties).
  const courseMatch = /[?&]course=([^&]+)/.exec(navigationQuery);
  const backHref = courseMatch ? `/rapport/ouvertures/${decodeURIComponent(courseMatch[1])}` : "/parties";
  const backLabel = courseMatch ? "Mes parties dans le cours" : "Mes parties";
  const [currentPly, setCurrentPly] = useState(initialPly ?? 0);
  const [retryPly, setRetryPly] = useState<number | null>(null);
  const [drillActive, setDrillActive] = useState(false);
  // `true` pendant l'exercice « Corriger ce coup » lancé depuis le bandeau de
  // déviation — indépendant de `retryPly` (qui rejoue une erreur MOTEUR, voir
  // `mistakes` ci-dessous) : ici le coup à retrouver est le coup THÉORIQUE
  // attendu, pas forcément le meilleur coup au sens Stockfish.
  const [repertoireCorrection, setRepertoireCorrection] = useState(false);

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
      setRepertoireCorrection(false);
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

  // Atterrit directement au coup de la déviation quand on arrive depuis le
  // journal « Erreurs d'ouverture » (`?openingId=&ply=`) — une seule fois au
  // montage, jamais si le joueur navigue ensuite ailleurs dans la partie.
  // Passe par `goToPlyRef` (déjà à jour, voir l'effet précédent) plutôt que
  // par `goToPly` directement : évite d'en faire une dépendance qui
  // redéclencherait ce saut à chaque re-rendu (même rationale que le
  // docstring de `goToPlyRef` plus haut).
  useEffect(() => {
    if (deviation) goToPlyRef.current(deviation.ply);
  }, [deviation]);

  const startDrill = useCallback(() => {
    explore.exit();
    setRetryPly(null);
    setRepertoireCorrection(false);
    setDrillActive(true);
  }, [explore]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (retryPly !== null || drillActive || repertoireCorrection) return;
      if (event.key === "ArrowLeft") goToPly(currentPly - 1);
      if (event.key === "ArrowRight") goToPly(currentPly + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentPly, retryPly, drillActive, repertoireCorrection, goToPly]);

  const retryEntry = retryPly !== null ? timeline[retryPly - 1] : null;
  const canRetry = retryEntry?.analysis?.bestUci && retryEntry.analysis.bestSan;

  // Coup affiché sur l'échiquier : voile cyan sur ses cases de départ/arrivée,
  // et un cercle de la couleur du journal sur la case d'arrivée, joueur COMME
  // adversaire — les deux camps sont analysés depuis l'import. Sans analyse
  // (échec de `analyseImportedGame`, rare), voile seul. Voir
  // `lastMoveSquareStyles` (`board-theme.tsx`).
  //
  // En exploration, le plateau ne montre plus la partie réelle : ces mêmes
  // codes couleur/badge se reportent sur le DERNIER coup exploré (neutre tant
  // que son évaluation n'est pas encore revenue du moteur).
  const currentEntry = currentPly > 0 ? timeline[currentPly - 1] : null;

  // Type de coup pour le son/l'overlay (§11b) — dérivé de `currentEntry`, pas
  // un state : `null` dans tout mode annexe (Exploration/Drill/Retry/
  // Correction), où rejouer un son n'aurait pas de sens.
  const fxKind: MoveFxKind | null = useMemo(() => {
    if (explore.isExploring || drillActive || retryPly !== null || repertoireCorrection) return null;
    return currentEntry ? classifyMoveFx(currentEntry) : null;
  }, [explore.isExploring, drillActive, retryPly, repertoireCorrection, currentEntry]);

  // Le SON reste un effet de bord impératif (appel Web Audio), déclenché
  // UNIQUEMENT quand `currentPly` change réellement — jamais au montage, ni
  // quand seul un mode annexe bascule sans faire avancer la partie.
  // `lastFxPlyRef` retient le dernier ply déjà traité, initialisé à
  // `currentPly` pour que le tout premier passage de l'effet ne joue rien.
  // Aucun `setState` dans cet effet (react-hooks/set-state-in-effect) :
  // `moveFx.playFx` est un appel impératif, pas une mise à jour de rendu —
  // l'overlay, lui, suit `fxKind` directement (dérivé ci-dessus).
  const moveFx = useMoveFx();
  const lastFxPlyRef = useRef(currentPly);
  useEffect(() => {
    if (lastFxPlyRef.current === currentPly) return;
    lastFxPlyRef.current = currentPly;
    if (fxKind) moveFx.playFx(fxKind);
  }, [currentPly, fxKind, moveFx]);

  // Bulle du Coach pour le coup actuellement affiché — `null` hors
  // exploration, coup adverse, ou coup sain (voir `buildCoachMessage`).
  // Le bilan de fin de revue (`coachFindings`), lui, ne dépend pas de
  // `currentPly` : il scanne toute la partie une seule fois.
  const coachMessage = useMemo(
    () => (currentEntry ? buildCoachMessage(currentEntry, deviation) : null),
    [currentEntry, deviation],
  );
  const coachFindings = useMemo(() => buildGameCoachFindings(timeline), [timeline]);
  // Live Broadcast (§12a) : avance avec `currentPly`, jamais toute la partie
  // d'un coup — mêmes deux camps que le journal des coups (`MoveList`), pas
  // que ceux du joueur.
  const liveCommentaryLines = useMemo(
    () => buildLiveCommentaryFeed(timeline, currentPly, deviation),
    [timeline, currentPly, deviation],
  );
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

  // Flèches dégradées (vert/bleu/ambre) matérialisant les lignes du moteur en
  // Mode Exploration (analyse MultiPV étendue, voir `use-explore-mode.ts`).
  // Hors exploration, « double-flux » (§11) : meilleur coup moteur vs coup
  // réellement joué, pour LES DEUX camps — `analysis.bestUci` est déjà connu
  // depuis l'import, aucun appel moteur supplémentaire au fil des touches ← →.
  const arrows = useMemo(() => {
    if (explore.evaluation.status === "ready") return arrowsFromEngineLines(explore.evaluation.evaluated.bestLines);
    return currentEntry ? playedVsBestArrows(currentEntry) : [];
  }, [explore.evaluation, currentEntry]);

  // Cercle de qualité sur la case d'arrivée (coup noté) ; coup adverse : voile seul.
  const boardRingQuality = explore.isExploring ? exploreQuality : (currentEntry?.analysis?.quality ?? null);
  const highlightFrom = explore.isExploring ? lastExplorerMove?.from : currentEntry?.uci.slice(0, 2);
  const highlightTo = explore.isExploring ? lastExplorerMove?.to : currentEntry?.uci.slice(2, 4);
  const boardSquareStyles =
    highlightFrom && highlightTo
      ? lastMoveSquareStyles(highlightFrom, highlightTo, boardRingQuality ? qualityRingColor(boardRingQuality) : null)
      : {};
  // La pastille de qualité, elle, ne se pose que sur la case d'arrivée du coup
  // du joueur — l'adversaire n'a pas de qualité à afficher.
  const badgeSquare = explore.isExploring ? (lastExplorerMove?.to ?? null) : currentEntry?.analysis ? currentEntry.uci.slice(2, 4) : null;
  const badgeQuality = explore.isExploring ? exploreQuality : (currentEntry?.analysis?.quality ?? null);

  // Overlay du son/animation (§11b) : posé sur la case d'arrivée du coup
  // COURANT — `fxKind` est déjà `null` en Exploration/Drill/Retry/Correction
  // (voir sa définition plus haut), donc `fxSquare` l'est aussi dans ces cas.
  const fxSquare = fxKind ? highlightTo : null;

  const squareRenderer: SquareRenderer = ({ square, children }) => (
    <div style={{ width: "100%", height: "100%", ...(boardSquareStyles[square] ?? {}) }}>
      {children}
      {fxKind && fxSquare && square === fxSquare && <MoveFxOverlay key={`fx-${currentPly}`} kind={fxKind} />}
      {badgeQuality && square === badgeSquare && (
        <span className="pointer-events-none absolute right-0.5 top-0.5">
          <QualityBadge quality={badgeQuality} />
        </span>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <BackLink href={backHref}>{backLabel}</BackLink>
          <h1 className="font-display text-[22px] leading-tight font-semibold sm:text-[28px]">
            {game.playerColor === "w" ? "Blancs" : "Noirs"} contre {displayOpponentName(game.opponentName)}
          </h1>
          <p className="text-sm text-foreground-muted">
            {game.playedAt.toLocaleDateString("fr-FR")}
            {accuracy !== null ? ` · précision approximative ${accuracy} %` : ""}
          </p>
        </div>
        <nav aria-label="Parties voisines" className="flex shrink-0 items-center gap-2">
          {previousGameId && (
            <Link href={`/analyse/${previousGameId}${navigationQuery}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border-strong bg-surface-muted px-3 text-sm hover:bg-surface-raised disabled:opacity-40">
              <ChevronLeft aria-hidden="true" className="size-4" />
              Partie précédente
            </Link>
          )}
          {nextGameId && (
            <Link href={`/analyse/${nextGameId}${navigationQuery}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border-strong bg-surface-muted px-3 text-sm hover:bg-surface-raised disabled:opacity-40">
              Partie suivante
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </nav>
      </div>

      {/* Sous le titre : l'action principale reste visible sans défiler sur mobile. */}
      {!drillActive && mistakes.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-sm text-foreground-muted">
            {mistakes.length} erreur{mistakes.length > 1 ? "s" : ""} à corriger dans cette partie.
          </p>
          <button
            type="button"
            onClick={startDrill}
            data-primary-action
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Rejouer mes erreurs
          </button>
        </div>
      )}

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
              onResult={(result) => {
                void logTrainingEvent({
                  kind: "review",
                  entityId: `${game.id}:${retryPly}`,
                  sourceGameId: game.id,
                  score: result.correct ? 1 : 0,
                });
              }}
              onExit={() => setRetryPly(null)}
            />
          ) : repertoireCorrection && deviation ? (
            // Le coup à retrouver est le coup THÉORIQUE attendu (catalogue
            // d'ouvertures), pas forcément le meilleur coup Stockfish — voir
            // le docstring de `repertoireCorrection`. `RetryBoard` reste
            // générique (fenBefore/bestUci/bestSan), aucune adaptation requise.
            <RetryBoard
              key={`deviation-${deviation.ply}`}
              fenBefore={timeline[deviation.ply - 1].fenBefore}
              playerColor={game.playerColor}
              bestUci={deviation.expectedUci}
              bestSan={deviation.expectedSan}
              onResult={(result) => {
                void logTrainingEvent({
                  kind: "review",
                  entityId: `${game.id}:${deviation.ply}`,
                  sourceGameId: game.id,
                  score: result.correct ? 1 : 0,
                });
              }}
              onExit={() => setRepertoireCorrection(false)}
            />
          ) : (
            <div>
              {coachMessage && (
                <div className="mb-4">
                  <CoachBubble message={coachMessage} />
                  {deviation && currentPly === deviation.ply && (
                    <button
                      type="button"
                      onClick={() => setRepertoireCorrection(true)}
                      className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                    >
                      <Wrench aria-hidden="true" className="size-4" />
                      Corriger ce coup
                    </button>
                  )}
                </div>
              )}
              {explore.isExploring && (
                <div className="mb-4">
                  <ExplorePanel
                    explorerMoves={explore.explorerMoves}
                    evaluation={explore.evaluation}
                    onExit={() => explore.exit()}
                  />
                </div>
              )}
              <div className="mx-auto flex max-w-[600px] items-stretch gap-2">
                <EvaluationBar score={currentScore} />
                <div className="min-w-0 flex-1">
                  <Chessboard
                    options={{ ...ESPORT_BOARD_OPTIONS,
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
                  aria-label="Coup précédent"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border-strong bg-surface-muted px-3 text-sm hover:bg-surface-raised disabled:opacity-40"
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <span className="font-mono text-sm text-foreground-muted">
                  {currentPly} / {timeline.length}
                </span>
                <button
                  type="button"
                  onClick={() => goToPly(currentPly + 1)}
                  disabled={currentPly === timeline.length}
                  aria-label="Coup suivant"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border-strong bg-surface-muted px-3 text-sm hover:bg-surface-raised disabled:opacity-40"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={moveFx.toggleMuted}
                  aria-label={moveFx.muted ? "Activer le son des coups" : "Couper le son des coups"}
                  title={moveFx.muted ? "Activer le son des coups" : "Couper le son des coups"}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border-strong bg-surface-muted px-3 text-sm hover:bg-surface-raised disabled:opacity-40"
                >
                  {moveFx.muted ? <VolumeX aria-hidden="true" className="size-5" /> : <Volume2 aria-hidden="true" className="size-5" />}
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

          <CoachReportPanel findings={coachFindings} />

          <Disclosure summary="Bilan du commentateur" className="border-b">
            <PostGameReport overview={overview} keyMoments={keyMoments} />
          </Disclosure>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
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

          <LiveBroadcastPanel lines={liveCommentaryLines} />

          <GameOverview overview={overview} />
        </div>
      </div>
    </div>
  );
}
