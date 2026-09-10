"use client";

/**
 * HUD « e-sport » de la phase Puzzles de l'Académie — cahier des charges du
 * 2026-09-10 (« Principal UI/UX Architect », format calqué sur les études
 * Lichess interactives) : une fois le tutoriel d'un thème terminé
 * (`CourseLessonViewer`, voir `theme-lesson.tsx`), `LearnScreen` bascule sur
 * `ThemeSession`, qui rend désormais CE composant plutôt qu'une simple
 * `ProgressBar` + `PuzzleBoard` nus — une barre de complétion SEGMENTÉE (une
 * case lumineuse par puzzle de la vague, pas une barre continue), un fondu
 * enchaîné (`motion/react`, même patron `AnimatePresence mode="wait"` que
 * `games-search-list.tsx`) entre un puzzle résolu et le suivant, et le son de
 * validation `esport-audio-synth.ts` (`kind: "excellent"`) à chaque
 * résolution.
 *
 * Purement présentationnel : le chargement du puzzle suivant, la
 * persistance de la progression (`completedCount`/`totalPuzzles`) restent
 * entièrement dans `ThemeSession` (`getThemePuzzleSession`/
 * `submitThemePuzzleSolved`, `server/queries/curriculum.ts`) — ce composant
 * ne fait qu'AFFICHER cet état et déclencher le retour sonore/visuel d'une
 * résolution, jamais son propre chargement réseau.
 *
 * Pas de `useEffect` ici : le son de résolution et le déclenchement du
 * chargement du puzzle suivant partent tous deux de `handleSolved`, un
 * gestionnaire d'événement pur appelé par `PuzzleBoard.onComplete` — jamais
 * un `setState` synchrone dans un effet (`react-hooks/set-state-in-effect`,
 * cahier des charges explicite du 2026-09-10). Le fondu enchaîné lui-même
 * est entièrement déclaratif (`AnimatePresence` réagit au changement de
 * `key={puzzle.id}`), la palier Bronze/Argent/Or (badge de `theme.level`) se
 * débloque déjà nativement dès que `completedCount` atteint `totalPuzzles`
 * (voir `LearnScreen`/`course-curriculum.tsx`) — aucune nouvelle machine à
 * états n'a été nécessaire pour cette gate.
 *
 * `pm-le-mauvais-fou` est aujourd'hui le seul thème à porter une vraie vague
 * de plusieurs puzzles (8, voir `master-puzzles-dataset.ts`) — ce composant
 * reste néanmoins le rendu par défaut de la phase Puzzles pour TOUS les
 * thèmes : `WaveHud` retombe simplement sur un affichage "N/total" compact
 * pour `totalPuzzles <= 1`, plutôt qu'une case unique qui n'apporterait rien.
 */
import { AnimatePresence, motion } from "motion/react";
import { PuzzleBoard } from "@/client/features/board/puzzle-board";
import { useMoveFx } from "@/client/features/games/use-move-fx";
import type { SolvablePuzzle } from "@/core/puzzle/solve-state";
import { SPRING } from "./theme-config";

/**
 * Au-delà de ce nombre de segments, la rangée de cases devient moins lisible
 * qu'un simple compteur — aucun thème actuel n'en a autant (8 au maximum,
 * `pm-le-mauvais-fou`), c'est un filet pour une future vague plus longue.
 */
const MAX_HUD_SEGMENTS = 20;

/** Barre de complétion segmentée — une case lumineuse par puzzle de la vague, jamais une barre continue (c'est tout l'écart visuel demandé avec l'ancienne `ProgressBar`). */
function WaveHud({ completed, total }: { completed: number; total: number }) {
  if (total <= 1 || total > MAX_HUD_SEGMENTS) {
    return (
      <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-foreground-muted">
        <span aria-hidden="true">🎯</span>
        {completed}/{total}
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${completed} puzzle${completed > 1 ? "s" : ""} résolu${completed > 1 ? "s" : ""} sur ${total}`}
      className="flex items-center justify-center gap-1.5"
    >
      {Array.from({ length: total }, (_, index) => {
        const lit = index < completed;
        return (
          <motion.span
            key={index}
            aria-hidden="true"
            animate={{ scale: lit ? 1 : 0.85, opacity: lit ? 1 : 0.4 }}
            transition={SPRING}
            className={`h-2.5 w-5 rounded-sm ${lit ? "bg-best shadow-[0_0_10px_-2px_var(--quality-best)]" : "bg-surface-muted"}`}
          />
        );
      })}
    </div>
  );
}

export function AcademyPuzzleArena({
  puzzle,
  completedCount,
  totalPuzzles,
  onSolved,
}: {
  puzzle: SolvablePuzzle;
  /** Nombre de puzzles déjà résolus sur ce thème AVANT celui affiché — voir `ThemeSession.session.completedCount`. */
  completedCount: number;
  totalPuzzles: number;
  /** Prévient le parent (`ThemeSession`) une fois `puzzle` résolu — le rechargement du puzzle suivant et la persistance restent de sa responsabilité. */
  onSolved: () => void;
}) {
  const { playFx } = useMoveFx();

  function handleSolved() {
    // Son de validation « adouci » (triangle, F4-A4-C5) — voir le correctif
    // du 2026-09-10 dans `esport-audio-synth.ts`. Best-effort comme partout
    // ailleurs où `playFx` est utilisé : un navigateur qui refuse l'audio ne
    // doit jamais bloquer la suite de la vague.
    playFx("excellent");
    onSolved();
  }

  return (
    <div className="space-y-3">
      <WaveHud completed={completedCount} total={totalPuzzles} />
      <AnimatePresence mode="wait">
        <motion.div
          key={puzzle.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
        >
          <PuzzleBoard puzzle={puzzle} onComplete={handleSolved} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
