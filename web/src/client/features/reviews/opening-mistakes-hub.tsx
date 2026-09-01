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
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-best/40 bg-best/10 px-2 py-0.5 text-xs font-medium text-best">
      ✅ Vue / Révisée
    </span>
  );
}

function OpeningMistakeCard({
  mistake,
  onTrain,
  onExplore,
}: {
  mistake: OpeningMistakeEntry;
  onTrain: () => void;
  onExplore: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Coup {mistake.ply} — <span className="font-mono">{mistake.actualSan}</span> au lieu de{" "}
            <span className="font-mono">{mistake.expectedSan}</span>
          </span>
          {mistake.reviewed && <ReviewedBadge />}
        </span>
        <span className="mt-1 block text-xs text-foreground-muted">
          {mistake.gameCount} partie{mistake.gameCount > 1 ? "s" : ""} importée{mistake.gameCount > 1 ? "s" : ""}
        </span>
      </span>
      <span className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onExplore}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
        >
          🔍 Explorer
        </button>
        <button
          type="button"
          onClick={onTrain}
          className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/20"
        >
          🎯 S&apos;entraîner
        </button>
      </span>
    </div>
  );
}

function OpeningFamilySection({
  group,
  onTrain,
  onExplore,
}: {
  group: OpeningFamilyGroup;
  onTrain: (mistake: OpeningMistakeEntry) => void;
  onExplore: (mistake: OpeningMistakeEntry) => void;
}) {
  return (
    <details open className="rounded-lg border border-border bg-surface-muted/20">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3 hover:bg-surface-muted/40">
        <span className="text-sm font-semibold text-foreground">📂 {group.label}</span>
        <span className="text-xs text-foreground-muted">
          {group.subVariations.length} sous-variante{group.subVariations.length > 1 ? "s" : ""} ·{" "}
          {group.totalMistakes} erreur{group.totalMistakes > 1 ? "s" : ""}
          {group.reviewedCount > 0 && ` · ${group.reviewedCount} revue${group.reviewedCount > 1 ? "s" : ""}`}
        </span>
      </summary>
      <div className="space-y-3 px-4 pb-4">
        {group.subVariations.map((subVariation) => (
          <details key={subVariation.key} open className="rounded-md border border-border/60 bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent hover:bg-surface-muted/30">
              <span>♟️ {subVariation.label}</span>
              <span className="normal-case text-foreground-muted">
                {subVariation.mistakes.length} erreur{subVariation.mistakes.length > 1 ? "s" : ""} distincte
                {subVariation.mistakes.length > 1 ? "s" : ""}
              </span>
            </summary>
            <div className="space-y-2 p-3 pt-1">
              {subVariation.mistakes.map((mistake) => (
                <OpeningMistakeCard
                  key={mistake.key}
                  mistake={mistake}
                  onTrain={() => onTrain(mistake)}
                  onExplore={() => onExplore(mistake)}
                />
              ))}
            </div>
          </details>
        ))}
      </div>
    </details>
  );
}

/** L'écran affiché — liste, ou une des deux actions ouvertes sur une erreur précise. Jamais deux à la fois. */
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">📊 Mes erreurs d&apos;ouverture</h1>
          <p className="mt-2 max-w-prose text-sm text-foreground-muted">
            Les ouvertures où tu t&apos;écartes de la théorie dans tes vraies parties, classées par ouverture puis par
            sous-variante — corrige-les une à une, ou explore-les librement au moteur.
          </p>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour aux decks
        </button>
      </div>

      {error && <p className="text-sm text-inaccuracy">Impossible de charger le journal pour l&apos;instant.</p>}

      {!groups && !error && <p className="text-sm text-foreground-muted">Chargement…</p>}

      {groups && groups.length === 0 && (
        <p className="text-sm text-foreground-muted">
          Aucune déviation détectée dans tes parties importées pour l&apos;instant — continue comme ça, ou importe
          d&apos;autres parties depuis l&apos;onglet « Parties ».
        </p>
      )}

      {groups && groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group) => (
            <OpeningFamilySection
              key={group.key}
              group={group}
              onTrain={(mistake) => setView({ mode: "train", mistake })}
              onExplore={(mistake) => setView({ mode: "explore", mistake })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
