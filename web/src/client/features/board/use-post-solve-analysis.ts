"use client";

/**
 * Mode Analyse Pro : une fois le puzzle `solved`, ou `failed` ET révélé,
 * l'échiquier ne se fige plus derrière le panneau de fin — cette navigation
 * ◀ Précédent / Suivant ▶ à travers `puzzle.solution`, plus l'exploration
 * libre (drag-and-drop + jauge) depuis n'importe quel pli, prend le relais.
 *
 * Compose exactement le même duo que `game-review-screen.tsx` (`goToPly` +
 * `useExploreMode`, réutilisé tel quel, zéro modification) — seule la source
 * des positions change : ici `replayPlies(puzzle.solution)`, là le
 * `timeline` d'une partie importée. `solve-state.ts` reste étranger à ce
 * fichier : cette navigation est volontairement HORS de la machine d'état
 * pure de résolution, comme `useExploreMode` l'est déjà du `currentPly` de
 * `GameReviewScreen` — même séparation de responsabilités, appliquée ici.
 *
 * Contrairement à une partie importée, aucune évaluation n'est précalculée
 * pli par pli pour une solution de puzzle : ce hook relance donc lui-même une
 * analyse légère à chaque pli affiché (hors exploration, où l'évaluation de
 * `useExploreMode` prend le relais) — même profondeur que la jauge de
 * `use-puzzle-solver.ts`.
 *
 * Inerte tant que `active` est `false` : jamais pendant `solving` /
 * `opponent-reply` / `failed` non révélé, sous peine de spoiler la solution
 * en cours.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { replayPlies, type ReplayedPly } from "@/core/chess/replay";
import type { PositionAnalyser } from "@/core/analysis/types";
import type { SolvablePuzzle } from "@/core/puzzle/solve-state";
import { arrowsFromEngineLines } from "@/lib/labels";
import type { EvalScore } from "./evaluation-bar";
import { useExploreMode } from "./use-explore-mode";

/** Même ordre de grandeur que la jauge live de `use-puzzle-solver.ts`. */
const PLY_ANALYSIS_DEPTH = 16;

export function usePostSolveAnalysis({
  engine,
  puzzle,
  active,
}: {
  engine: PositionAnalyser | null;
  puzzle: SolvablePuzzle;
  /** `true` une fois le puzzle terminé et prêt à être rejoué librement — voir le docstring ci-dessus. */
  active: boolean;
}) {
  const plies = useMemo<ReplayedPly[]>(() => replayPlies(puzzle.fenBefore, puzzle.solution), [puzzle]);

  // Pli affiché : la fin de la solution par défaut dès que l'analyse
  // s'active, jamais réinitialisé ensuite tant que ce même puzzle reste actif
  // (naviguer en arrière ne doit pas se refaire remettre à la fin à chaque
  // rendu). `wasActiveRef` détecte la SEULE transition false → true.
  const [viewPly, setViewPly] = useState(plies.length);
  const wasActiveRef = useRef(false);
  useEffect(() => {
    if (active && !wasActiveRef.current) setViewPly(plies.length);
    wasActiveRef.current = active;
  }, [active, plies.length]);

  const anchorFen = viewPly === 0 ? puzzle.fenBefore : plies[viewPly - 1].fenAfter;
  const realNextUci = viewPly < plies.length ? plies[viewPly].uci : null;

  const goToPlyRef = useRef<(ply: number) => void>(() => {});

  const explore = useExploreMode({
    engine,
    anchorFen,
    realNextUci,
    onPlayRealMove: () => goToPlyRef.current(viewPly + 1),
  });

  const goToPly = useCallback(
    (ply: number) => {
      explore.exit();
      setViewPly(Math.max(0, Math.min(plies.length, ply)));
    },
    [plies.length, explore],
  );
  // Même schéma que `game-review-screen.tsx` : `explore` a besoin d'appeler
  // `goToPly` (glisser exactement le coup réel), `goToPly` a besoin de sortir
  // `explore` — dépendance circulaire résolue par une ref plutôt qu'en
  // fusionnant les deux hooks.
  useEffect(() => {
    goToPlyRef.current = goToPly;
  }, [goToPly]);

  useEffect(() => {
    if (!active) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goToPly(viewPly - 1);
      if (event.key === "ArrowRight") goToPly(viewPly + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, viewPly, goToPly]);

  // Jauge live du pli affiché — seulement hors exploration (l'évaluation de
  // `useExploreMode` prend le relais dès qu'une ligne divergente démarre,
  // voir `currentScore` plus bas). Compteur de requête : une réponse tardive
  // ne doit jamais s'appliquer à un pli qu'on a déjà quitté.
  const [plyEval, setPlyEval] = useState<EvalScore | null>(null);
  const evalRequestIdRef = useRef(0);
  useEffect(() => {
    if (!active || explore.isExploring || !engine) return;
    const requestId = ++evalRequestIdRef.current;
    engine
      .analyse(anchorFen, { depth: PLY_ANALYSIS_DEPTH })
      .then((evaluation) => {
        if (evalRequestIdRef.current !== requestId) return;
        setPlyEval({ cp: evaluation.cp, mate: evaluation.mate });
      })
      .catch(() => {
        // Échec silencieux, comme la jauge de `use-puzzle-solver.ts` : la
        // dernière valeur connue reste affichée plutôt qu'un trou.
      });
  }, [active, explore.isExploring, anchorFen, engine]);

  const currentScore: EvalScore | null = explore.isExploring
    ? explore.evaluation.status === "ready"
      ? { cp: explore.evaluation.evaluated.cpAfter, mate: explore.evaluation.evaluated.mateAfter }
      : null
    : plyEval;

  const arrows = useMemo(
    () => (explore.evaluation.status === "ready" ? arrowsFromEngineLines(explore.evaluation.evaluated.bestLines) : []),
    [explore.evaluation],
  );

  return {
    plies,
    viewPly,
    totalPlies: plies.length,
    goToPly,
    canGoPrevious: viewPly > 0,
    canGoNext: viewPly < plies.length,
    explore,
    currentScore,
    arrows,
  };
}

export type PostSolveAnalysis = ReturnType<typeof usePostSolveAnalysis>;
