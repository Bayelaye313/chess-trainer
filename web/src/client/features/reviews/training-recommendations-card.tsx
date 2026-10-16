"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { groupRecommendationCards } from "@/core/training/recommendations";
import type { TrainingPreferences } from "@/core/training/preferences";
import type { TrainingRecommendationDto } from "@/server/queries/training";
import type { DailySessionState } from "@/server/queries/daily-plan";
import { formatTrainingHeadline, formatTrainingProof } from "@/lib/labels";
import { RecommendedPuzzleSession } from "./recommended-puzzle-session";
import { TrainingPlanSettings } from "./training-plan-settings";

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
  if (recommendation.entityType === "trap") {
    return `/pieges/${recommendation.entityId}`;
  }
  return "/entrainer";
}

/**
 * Corps de carte partagé par le `<button>` (puzzle) et le `<Link>` (autres) :
 * titre, puis la preuve locale (`formatTrainingProof` — motif, variante,
 * ECO… voyageant dans `reason_code`), puis l'impact. L'impact reste un chiffre
 * local de priorité (fréquence × ampleur, `core/training/priority.ts`), jamais
 * un score moteur — l'info-bulle le dit explicitement (règle CLAUDE.md :
 * jamais un statut sans libellé expliqué).
 */
function RecommendationCardBody({
  recommendation,
  count,
}: {
  recommendation: TrainingRecommendationDto;
  count: number;
}) {
  const proof = formatTrainingProof(recommendation);
  return (
    <>
      <span className="flex items-start justify-between gap-2 text-sm font-medium text-foreground">
        <span>{formatTrainingHeadline(recommendation.reasonCode)}</span>
        {count > 1 && (
          <span className="shrink-0 rounded-full border border-border bg-surface-muted px-1.5 text-[11px] text-foreground-muted">
            ×{count}
          </span>
        )}
      </span>
      {proof !== null && <span className="mt-1 block text-xs text-foreground-muted">{proof}</span>}
      <span
        className="mt-auto block pt-1 text-xs text-foreground-muted"
        title="Priorité locale : échéance, fréquence et ampleur de tes propres erreurs — pas un score moteur."
      >
        Impact {Math.round(recommendation.priority)}
      </span>
    </>
  );
}

export function TrainingRecommendationsCard({
  recommendations,
  preferences,
  sessionState,
}: {
  recommendations: TrainingRecommendationDto[];
  preferences: TrainingPreferences;
  sessionState: DailySessionState | null;
}) {
  const router = useRouter();
  /** `null` : grille d'actions ; sinon l'id du puzzle de la carte cliquée. */
  const [puzzleSession, setPuzzleSession] = useState<string | null>(null);
  const cards = groupRecommendationCards(recommendations);

  if (puzzleSession !== null) {
    return (
      <RecommendedPuzzleSession
        initialPuzzleId={puzzleSession}
        onExit={() => {
          setPuzzleSession(null);
          // Cartes fermées + complétion du Plan du jour : relues côté serveur.
          router.refresh();
        }}
      />
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Séance du jour</h2>
          <p className="mt-1 text-xs text-foreground-muted">
            Chaque carte cite une preuve locale (motif, sortie de théorie, piège du répertoire) — pas un score
            moteur opaque.
          </p>
        </div>
        <span className="text-xs text-foreground-muted">
          {recommendations.length}/{preferences.dailyLimit} actions
        </span>
      </div>
      {recommendations.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-border px-3 py-4 text-sm text-foreground-muted">
          Rien de dû pour ces objectifs. Joue une partie, importe un historique, ou élargis le plan ci-dessous.
        </p>
      ) : (
        // auto-fill : 1 à 4 cartes remplissent toujours la ligne, sans carte
        // orpheline sur une seconde rangée.
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-2">
          {cards.map(({ item: recommendation, count }) =>
            recommendation.entityType === "puzzle" ? (
              <button
                key={recommendation.id}
                type="button"
                onClick={() => setPuzzleSession(recommendation.entityId)}
                className="flex flex-col rounded-md border border-border px-3 py-3 text-left transition-colors hover:bg-surface-muted"
              >
                <RecommendationCardBody recommendation={recommendation} count={count} />
              </button>
            ) : (
              <Link
                key={recommendation.id}
                href={recommendationHref(recommendation)}
                className="flex flex-col rounded-md border border-border px-3 py-3 transition-colors hover:bg-surface-muted"
              >
                <RecommendationCardBody recommendation={recommendation} count={count} />
              </Link>
            ),
          )}
        </div>
      )}
      <TrainingPlanSettings preferences={preferences} sessionState={sessionState} />
    </section>
  );
}
