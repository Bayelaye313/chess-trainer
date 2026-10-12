"use client";

/**
 * Bulle du Coach Virtuel du lecteur d'arbre — rendu d'un `CoachMessage`
 * (`core/curriculum/coach-feedbacks.ts`, tiré par `pickCoachMessage` sur le
 * créneau de `resolveCoachSlot`). Distincte de `CoachBubble` (brief/debrief
 * des séances de thèmes) : ici le coach réagit au COUP qui vient d'être joué.
 *
 * Mise en page : flexbox (avatar + bulle) et positionnement absolu pour la
 * queue de la bulle — aucune grille tabulaire. Teinte pilotée par `coachTone`
 * (succès de l'endurant, gaffe, fatigue stratégique, mode surprise) via des
 * chaînes de classes STATIQUES (Tailwind ne voit pas les classes construites).
 *
 * Animation (voir `globals.css`) : la bulle émerge du bas, puis le texte se
 * révèle mot par mot (fondu + glissé), en moins d'une seconde quelle que soit
 * la longueur ; un curseur clignote deux fois en fin de phrase. Un clic sur la
 * bulle affiche tout immédiatement — le coach ne doit jamais ralentir
 * l'entraînement. `prefers-reduced-motion` : tout est affiché d'emblée.
 *
 * Fond `bg-surface` : à poser HORS d'un `.paper-surface` (qui redéfinit le
 * texte en sombre sans redéfinir `--surface`).
 */
import { useState } from "react";
import type { CoachMessage } from "@/core/curriculum/coach-feedbacks";

export type CoachTone = "success" | "blunder" | "fatigue" | "surprise";

/** Teinte de la bulle : le profil précise l'issue (`echec` / `succes`). */
export function coachTone(message: Pick<CoachMessage, "profile" | "outcome">): CoachTone {
  if (message.profile === "modeSurprise") return "surprise";
  if (message.outcome === "succes") return "success";
  return message.profile === "essoufflementPositionnel" ? "fatigue" : "blunder";
}

const TONE_CLASSES: Record<CoachTone, { bubble: string; tail: string; avatar: string; label: string; caret: string }> = {
  success: {
    bubble: "border-best/40 ring-1 ring-best/25 shadow-md shadow-best/15",
    tail: "border-best/40",
    avatar: "ring-2 ring-best/60",
    label: "text-best",
    caret: "bg-best",
  },
  blunder: {
    bubble: "border-blunder/45 ring-1 ring-blunder/25 shadow-md shadow-blunder/20",
    tail: "border-blunder/45",
    avatar: "ring-2 ring-blunder/60",
    label: "text-blunder",
    caret: "bg-blunder",
  },
  fatigue: {
    bubble: "border-inaccuracy/40 ring-1 ring-inaccuracy/25 shadow-md shadow-inaccuracy/15",
    tail: "border-inaccuracy/40",
    avatar: "ring-2 ring-inaccuracy/60",
    label: "text-inaccuracy",
    caret: "bg-inaccuracy",
  },
  surprise: {
    bubble: "border-coach-surprise/50 ring-1 ring-brilliant/30 shadow-md shadow-coach-surprise/25",
    tail: "border-coach-surprise/50",
    avatar: "ring-2 ring-coach-surprise/70",
    label: "bg-linear-to-r from-coach-surprise to-brilliant bg-clip-text text-transparent",
    caret: "bg-brilliant",
  },
};

/** Délai avant le premier mot : la bulle a commencé à émerger. */
const WORD_START_MS = 120;
/** Pas maximal entre deux mots, et durée totale plafonnée de la révélation. */
const WORD_STEP_MS = 35;
const REVEAL_BUDGET_MS = 900;

export function CourseCoachBubble({ message }: { message: CoachMessage }) {
  const tone = TONE_CLASSES[coachTone(message)];

  return (
    <div className="flex items-end gap-3 animate-coach-bubble-in motion-reduce:animate-none">
      <span
        aria-hidden="true"
        className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-lg ${tone.avatar}`}
      >
        🎓
      </span>
      {/* `key` : un nouveau message relance la révélation (état « passé » remis à zéro). */}
      <BubbleBody key={message.text} message={message} tone={tone} />
    </div>
  );
}

function BubbleBody({ message, tone }: { message: CoachMessage; tone: (typeof TONE_CLASSES)[CoachTone] }) {
  const [skipped, setSkipped] = useState(false);
  const words = message.text.split(/\s+/).filter(Boolean);
  const step = Math.min(WORD_STEP_MS, REVEAL_BUDGET_MS / Math.max(words.length, 1));
  const lastDelay = WORD_START_MS + step * (words.length - 1);

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => setSkipped(true)}
      className={`relative min-w-0 flex-1 cursor-default rounded-2xl rounded-bl-md border bg-surface px-4 py-3 text-[15px] leading-7 text-foreground ${tone.bubble}`}
    >
      {/* Queue de la bulle, vers l'avatar. */}
      <span
        aria-hidden="true"
        className={`absolute -left-[5px] bottom-3 size-2.5 rotate-45 border-b border-l bg-surface ${tone.tail}`}
      />

      <p className={`mb-1 text-[11px] font-semibold tracking-wider uppercase ${tone.label}`}>{message.label}</p>

      <p className="sr-only">{message.text}</p>
      <p aria-hidden="true">
        {words.map((word, index) => (
          <span key={index}>
            <span
              className={skipped ? "inline-block" : "inline-block animate-coach-word motion-reduce:animate-none"}
              style={skipped ? undefined : { animationDelay: `${Math.round(WORD_START_MS + step * index)}ms` }}
            >
              {word}
            </span>{" "}
          </span>
        ))}
        {!skipped && (
          <span
            className={`ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-[0.18em] rounded-full animate-coach-caret motion-reduce:hidden ${tone.caret}`}
            style={{ animationDelay: `${Math.round(lastDelay)}ms` }}
          />
        )}
      </p>
    </div>
  );
}
