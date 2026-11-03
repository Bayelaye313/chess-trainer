"use client";

/**
 * Journal de bord de la section « Erreurs d'ouverture » (onglet Entraîner) —
 * arborescence à 3 niveaux façon Listudy : Ouverture (famille, ex. « Ruy
 * Lopez ») → Défense/sous-variante (ex. « Défense Berlinoise ») → liste des
 * erreurs spécifiques, avec compte d'occurrences. Le regroupement lui-même
 * (dédoublonnage par déviation, découpage famille/sous-variante) vit dans
 * `opening-mistake-groups.ts`, pur et testé indépendamment — voir son
 * docstring pour le détail (`listRepertoireDeviationGames` renvoie une entrée
 * par PARTIE, deux parties distinctes peuvent dévier à des endroits/coups
 * différents : ce sont alors deux erreurs distinctes, jamais fusionnées).
 *
 * Chaque erreur propose deux actions, jamais confondues :
 *  - « 🎯 S'entraîner » lance `OpeningMistakeExercise` : l'échiquier REJOUE en
 *    autoplay la partie réelle jusqu'à la position fautive, puis soumet la
 *    correction à la méthode Listudy stricte (un seul coup accepté) — la
 *    réussite marque la déviation « ✅ Vue / Révisée » de façon PERSISTANTE
 *    (voir `server/db/schema/opening-mistake-review.ts`), un badge que ce
 *    Hub reste seul à afficher ;
 *  - « 🔍 Explorer » lance `OpeningMistakeExplorer` : le même échiquier posé
 *    directement sur la position fautive, mais en mode BAC À SABLE Stockfish
 *    (aucun coup imposé) — comprendre la nature profonde de l'erreur plutôt
 *    que mémoriser une seule correction.
 *
 * Chargé à la demande (`getOpeningMistakesHub`, Server Action) plutôt que
 * passé en prop depuis `app/entrainer/page.tsx` — plus coûteux que
 * `listDeckOverviews` (croise le catalogue théorique ET les parties
 * importées), jamais payé tant que le joueur n'a pas ouvert ce journal. Le
 * statut de révision (`getReviewedMistakeKeys`) est rechargé à chaque retour
 * à la liste — sa propre requête, bien plus légère, plutôt que de refaire
 * tourner `getOpeningMistakesHub` en entier juste pour rafraîchir des badges.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CircleCheck, Dumbbell, Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Disclosure } from "@/components/ui/disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { takeBudget } from "@/components/ui/take-budget";
import { displayOpeningName } from "@/client/features/openings/opening-display";
import { OpeningMistakeExercise } from "@/client/features/openings/opening-mistake-exercise";
import { OpeningMistakeExplorer } from "@/client/features/openings/opening-mistake-explorer";
import { getOpeningMistakesHub, type DeviationGameSummaryDto } from "@/server/actions/practice";
import { getReviewedMistakeKeys } from "@/server/actions/opening-mistake-review";
import {
  flattenMistakes,
  groupMistakesByFamily,
  type OpeningFamilyGroup,
  type OpeningMistakeEntry,
} from "./opening-mistake-groups";

function ReviewedBadge() {
  return (
    <Chip icon={CircleCheck} tone="success">
      Revue
    </Chip>
  );
}

function CriticalityGauge({ criticality }: { criticality: number }) {
  const percent = Math.round(criticality * 100);
  return (
    <span className="flex w-28 shrink-0 items-center gap-1.5" title={`Criticité : ${percent} %`}>
      <span className="sr-only">Criticité</span>
      <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${Math.max(percent, 4)}%`,
            backgroundColor: `color-mix(in srgb, var(--quality-blunder) ${percent}%, var(--quality-inaccuracy))`,
          }}
        />
      </span>
      <span className="w-9 shrink-0 text-right font-mono text-xs text-foreground-muted">{percent} %</span>
    </span>
  );
}

function OpeningMistakeRow({
  mistake,
  onTrain,
  onExplore,
}: {
  mistake: OpeningMistakeEntry;
  onTrain: () => void;
  onExplore: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-sm text-foreground">
          <span>
            Coup {mistake.ply} : <span className="font-mono text-warning">{mistake.actualSan}</span> au lieu de{" "}
            <span className="font-mono text-success">{mistake.expectedSan}</span>
          </span>
          {mistake.reviewed && <ReviewedBadge />}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
          {mistake.gameCount} partie{mistake.gameCount > 1 ? "s" : ""} importée{mistake.gameCount > 1 ? "s" : ""}
          <CriticalityGauge criticality={mistake.criticality} />
        </span>
      </span>
      <span className="flex shrink-0 gap-2">
        <Button variant="ghost" onClick={onExplore}>
          <Search aria-hidden="true" />
          Explorer
        </Button>
        <Button onClick={onTrain}>
          <Dumbbell aria-hidden="true" />
          S&apos;entraîner
        </Button>
      </span>
    </li>
  );
}

/** Erreurs visibles par groupe avant « Voir tout ». */
const VISIBLE_PER_GROUP = 10;

