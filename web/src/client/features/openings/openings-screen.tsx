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
import Link from "next/link";
import { ArrowRight, ChevronDown, History, RotateCcw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Disclosure } from "@/components/ui/disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MASTERY_STARS_FULL } from "@/core/curriculum/opening-mastery";
import type { OpeningMasterySummary, OpeningReviewStatus } from "@/server/queries/opening-progress";
import type { OpeningSummary } from "@/server/queries/openings";
import { OpeningCard } from "./opening-card";
import { displayOpeningName, isOffRepertoire } from "./opening-display";
import type { OpeningSessionHistory } from "./opening-endurance-history";
import { OpeningPerformanceRadar } from "./opening-performance-radar-view";
import { type ReviewQueueItem, saveReviewQueue } from "./review-queue";

type CatalogTab = "white" | "black" | "others";

const CATALOG_TABS: readonly { value: CatalogTab; title: string }[] = [
  { value: "white", title: "Avec les Blancs" },
  { value: "black", title: "Avec les Noirs" },
  { value: "others", title: "Autres ouvertures" },
];

/** Cartes visibles par onglet avant « Voir les N autres » (≤ 8 éléments visibles sur desktop). */
const FOLDED_CARDS = 2;

/**
 * Ouvertures : onglets « Avec les Blancs » / « Avec les Noirs » (répertoire,
 * cartes curatées) et « Autres ouvertures » (familles Lichess sans cours et
 * cours hors répertoire) ; chaque onglet montre deux cartes puis « Voir les
 * N autres ». Une recherche affiche tous les résultats à plat. « Mon niveau »
 * replié (progression, radar, endurance). Un seul CTA : réviser les
 * variantes dues aujourd'hui.
 */
export function OpeningsScreen({
  openings,
  reviewStatuses,
  dueReviews,
  masterySummaries,
  enduranceSessions,
}: {
  openings: OpeningSummary[];
  reviewStatuses: { openingId: string; status: OpeningReviewStatus }[];
  dueReviews: ReviewQueueItem[];
  /** Étoiles par ouverture — barre de « Progression Totale » du répertoire et badge de chaque carte, voir `listOpeningMasterySummaries`. */
  masterySummaries: OpeningMasterySummary[];
  /** Sessions « Sans Guide », toutes ouvertures — alimentent le radar de performance, voir `listEnduranceSessions`. */
  enduranceSessions: OpeningSessionHistory[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<CatalogTab>("white");
  const [expanded, setExpanded] = useState<ReadonlySet<CatalogTab>>(new Set());

  function toggleExpanded(value: CatalogTab) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

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

  // Progression du répertoire : part du catalogue entier maîtrisée (3 étoiles).
  const masteredCount = masterySummaries.filter((summary) => summary.stars === MASTERY_STARS_FULL).length;
  const masteryPercent = openings.length > 0 ? Math.round((masteredCount / openings.length) * 100) : 0;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return openings;
    return openings.filter(
      (opening) =>
        opening.name.toLowerCase().includes(needle) ||
        displayOpeningName(opening.name).toLowerCase().includes(needle) ||
        opening.eco.toLowerCase().includes(needle) ||
        opening.description.toLowerCase().includes(needle),
    );
  }, [openings, query]);

  const repertoire = filtered.filter((opening) => !opening.id.startsWith("lichess-") && !isOffRepertoire(opening.id));
  const others = filtered.filter((opening) => opening.id.startsWith("lichess-") || isOffRepertoire(opening.id));
  const searching = query.trim().length > 0;
  const byTab: Record<CatalogTab, OpeningSummary[]> = {
    white: repertoire.filter((opening) => opening.side === "white"),
    black: repertoire.filter((opening) => opening.side === "black"),
    others,
  };

  function startTodaysReviews() {
    const [first, ...rest] = dueReviews;
    if (!first) return;
    saveReviewQueue(rest);
    router.push(`/ouvertures/${first.openingId}?drill=${encodeURIComponent(first.variationKey)}`);
  }

  const card = (opening: OpeningSummary) => (
    <li key={opening.id}>
      <OpeningCard opening={opening} reviewStatus={statusByOpening.get(opening.id)} stars={starsByOpening.get(opening.id)} />
    </li>
  );

  return (
    <div>
      <PageHeader
        title="Ouvertures"
        description="Ton répertoire : cours commentés, drills et révisions des variantes."
        action={
          dueReviews.length > 0 ? (
            <Button variant="primary" data-primary-action onClick={startTodaysReviews} className="w-full sm:w-auto">
              <RotateCcw aria-hidden="true" />
              Réviser les variantes du jour ({dueReviews.length})
            </Button>
          ) : (
            <Chip tone="success">Aucune variante à réviser aujourd&apos;hui</Chip>
          )
        }
      />

      <div className="relative mb-6 max-w-sm">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-subtle" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Chercher une ouverture ou un code ECO…"
          aria-label="Chercher une ouverture"
          className="min-h-11 w-full rounded-md border border-border-strong bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none"
        />
      </div>

      {searching ? (
        <section aria-label="Résultats de la recherche" className="mb-6">
          {filtered.length === 0 ? (
            <EmptyState title="Aucune ouverture ne correspond à cette recherche." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{[...repertoire, ...others].map(card)}</ul>
          )}
        </section>
      ) : (
        <Tabs value={tab} onValueChange={(value) => setTab(value as CatalogTab)} className="mb-6">
          <TabsList aria-label="Catalogue des ouvertures">
            {CATALOG_TABS.map(({ value, title }) => (
              <TabsTrigger key={value} value={value}>
                {title}
                <span className="font-mono text-foreground-subtle">{byTab[value].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {CATALOG_TABS.map(({ value }) => {
            const list = byTab[value];
            const open = expanded.has(value);
            const rest = list.length - FOLDED_CARDS;
            return (
              <TabsContent key={value} value={value}>
                {value === "others" && (
                  <p className="mb-3 text-sm text-foreground-muted">Familles de la base Lichess (drill seul) et cours hors de ton répertoire.</p>
                )}
                {list.length === 0 ? (
                  <EmptyState title="Aucune ouverture dans ce groupe." />
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {(open || rest <= 1 ? list : list.slice(0, FOLDED_CARDS)).map(card)}
                    {rest > 1 && (
                      <li>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(value)}
                          aria-expanded={open}
                          className="flex min-h-[68px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong px-4 py-3 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                          {open ? "Réduire" : `Voir les ${rest} autres`}
                          <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <Disclosure summary="Mon niveau" meta={`${masteredCount}/${openings.length} maîtrisées`} className="border-b">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">Progression du répertoire</span>
              <span className="font-mono">
                {masteredCount}/{openings.length} · {masteryPercent} %
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-best" style={{ width: `${masteryPercent}%` }} />
            </div>
          </div>

          <OpeningPerformanceRadar sessions={enduranceSessions} />

          <Link
            href="/ouvertures/historique-endurance"
            className="flex min-h-14 items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-surface-muted"
          >
            <History aria-hidden="true" className="size-5 shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Historique d&apos;endurance</span>
              <span className="block text-sm text-foreground-muted">Ton record sans aide, ta tendance et le classement de tes ouvertures.</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-foreground-muted" />
          </Link>
        </div>
      </Disclosure>
    </div>
  );
}
