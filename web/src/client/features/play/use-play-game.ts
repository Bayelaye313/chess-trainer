"use client";

/**
 * État et logique d'une partie contre un bot (Sparring Humain Local).
 *
 * Le worker Stockfish sert deux usages qu'il ne faut pas confondre : analyser
 * objectivement le coup du joueur (pleine force, `ANALYSIS_DEPTH`) et jouer la
 * réplique du bot (force bridée sur le profil choisi, voir
 * `core/chess/bot-profiles.ts`). `ensureEngineMode` évite de reconfigurer le
 * moteur quand le mode demandé est déjà actif.
 *
 * `gameEpochRef` invalide toute continuation asynchrone (réplique du bot en
 * vol) qui atterrirait APRÈS un abandon ou une nouvelle partie — sans lui, un
 * `engine.play()` déjà lancé au moment du clic sur Abandonner appliquerait
 * quand même son coup sur une partie que l'utilisateur vient de quitter.
 */
import { useCallback, useRef, useState } from "react";
import { Chess, DEFAULT_POSITION, type Move } from "chess.js";
import type { PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import { evaluateMove, uciOf, type EvaluatedMove } from "@/core/analysis/evaluate-move";
import { computeAccuracy, type TimelinePly } from "@/core/analysis/timeline";
import { estimatePerformanceElo } from "@/core/analysis/performance-rating";
import { buildCoachMessage, type CoachMessage } from "@/core/analysis/coach-narrative";
import { gameOutcome, type GameOutcome } from "@/core/chess/termination";
import { getBotProfile, pickMoveLimit, type BotProfile, type BotProfileId } from "@/core/chess/bot-profiles";
import type { Motif, MoveQuality } from "@/core/chess/types";
import { useEngine } from "@/client/engine/engine-context";
import { OPPONENT_MOVE_SQUARE_COLOR, qualitySquareColor } from "@/lib/labels";
import {
  createGame,
  deletePlayerMove,
  finishGame,
  recordPlayerMove,
  saveBotGameResult,
} from "@/server/actions/play";
import { ANALYSIS_DEPTH } from "./constants";

export type PlayStatus = "setup" | "loading" | "playing" | "evaluating" | "thinking" | "over";

export interface FeedEntry {
  by: "player" | "ai";
  san: string;
  quality?: MoveQuality;
  cpLoss?: number | null;
  bestSan?: string | null;
  motifs?: Motif[];
}

interface MoveHighlight {
  from: string;
  to: string;
  color: string;
}

/** Mode de force actuellement configuré sur le moteur partagé. */
type EngineMode = "full" | number;

function engineModeFor(profile: BotProfile): EngineMode {
  return profile.elo === null ? "full" : profile.elo;
}

function playMoveUci(chess: Chess, uci: string): Move {
  return chess.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.slice(4, 5) || undefined,
  });
}

/**
 * Bulle du Coach pour CE coup — reconstitue le `TimelinePly` minimal que
 * `buildCoachMessage` (`core/analysis/coach-narrative.ts`) attend, à partir de
 * l'évaluation déjà calculée (même profondeur, `ANALYSIS_DEPTH`) : aucun appel
 * moteur supplémentaire. Pas de suivi de déviation de répertoire ici (onglet
 * Ouvertures, hors sujet du Sparring Local), d'où `null`.
 */
function buildLiveCoachMessage(chess: Chess, evaluated: EvaluatedMove, side: "w" | "b"): CoachMessage | null {
  const ply = chess.history().length;
  const entry: TimelinePly = {
    ply,
    side,
    san: evaluated.san,
    uci: evaluated.uci,
    fenBefore: evaluated.fenBefore,
    fenAfter: evaluated.fenAfter,
    analysis: {
      ply,
      byPlayer: true,
      quality: evaluated.quality,
      cpLoss: evaluated.cpLoss,
      cpBefore: evaluated.cpBefore,
      mateBefore: evaluated.mateBefore,
      cpAfter: evaluated.cpAfter,
      mateAfter: evaluated.mateAfter,
      bestUci: evaluated.bestUci,
      bestSan: evaluated.bestSan,
      mateMissed: evaluated.mateMissed,
      motifs: evaluated.motifs,
      // Même règle que `evaluatedMoveToRow` (`server/db/mappers.ts`) : le coup
      // joué a-t-il exploité le motif détecté sur le meilleur coup ?
      motifFound: evaluated.tactical && evaluated.uci === evaluated.bestUci,
      phase: evaluated.phase,
    },
  };
  return buildCoachMessage(entry, null);
}

