"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck, ChessKnight, SlidersHorizontal } from "lucide-react";
import { groupRecommendationCards } from "@/core/training/recommendations";
import type { TrainingPreferences } from "@/core/training/preferences";
import type { TrainingRecommendationDto } from "@/server/queries/training";
import type { DailySessionState } from "@/server/queries/daily-plan";
import { formatTrainingHeadline, formatTrainingProof } from "@/lib/labels";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Sheet } from "@/components/ui/sheet";
import { advanceSeance, writeSeanceQueue, type SeanceItem } from "@/client/features/home/seance-queue";
import { RecommendedPuzzleSession } from "./recommended-puzzle-session";
import { TrainingPlanSettings } from "./training-plan-settings";

/**
 * `opening-due` encode `${openingId}:${variationKey}` (voir
 * `listTrainingRecommendations`) : split sur le PREMIER « : ». Même route
 * que la file des révisions d'ouverture (`/ouvertures/[slug]?drill=<clé>`).
 */
function openingHref(entityId: string): string {
  const separator = entityId.indexOf(":");
  if (separator === -1) return "/ouvertures";
  const openingId = entityId.slice(0, separator);
  const variationKey = entityId.slice(separator + 1);
  return `/ouvertures/${openingId}?drill=${encodeURIComponent(variationKey)}`;
}

/** Lien d'une action de la séance. Les puzzles s'ouvrent sur l'accueil (`/?puzzle=<id>`). */
export function recommendationHref(recommendation: TrainingRecommendationDto): string {
  if (recommendation.entityType === "puzzle") return `/?puzzle=${encodeURIComponent(recommendation.entityId)}`;
  if (recommendation.entityType === "review") {
    const [gameId, ply] = recommendation.entityId.split(":");
    return `/analyse/${gameId}?reviewPly=${ply}`;
  }
  if (recommendation.entityType === "opening") return openingHref(recommendation.entityId);
  if (recommendation.entityType === "trap") return `/pieges/${recommendation.entityId}`;
  return "/entrainer";
}

const PRIORITY_TITLE = "Priorité locale : échéance, fréquence et ampleur de tes propres erreurs — pas un score moteur.";

/**
 * Séance du jour de l'accueil : UNE action principale (« Continuer » =
 * prochaine action), les suivantes en liste, le plan dans un tiroir.
 * « Continuer » enregistre la file de la séance : la barre `SeanceBar`
 * enchaîne ensuite les actions sans repasser par l'accueil.
 */
export function TodaySession({
  recommendations,
  preferences,
  sessionState,
  initialPuzzleId,
}: {
  recommendations: TrainingRecommendationDto[];
  preferences: TrainingPreferences;
  sessionState: DailySessionState | null;
  initialPuzzleId?: string;
}) {
  const router = useRouter();
  /** `null` : liste d'actions ; sinon l'id du puzzle en cours de résolution. */
  const [puzzleSession, setPuzzleSession] = useState<string | null>(initialPuzzleId ?? null);
  const cards = groupRecommendationCards(recommendations);
  const items: SeanceItem[] = cards.map(({ item }) => ({
    href: recommendationHref(item),
    label: formatTrainingHeadline(item.reasonCode),
  }));

  function go(href: string) {
    const puzzle = href.startsWith("/?puzzle=") ? decodeURIComponent(href.slice("/?puzzle=".length)) : null;
    if (puzzle) setPuzzleSession(puzzle);
    else router.push(href);
  }

  function startSeance() {
    writeSeanceQueue({ items, index: 0 });
    go(items[0].href);
  }

  if (puzzleSession !== null) {
    return (
      <RecommendedPuzzleSession
        initialPuzzleId={puzzleSession}
        onExit={() => {
          setPuzzleSession(null);
          const next = advanceSeance();
          if (next) go(next);
          else router.replace("/");
          // Cartes fermées + complétion du plan : relues côté serveur.
          router.refresh();
        }}
      />
    );
  }

  const [first, ...rest] = cards;
  const completion = sessionState?.completion;

  return (
    <section aria-labelledby="seance-titre">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="seance-titre" className="font-display text-lg font-semibold">
          Séance du jour
        </h2>
        <Sheet
          title="Régler mon plan"
          description="Choisis tes objectifs et le nombre d'actions de ta séance."
          trigger={
            <Button variant="ghost" size="md">
              <SlidersHorizontal aria-hidden="true" />
              Régler mon plan
            </Button>
          }
        >
          <TrainingPlanSettings preferences={preferences} sessionState={sessionState} />
        </Sheet>
      </div>

      {first ? (
        <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
          <p className="text-sm text-foreground-muted">
            Prochaine action · <span className="font-mono">1/{cards.length}</span>
          </p>
          <p className="mt-1 text-lg font-medium text-foreground">{formatTrainingHeadline(first.item.reasonCode)}</p>
          {formatTrainingProof(first.item) && <p className="mt-0.5 text-sm text-foreground-muted">{formatTrainingProof(first.item)}</p>}
          <Button variant="primary" data-primary-action className="mt-4 w-full sm:w-auto sm:min-w-44" onClick={startSeance}>
            Continuer
            <ArrowRight aria-hidden="true" />
          </Button>

          {rest.length > 0 && (
            <ol aria-label="Actions suivantes de la séance" className="mt-4 divide-y divide-border border-t border-border">
              {rest.map(({ item, count }, index) => (
                <li key={item.id} className="flex min-h-12 items-center gap-3 py-2 text-sm">
                  <span className="w-6 shrink-0 font-mono text-foreground-subtle">{index + 2}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-foreground">
                      {formatTrainingHeadline(item.reasonCode)}
                      {count > 1 && <span className="ml-1.5 font-mono text-foreground-muted">×{count}</span>}
                    </span>
                    {formatTrainingProof(item) && <span className="block truncate text-xs text-foreground-muted">{formatTrainingProof(item)}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-foreground-subtle" title={PRIORITY_TITLE}>
                    Priorité {Math.round(item.priority)}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {completion && sessionState && (
            <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="flex items-center gap-1.5 text-foreground-muted">
                  <CalendarCheck aria-hidden="true" className="size-4" />
                  Réalisé aujourd&apos;hui
                </span>
                <span className="font-mono">
                  {completion.completedPoints}/{sessionState.session.effortPoints} pts
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-best" style={{ width: `${completion.percent}%` }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title="Rien de dû dans ta séance"
          action={
            <ButtonLink href="/jouer" variant="primary" data-primary-action>
              <ChessKnight aria-hidden="true" />
              Jouer une partie
            </ButtonLink>
          }
        >
          Joue une partie, lie ton compte dans les Réglages, ou élargis ton plan ({preferences.dailyLimit} actions par séance).
        </EmptyState>
      )}
    </section>
  );
}

