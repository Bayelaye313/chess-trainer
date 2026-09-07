"use client";

import { useState } from "react";
import Link from "next/link";
import type { TrainingRecommendationDto } from "@/server/queries/training";
import { RecommendedPuzzleSession } from "./recommended-puzzle-session";

const reasonLabels: Record<string, string> = {
  "puzzle-due": "Puzzle à réviser",
  "opening-due": "Variante d'ouverture à revoir",
  "game-error": "Erreur de partie à analyser",
};

/**
 * `opening-due` encode `${openingId}:${variationKey}` (voir
 * `listTrainingRecommendations`, `server/queries/training.ts`) — un split sur
 * le PREMIER ":" suffit, `variationKey` lui-même n'en contient jamais (format
 * `${eco}|${name}` ou `main_line`, voir `opening-variation-key.ts`). Pointe
 * vers la même route que la file "Lancer les révisions du jour"
 * (`/ouvertures/[slug]?drill=<clé>`, voir `app/ouvertures/[slug]/page.tsx`) —
 * jamais un chemin inventé.
 */
function openingHref(entityId: string): string {
  const separator = entityId.indexOf(":");
  if (separator === -1) return "/ouvertures";
  const openingId = entityId.slice(0, separator);
  const variationKey = entityId.slice(separator + 1);
  return `/ouvertures/${openingId}?drill=${encodeURIComponent(variationKey)}`;
}

function recommendationHref(recommendation: TrainingRecommendationDto): string {
  if (recommendation.entityType === "review") {
    const [gameId, ply] = recommendation.entityId.split(":");
    return `/analyse/${gameId}?reviewPly=${ply}`;
  }
  if (recommendation.entityType === "opening") {
    return openingHref(recommendation.entityId);
  }
  return "/entrainer";
}

export function TrainingRecommendationsCard({ recommendations }: { recommendations: TrainingRecommendationDto[] }) {
  // Séance de puzzle lancée EN PLACE (voir `RecommendedPuzzleSession`) — pas de
  // navigation, jamais de redirection vers l'onglet Entraîner (cahier des
  // charges explicite pour l'action « Puzzle à réviser », priorité 100).
  const [puzzleSessionActive, setPuzzleSessionActive] = useState(false);

  if (recommendations.length === 0) return null;

  if (puzzleSessionActive) {
    return <RecommendedPuzzleSession onExit={() => setPuzzleSessionActive(false)} />;
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Séance recommandée</h2>
          <p className="mt-1 text-xs text-foreground-muted">Priorisée à partir de tes révisions et de tes erreurs locales.</p>
        </div>
        <span className="text-xs text-foreground-muted">{recommendations.length} actions</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {recommendations.map((recommendation) =>
          recommendation.entityType === "puzzle" ? (
            <button
              key={recommendation.id}
              type="button"
              onClick={() => setPuzzleSessionActive(true)}
              className="rounded-md border border-border px-3 py-3 text-left transition-colors hover:bg-surface-muted"
            >
              <span className="block text-sm font-medium text-foreground">
                {reasonLabels[recommendation.reasonCode] ?? "Entraînement recommandé"}
              </span>
              <span className="mt-1 block text-xs text-foreground-muted">
                Priorité {Math.round(recommendation.priority)}
              </span>
            </button>
          ) : (
            <Link
              key={recommendation.id}
              href={recommendationHref(recommendation)}
              className="rounded-md border border-border px-3 py-3 transition-colors hover:bg-surface-muted"
            >
              <span className="block text-sm font-medium text-foreground">
                {reasonLabels[recommendation.reasonCode] ?? "Entraînement recommandé"}
              </span>
              <span className="mt-1 block text-xs text-foreground-muted">
                Priorité {Math.round(recommendation.priority)}
              </span>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
