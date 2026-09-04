"use client";

/**
 * Mini-échiquier interactif d'introduction, style tutoriel Lichess — cahier
 * des charges du 2026-09-03 : avant de lancer les exercices, MONTRER l'idée
 * tactique du thème plutôt que la décrire uniquement en texte. Rejoue le
 * premier coup du VRAI premier puzzle du thème (voir `buildMotifIntro`,
 * jamais une position inventée) et fait défiler ses étapes automatiquement :
 * flèche ROUGE (la menace que le coup crée) puis flèche VERTE (le coup
 * lui-même), en boucle.
 *
 * L'échiquier reste figé sur la position AVANT le coup pendant tout le
 * cycle — seules les flèches changent — pour que le joueur puisse comparer
 * "avant" à ce que chaque flèche désigne, exactement comme un diagramme
 * annoté plutôt qu'une rejoue de coup.
 */
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { MotifIntro } from "@/core/curriculum/motif-intro";

/** Rythme du défilement automatique — assez lent pour être lu, jamais un flash (même ordre de grandeur que `LEAD_IN_STEP_MS` en Mode Entraînement). */
const STEP_DURATION_MS = 2200;

const THREAT_ARROW_COLOR = "var(--quality-blunder)";
const SOLUTION_ARROW_COLOR = "var(--quality-best)";

function neverDraggable(): boolean {
  return false;
}

export function MotifIntroBoard({ intro }: { intro: MotifIntro }) {
  const [stepIndex, setStepIndex] = useState(0);
  const stepCount = intro.steps.length;

  // `intro` ne change jamais deux fois pour UNE instance de ce composant :
  // l'appelant (`ThemeLesson`, monté avec `key={theme.id}` par `LearnScreen`)
  // remonte tout à neuf à chaque changement de thème plutôt que de réutiliser
  // cette instance — `stepIndex` initialisé à `0` suffit donc, jamais besoin
  // de le remettre à `0` depuis un effet.
  useEffect(() => {
    if (stepCount <= 1) return; // rien à faire défiler — une seule étape, jamais de timer inutile.
    const timer = setInterval(() => {
      setStepIndex((index) => (index + 1) % stepCount);
    }, STEP_DURATION_MS);
    return () => clearInterval(timer);
  }, [stepCount]);

  const step = intro.steps[stepIndex] ?? intro.steps[0];
  const arrows = step.arrows.map((arrow) => ({
    startSquare: arrow.from,
    endSquare: arrow.to,
    color: arrow.kind === "threat" ? THREAT_ARROW_COLOR : SOLUTION_ARROW_COLOR,
  }));

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <Chessboard
        options={{ id: "motif-intro-board", position: intro.fen, canDragPiece: neverDraggable, arrows }}
      />
      {/* `key` force un redémarrage de la transition d'apparition à chaque étape, y compris deux étapes de suite au même texte (cas à 1 étape, jamais revisité ici puisque le timer est coupé). Réutilise `animate-fade-up-in` (voir globals.css) plutôt qu'une animation dédiée. */}
      <p
        key={stepIndex}
        className="mt-2 min-h-10 rounded-md border border-border bg-surface-muted/40 p-2 text-center text-xs text-foreground animate-fade-up-in"
      >
        {step.caption}
      </p>
      {stepCount > 1 && (
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
          {intro.steps.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === stepIndex ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
