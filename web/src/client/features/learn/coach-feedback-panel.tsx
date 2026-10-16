"use client";

/**
 * VOLET DE FEEDBACK UNIQUE du lecteur d'arbre — rendu de `CoachFeedback`
 * (`core/curriculum/coach-feedback.ts`, voir son docstring pour le cahier des
 * charges). Trois sources, un seul bloc, dans un ordre de lecture fixe :
 * l'annotation de l'auteur, le conseil de GM, puis la légende de la flèche
 * moteur affichée sur l'échiquier. En mode « Jouer les coups », la consigne
 * du gamebook (`prompt`) ouvre ce même bloc — jamais un second panneau.
 * Hauteur minimale fixe : passer d'un nœud commenté à un nœud muet ne fait
 * pas sauter la page. Composant de présentation pur.
 */
import type { ReactNode } from "react";
import type { CoachFeedback } from "@/core/curriculum/coach-feedback";
import { formatEvaluation, REVEAL_ARROW_COLOR } from "@/lib/labels";

export function CoachFeedbackPanel({
  feedback,
  chapterTitle,
  prompt,
  hideEngine = false,
}: {
  feedback: CoachFeedback;
  chapterTitle: string;
  /** Consigne du mode jeu, affichée en tête du volet. */
  prompt?: ReactNode;
  /** Masque la ligne moteur (mode jeu : elle donnerait la réponse). */
  hideEngine?: boolean;
}) {
  const heading = feedback.san === null ? chapterTitle : `${feedback.moveNumber}${feedback.san}`;
  const engine = hideEngine ? null : feedback.engine;
  const silent = feedback.comment === null && feedback.tip === null && engine === null;

  return (
    <section aria-live="polite" className="paper-surface min-h-[10rem] rounded-lg border border-border px-6 py-5 text-[15px] shadow-sm">
      {prompt && <div className="mb-3 border-b border-border pb-3">{prompt}</div>}

      <p className="font-mono text-[13px] font-semibold text-foreground-muted">{heading}</p>

      {silent && !prompt && (
        <p className="mt-2 text-foreground-muted">
          {feedback.san === null ? "Position de départ du chapitre — avance avec → ou clique un coup." : "Pas de commentaire sur ce coup."}
        </p>
      )}

      {feedback.comment && <p className="mt-2 leading-7 text-foreground">{feedback.comment}</p>}

      {feedback.tip && (
        <div className="mt-3 flex items-start gap-2.5 rounded-md bg-surface-muted px-4 py-3">
          <span aria-hidden="true" className="shrink-0">
            🎓
          </span>
          <p className="leading-7 text-foreground">
            <span className="font-semibold">Conseil de GM — </span>
            {feedback.tip}
          </p>
        </div>
      )}

      {engine && (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-foreground-muted">
          <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: REVEAL_ARROW_COLOR }} />
          <span>
            Moteur : <span className="font-mono font-semibold text-foreground">{engine.san}</span>{" "}
            <span className="font-mono">({formatEvaluation(engine.cp, engine.mate)})</span>
          </span>
        </p>
      )}
    </section>
  );
}
