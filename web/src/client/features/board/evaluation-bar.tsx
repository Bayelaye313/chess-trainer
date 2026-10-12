"use client";

/**
 * Barre d'évaluation verticale, toujours POV Blancs (blanc en haut, noir en
 * bas) — indépendante de l'orientation de l'échiquier, comme le graphe
 * d'évaluation (`eval-graph.tsx`) dont elle reprend la même palette fixe.
 *
 * Isolée dans son propre composant mémoïsé : en mode Exploration, le score
 * change à chaque coup testé (un aller-retour moteur) — sans `memo`, chaque
 * mise à jour redessinerait aussi l'échiquier voisin pour rien, alors que
 * seule cette pastille a réellement changé.
 */
import { memo } from "react";
import { winPercent } from "@/core/analysis/win-percent";
import { formatEvaluation } from "@/lib/labels";

export interface EvalScore {
  /** Centipions, POV Blancs. `null` quand un mat est annoncé. */
  cp: number | null;
  /** Coups avant le mat, POV Blancs : positif = les Blancs matent. */
  mate: number | null;
}

/**
 * `size="lg"` : barre plus large et score plus grand, pour un échiquier
 * lui-même agrandi (lecteur de cours de l'Académie) — à la taille par défaut,
 * un score comme « +0.34 » y serait tronqué.
 */
/**
 * `checkmatedBy` : la position affichée est déjà un mat (score moteur `#0`,
 * sans signe exploitable) — la barre se remplit pour le camp qui a maté et
 * affiche « # ».
 */
export const EvaluationBar = memo(function EvaluationBar({
  score,
  size = "md",
  checkmatedBy = null,
}: {
  score: EvalScore | null;
  size?: "md" | "lg";
  checkmatedBy?: "w" | "b" | null;
}) {
  // `score` null = rien de fiable à montrer (chargement en cours en mode
  // Exploration, ou coup dont l'analyse a échoué) : barre neutre plutôt
  // qu'une valeur inventée. `winPercent` fait déjà tout le lissage — jamais
  // d'échelle linéaire brute de centipions (voir sa propre docstring).
  const whitePercent = checkmatedBy ? (checkmatedBy === "w" ? 100 : 0) : score ? winPercent(score.cp, score.mate) : 50;
  const whiteLeads = whitePercent >= 50;
  const label = checkmatedBy ? "#" : score ? formatEvaluation(score.cp, score.mate) : "—";

  return (
    <div
      className={`relative shrink-0 self-stretch overflow-hidden rounded-sm ${size === "lg" ? "w-7 sm:w-9" : "w-5 sm:w-6"}`}
      style={{ background: "var(--eval-black-fill)" }}
      role="img"
      aria-label={`Évaluation de la position : ${label}`}
    >
      {/* Ancrée en haut : sa hauteur suit l'avantage Blancs, jamais l'inverse. */}
      <div
        className="absolute inset-x-0 top-0 transition-[height] duration-300 ease-in-out"
        style={{ height: `${whitePercent}%`, background: "var(--eval-white-fill)" }}
      />
      {/* Le score se pose dans le territoire du camp qui mène — jamais sur la
          frontière, toujours sur un fond assez large pour rester lisible. */}
      <span
        className={`pointer-events-none absolute inset-x-0 px-0.5 text-center font-mono font-semibold leading-tight ${
          size === "lg" ? "text-[10px] sm:text-[11px]" : "text-[9px] sm:text-[10px]"
        } ${
          whiteLeads ? "top-1" : "bottom-1"
        }`}
        style={{ color: whiteLeads ? "var(--eval-black-fill)" : "var(--eval-white-fill)" }}
      >
        {label}
      </span>
    </div>
  );
});