function OpeningFamilySection({
  group,
  defaultOpen,
  onTrain,
  onExplore,
}: {
  group: OpeningFamilyGroup;
  defaultOpen: boolean;
  onTrain: (mistake: OpeningMistakeEntry) => void;
  onExplore: (mistake: OpeningMistakeEntry) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = takeBudget(group.subVariations, (sub) => sub.mistakes, showAll ? Number.POSITIVE_INFINITY : VISIBLE_PER_GROUP);
  const hidden = Math.max(0, group.subVariations.reduce((sum, sub) => sum + sub.mistakes.length, 0) - VISIBLE_PER_GROUP);

  return (
    <Disclosure
      defaultOpen={defaultOpen}
      summary={displayOpeningName(group.label)}
      meta={
        <>
          {group.totalMistakes} erreur{group.totalMistakes > 1 ? "s" : ""}
          {group.reviewedCount > 0 && ` · ${group.reviewedCount} revue${group.reviewedCount > 1 ? "s" : ""}`}
        </>
      }
    >
      <div className="space-y-3">
        {visible.map(({ group: subVariation, shown }) => {
          return (
            <section key={subVariation.key}>
              <h3 className="text-sm text-foreground-muted">
                {displayOpeningName(subVariation.label)}{" "}
                <span className="font-mono text-foreground-subtle">· {subVariation.mistakes.length}</span>
              </h3>
              <ul className="divide-y divide-border">
                {shown.map((mistake) => (
                  <OpeningMistakeRow key={mistake.key} mistake={mistake} onTrain={() => onTrain(mistake)} onExplore={() => onExplore(mistake)} />
                ))}
              </ul>
            </section>
          );
        })}
        {hidden > 0 && (
          <Button variant="ghost" onClick={() => setShowAll((value) => !value)}>
            {showAll ? "Réduire" : `Voir tout (${hidden} de plus)`}
          </Button>
        )}
      </div>
    </Disclosure>
  );
}

type HubView = { mode: "list" } | { mode: "train"; mistake: OpeningMistakeEntry } | { mode: "explore"; mistake: OpeningMistakeEntry };

export function OpeningMistakesHub({ onExit }: { onExit: () => void }) {
  const [games, setGames] = useState<DeviationGameSummaryDto[] | null>(null);
  const [reviewedKeys, setReviewedKeys] = useState<Set<string> | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<HubView>({ mode: "list" });

  useEffect(() => {
    let cancelled = false;
    Promise.all([getOpeningMistakesHub(), getReviewedMistakeKeys()])
      .then(([gamesResult, reviewedResult]) => {
        if (cancelled) return;
        setGames(gamesResult);
        setReviewedKeys(new Set(reviewedResult));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Rafraîchit UNIQUEMENT le statut de révision (voir le docstring du fichier) — appelé au retour à la liste depuis « S'entraîner ». */
  const refreshReviewedKeys = useCallback(() => {
    getReviewedMistakeKeys()
      .then((keys) => setReviewedKeys(new Set(keys)))
      .catch(() => {
        // Best-effort : les badges resteront simplement périmés d'un cran, sans bloquer le retour à la liste.
      });
  }, []);

  const groups = useMemo(
    () => (games && reviewedKeys ? groupMistakesByFamily(games, reviewedKeys) : null),
    [games, reviewedKeys],
  );

  // Liste à plat, même ordre que le rendu — sert le bouton « Suivant → » de
  // `OpeningMistakeExplorer` (voir son docstring et `flattenMistakes`).
  const flatMistakes = useMemo(() => (groups ? flattenMistakes(groups) : []), [groups]);

  if (view.mode === "train") {
    return (
      <OpeningMistakeExercise
        key={view.mistake.key}
        openingId={view.mistake.mostRecent.openingId}
        deviation={view.mistake.mostRecent}
        onExit={() => {
          setView({ mode: "list" });
          refreshReviewedKeys();
        }}
      />
    );
  }

  if (view.mode === "explore") {
    const nextIndex = flatMistakes.findIndex((mistake) => mistake.key === view.mistake.key) + 1;
    const next = nextIndex > 0 ? flatMistakes[nextIndex] : undefined;
    return (
      <OpeningMistakeExplorer
        key={view.mistake.key}
        deviation={view.mistake.mostRecent}
        onExit={() => setView({ mode: "list" })}
        onNext={next ? () => setView({ mode: "explore", mistake: next }) : undefined}
      />
    );
  }

  return (
    <div>
      <PageHeader
        back={
          <button type="button" onClick={onExit} className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-foreground-muted hover:text-foreground">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Réviser
          </button>
        }
        title="Mes erreurs d'ouverture"
        description="Là où tu quittes la théorie dans tes parties, par ouverture : corrige-les ou explore-les au moteur."
      />

      {error && (
        <EmptyState icon={TriangleAlert} title="Impossible de charger le journal pour l'instant.">
          Réessaie dans un instant.
        </EmptyState>
      )}

      {!groups && !error && (
        <div aria-busy="true" className="space-y-2">
          <span className="sr-only">Chargement…</span>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-12 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      )}

      {groups && groups.length === 0 && (
        <EmptyState title="Aucune déviation détectée dans tes parties importées">
          Continue comme ça, ou lie un compte dans les Réglages pour importer d&apos;autres parties.
        </EmptyState>
      )}

      {groups && groups.length > 0 && (
        <div className="border-b border-border">
          {groups.map((group, index) => (
            <OpeningFamilySection
              key={group.key}
              group={group}
              defaultOpen={index === 0}
              onTrain={(mistake) => setView({ mode: "train", mistake })}
              onExplore={(mistake) => setView({ mode: "explore", mistake })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
