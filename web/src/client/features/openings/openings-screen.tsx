"use client";

/**
 * Onglet « Ouvertures » : bibliothèque curatée (`core/curriculum/openings.ts`)
 * + catalogue dynamique tiré de la base Lichess (`server/curriculum/imported-openings-index.ts`,
 * voir `server/queries/openings.ts#listOpenings`), plus de 150 entrées au
 * total — récupérée une fois côté serveur puis filtrée/cherchée entièrement
 * côté client, pas besoin d'aller-retour serveur pour ça (contrairement à
 * `LearnScreen`, qui dépend de la progression de l'utilisateur).
 *
 * `reviewSummaries`/`dueReviews` SONT de la progression utilisateur (voir
 * `server/queries/opening-progress.ts`) — chargés une fois côté serveur par
 * `app/ouvertures/page.tsx`, comme le reste de cet écran ils ne se
 * rafraîchissent qu'à la navigation (pas de polling : un drill se termine
 * sur `/ouvertures/[slug]`, jamais ici).
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MASTERY_STARS_FULL } from "@/core/curriculum/opening-mastery";
import type { OpeningSide } from "@/core/curriculum/openings";
import type { OpeningMasterySummary, OpeningReviewStatus } from "@/server/queries/opening-progress";
import type { OpeningSummary } from "@/server/queries/openings";
import { OpeningCard } from "./opening-card";
import { type ReviewQueueItem, saveReviewQueue } from "./review-queue";

type ColorFilter = OpeningSide | "both";

const COLOR_FILTERS: { id: ColorFilter; label: string }[] = [
  { id: "both", label: "Les deux camps" },
  { id: "white", label: "Blancs" },
  { id: "black", label: "Noirs" },
];

export function OpeningsScreen({
  openings,
  reviewStatuses,
  dueReviews,
  masterySummaries,
}: {
  openings: OpeningSummary[];
  reviewStatuses: { openingId: string; status: OpeningReviewStatus }[];
  dueReviews: ReviewQueueItem[];
  /** Étoiles par ouverture — barre de « Progression Totale » du répertoire et badge de chaque carte, voir `listOpeningMasterySummaries`. */
  masterySummaries: OpeningMasterySummary[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<ColorFilter>("both");

  const statusByOpening = useMemo(() => {
    const map = new Map<string, OpeningReviewStatus>();
    for (const summary of reviewStatuses) map.set(summary.openingId, summary.status);
    return map;
  }, [reviewStatuses]);

  const starsByOpening = useMemo(() => {
    const map = new Map<string, OpeningMasterySummary["stars"]>();
    for (const summary of masterySummaries) map.set(summary.openingId, summary.stars);
    return map;
  }, [masterySummaries]);

  // « Progression Totale » du répertoire : combien du catalogue est maîtrisé
  // (3⭐) — même dénominateur que le texte d'intro ("Explore N ouvertures"),
  // pour rester cohérent avec le vocabulaire déjà affiché sur cet écran.
  const masteredCount = masterySummaries.filter((summary) => summary.stars === MASTERY_STARS_FULL).length;
  const masteryPercent = openings.length > 0 ? Math.round((masteredCount / openings.length) * 100) : 0;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return openings.filter((opening) => {
      if (colorFilter !== "both" && opening.side !== colorFilter) return false;
      if (!needle) return true;
      return (
        opening.name.toLowerCase().includes(needle) ||
        opening.eco.toLowerCase().includes(needle) ||
        opening.description.toLowerCase().includes(needle)
      );
    });
  }, [openings, query, colorFilter]);

  function startTodaysReviews() {
    const [first, ...rest] = dueReviews;
    if (!first) return;
    saveReviewQueue(rest);
    router.push(`/ouvertures/${first.openingId}?drill=${encodeURIComponent(first.variationKey)}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ouvertures</h1>
          <p className="mt-2 max-w-prose text-sm text-foreground-muted">
            Explore {openings.length} ouvertures classiques : rejoue leur ligne de référence coup par coup, ou dévie
            librement pour voir jusqu&apos;où la théorie te suit.
          </p>
        </div>

        {dueReviews.length > 0 && (
          <button
            type="button"
            onClick={startTodaysReviews}
            className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            ⚡ Lancer les révisions du jour
            <span className="ml-1.5 rounded-full bg-accent-foreground/20 px-1.5 py-0.5 text-xs">{dueReviews.length}</span>
          </button>
        )}
      </div>

      {/* Progression Totale du répertoire, façon Lotus Chess — même
          dénominateur que l'intro ci-dessus (le catalogue entier), pas
          seulement les ouvertures déjà entamées : une ouverture jamais
          pratiquée compte comme "pas encore maîtrisée", pas comme absente. */}
      {masterySummaries.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Progression Totale du répertoire</span>
            <span className="font-mono text-foreground-muted">
              {masteredCount} / {openings.length} maîtrisées ({masteryPercent}%)
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-best transition-[width] duration-300"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Chercher une ouverture…"
          aria-label="Chercher une ouverture"
          className="w-full max-w-xs rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent/60 focus:outline-none"
        />
        <div className="flex gap-1.5" role="group" aria-label="Filtrer par camp">
          {COLOR_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setColorFilter(filter.id)}
              aria-pressed={colorFilter === filter.id}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                colorFilter === filter.id
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-border text-foreground-muted hover:border-accent/30 hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-foreground-muted">Aucune ouverture ne correspond à cette recherche.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opening) => (
            <OpeningCard
              key={opening.id}
              opening={opening}
              reviewStatus={statusByOpening.get(opening.id)}
              stars={starsByOpening.get(opening.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