export function usePlayGame() {
  const { engine, status: engineStatus } = useEngine();

  const chessRef = useRef(new Chess());
  const engineModeRef = useRef<EngineMode | null>(null);
  const botProfileRef = useRef<BotProfile>(getBotProfile("club"));
  const gameIdRef = useRef<string | null>(null);
  /** Qualités des coups DU JOUEUR dans la partie en cours — sert à `computeAccuracy` au bilan, sans dépendre de `feed` (état React, sujet aux fermetures obsolètes). */
  const playerQualitiesRef = useRef<MoveQuality[]>([]);
  /** Incrémenté à chaque nouvelle partie/abandon — voir le docstring du module. */
  const gameEpochRef = useRef(0);

  // Constante, pas une lecture de ref : chessRef démarre déjà sur cette position.
  const [fen, setFen] = useState(DEFAULT_POSITION);
  const [status, setStatus] = useState<PlayStatus>("setup");
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [highlight, setHighlight] = useState<MoveHighlight | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Bulle 🎓 du Coach en direct — le dernier coup DU JOUEUR mis en mots, voir `buildLiveCoachMessage`. */
  const [coachMessage, setCoachMessage] = useState<CoachMessage | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [performanceElo, setPerformanceElo] = useState<number | null>(null);
  // Miroir React de `botProfileRef`, pour le rendu uniquement (lire un ref
  // pendant le rendu est interdit — voir la règle `react-hooks/refs`) ; les
  // callbacks internes (`finalize`, `commitPlayerMove`) continuent de lire la
  // ref, jamais soumise aux fermetures obsolètes d'un `useCallback`.
  const [botProfile, setBotProfile] = useState<BotProfile>(() => getBotProfile("club"));

  const appendFeed = useCallback((entry: FeedEntry) => {
    setFeed((prev) => [...prev, entry]);
  }, []);

  const ensureEngineMode = useCallback(
    async (mode: EngineMode) => {
      if (!engine || engineModeRef.current === mode) return;
      await engine.configure(mode === "full" ? {} : { elo: mode });
      engineModeRef.current = mode;
    },
    [engine],
  );

  /**
   * Bilan de fin de partie — Mat/Pat (issue naturelle) ou Abandon
   * (`handleResign`). Calcule précision et performance côté client (déjà
   * toutes les données en main) puis persiste : un échec de sauvegarde ne
   * doit pas priver l'utilisateur de l'écran de bilan qu'il vient de gagner.
   */
  const finalize = useCallback(
    async (chess: Chess, gameId: string, result: GameOutcome, color: "w" | "b") => {
      const acc = computeAccuracy(playerQualitiesRef.current.map((quality) => ({ quality })));
      const profile = botProfileRef.current;
      const perf = estimatePerformanceElo(profile.nominalElo, acc, result.result, color);

      setAccuracy(acc);
      setPerformanceElo(perf);
      setOutcome(result);
      setStatus("over");

      try {
        await finishGame({ gameId, finalFen: chess.fen(), pgn: chess.pgn(), outcome: result });
        await saveBotGameResult({
          gameId,
          botProfile: profile.id,
          botElo: profile.nominalElo,
          accuracy: acc,
          performanceElo: perf,
          outcome: result,
        });
      } catch (cause) {
        // Le bilan reste affiché (déjà calculé ci-dessus) : seule la
        // persistance a échoué, pas la partie elle-même.
        setError(cause instanceof Error ? cause.message : String(cause));
      }
    },
    [],
  );

  const startNewGame = useCallback(
    async (color: "w" | "b", profileId: BotProfileId) => {
      if (!engine) return;
      const epoch = ++gameEpochRef.current;
      const profile = getBotProfile(profileId);
      botProfileRef.current = profile;
      setBotProfile(profile);
      playerQualitiesRef.current = [];

      setError(null);
      setOutcome(null);
      setFeed([]);
      setHighlight(null);
      setCoachMessage(null);
      setAccuracy(null);
      setPerformanceElo(null);
      setPlayerColor(color);

      const chess = chessRef.current;
      chess.reset();
      setFen(chess.fen());
      setStatus("loading");

      try {
        const { gameId } = await createGame({
          playerColor: color,
          engineElo: profile.nominalElo,
          initialFen: chess.fen(),
          opponentName: profile.label,
        });
        if (gameEpochRef.current !== epoch) return;
        gameIdRef.current = gameId;

        await engine.newGame();
        engineModeRef.current = null;

        if (color === "b") {
          setStatus("thinking");
          await ensureEngineMode(engineModeFor(profile));
          const aiUci = await engine.play(chess.fen(), pickMoveLimit(profile));
          if (gameEpochRef.current !== epoch) return;
          if (aiUci) {
            const move = playMoveUci(chess, aiUci);
            setFen(chess.fen());
            appendFeed({ by: "ai", san: move.san });
            setHighlight({ from: move.from, to: move.to, color: OPPONENT_MOVE_SQUARE_COLOR });
          }
        }

        setStatus("playing");
      } catch (cause) {
        if (gameEpochRef.current !== epoch) return;
        // Repasser par "setup" plutôt que de rester bloqué sur "loading"/"thinking" :
        // l'utilisateur peut relancer une partie sans recharger la page.
        setError(cause instanceof Error ? cause.message : String(cause));
        setStatus("setup");
      }
    },
    [engine, appendFeed, ensureEngineMode],
  );

  /**
   * Suite complète après le dépôt d'un coup joueur, déjà joué sur `chessRef` :
   * évaluation, bulle du Coach, persistance, puis réplique du bot si la
   * partie continue.
   */
  const commitPlayerMove = useCallback(
    async (fenBeforeMove: string, move: Move) => {
      const chess = chessRef.current;
      const gameId = gameIdRef.current;
      const epoch = gameEpochRef.current;
      if (!engine || !gameId) return;

      try {
        setStatus("evaluating");
        await ensureEngineMode("full");
        if (gameEpochRef.current !== epoch) return;

        // Le coup adverse (IA) qui a mené à `fenBeforeMove` — l'avant-dernier
        // de l'historique puisque le coup du joueur est déjà joué sur `chess`
        // (voir `onPieceDrop`). Sert à `evaluateMove` pour reconnaître une
        // reprise évidente (`isObviousRecapture`, `evaluate-move.ts`).
        const verboseHistory = chess.history({ verbose: true });
        const previous = verboseHistory.length >= 2 ? verboseHistory[verboseHistory.length - 2] : null;
        const previousMove = previous ? { to: previous.to, wasCapture: Boolean(previous.captured) } : null;

        const evaluated: EvaluatedMove = await evaluateMove(
          engine,
          fenBeforeMove,
          uciOf(move),
          { depth: ANALYSIS_DEPTH },
          previousMove,
        );
        if (gameEpochRef.current !== epoch) return;

        playerQualitiesRef.current.push(evaluated.quality);

        appendFeed({
          by: "player",
          san: evaluated.san,
          quality: evaluated.quality,
          cpLoss: evaluated.cpLoss,
          bestSan: evaluated.bestSan,
          motifs: evaluated.motifs,
        });
        setHighlight({ from: move.from, to: move.to, color: qualitySquareColor(evaluated.quality) });
        setCoachMessage(buildLiveCoachMessage(chess, evaluated, playerColor));

        await recordPlayerMove({
          gameId,
          ply: chess.history().length,
          side: playerColor,
          evaluated,
        });

        const afterPlayer = gameOutcome(chess);
        if (afterPlayer) {
          await finalize(chess, gameId, afterPlayer, playerColor);
          return;
        }

        setStatus("thinking");
        const profile = botProfileRef.current;
        await ensureEngineMode(engineModeFor(profile));
        const aiUci = await engine.play(chess.fen(), pickMoveLimit(profile));
        if (gameEpochRef.current !== epoch) return;
        if (!aiUci) {
          setError("Le moteur n'a proposé aucun coup.");
          setStatus("playing");
          return;
        }

        const aiMove = playMoveUci(chess, aiUci);
        setFen(chess.fen());
        appendFeed({ by: "ai", san: aiMove.san });
        setHighlight({ from: aiMove.from, to: aiMove.to, color: OPPONENT_MOVE_SQUARE_COLOR });

        const afterAi = gameOutcome(chess);
        if (afterAi) {
          await finalize(chess, gameId, afterAi, playerColor);
          return;
        }

        setStatus("playing");
      } catch (cause) {
        if (gameEpochRef.current !== epoch) return;
        setError(cause instanceof Error ? cause.message : String(cause));
        setStatus("playing");
      }
    },
    [engine, playerColor, appendFeed, ensureEngineMode, finalize],
  );

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (status !== "playing" || !targetSquare) return false;

      const chess = chessRef.current;
      const fenBeforeMove = chess.fen();
      let move: Move;
      try {
        move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      } catch {
        return false;
      }

      setFen(chess.fen());
      void commitPlayerMove(fenBeforeMove, move);
      return true;
    },
    [status, commitPlayerMove],
  );

  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs): boolean => {
      if (status !== "playing") return false;
      const pieceColor = piece.pieceType.startsWith("w") ? "w" : "b";
      return pieceColor === playerColor && chessRef.current.turn() === playerColor;
    },
    [status, playerColor],
  );

  /**
   * Retire les deux derniers demi-coups (la réplique du bot puis le coup
   * raté du joueur) et redonne la main — n'a de sens que quand c'est
   * effectivement au joueur de jouer (`status === "playing"`) et qu'un tour
   * complet a bien eu lieu (sinon il n'y a rien à annuler côté joueur).
   */
  const handleTakeback = useCallback(() => {
    const chess = chessRef.current;
    const gameId = gameIdRef.current;
    if (status !== "playing" || !gameId || chess.history().length < 2) return;

    // Le coup du joueur enregistré en base est celui juste avant la réplique
    // du bot qu'on annule aussi — voir `recordPlayerMove` dans `commitPlayerMove`,
    // qui utilise exactement ce même calcul de ply.
    const playerPly = chess.history().length - 1;

    chess.undo();
    chess.undo();

    setFen(chess.fen());
    setHighlight(null);
    setCoachMessage(null);
    setError(null);
    setFeed((prev) => prev.slice(0, -2));
    playerQualitiesRef.current = playerQualitiesRef.current.slice(0, -1);

    void deletePlayerMove({ gameId, ply: playerPly }).catch((cause) => {
      setError(cause instanceof Error ? cause.message : String(cause));
    });
  }, [status]);

  /**
   * Capitule : coupe toute recherche moteur en cours (`engine.stop()`),
   * invalide les continuations en vol (`gameEpochRef`) et affiche
   * immédiatement le bilan — jamais `engine.dispose()`, le worker est partagé
   * par toute l'application (`EngineProvider`), pas propre à cette partie.
   */
  const handleResign = useCallback(() => {
    const chess = chessRef.current;
    const gameId = gameIdRef.current;
    if (status === "setup" || status === "loading" || status === "over" || !gameId) return;

    engine?.stop();
    gameEpochRef.current += 1;

    const result = playerColor === "w" ? "0-1" : "1-0";
    void finalize(chess, gameId, { result, termination: "resignation" }, playerColor);
  }, [status, engine, playerColor, finalize]);

  const squareStyles = highlight
    ? {
        [highlight.from]: { backgroundColor: highlight.color },
        [highlight.to]: { backgroundColor: highlight.color },
      }
    : {};

  return {
    engineReady: engineStatus === "ready",
    status,
    fen,
    playerColor,
    feed,
    outcome,
    error,
    coachMessage,
    accuracy,
    performanceElo,
    botProfile,
    squareStyles,
    startNewGame,
    onPieceDrop,
    canDragPiece,
    handleTakeback,
    handleResign,
  };
}
