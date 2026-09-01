"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { findVariationByKey, MAIN_LINE_VARIATION_KEY } from "@/core/curriculum/opening-variation-key";
import type { OpeningLine } from "@/core/curriculum/openings";
import type { RepertoireDeviation } from "@/server/queries/opening-mistakes";
import type { VariationAccuracy } from "@/server/queries/opening-progress";
import type { AnnotatedPly, OpeningVariation } from "@/server/queries/openings";
import type { DrillRound } from "./build-final-test";
import { OpeningDrill } from "./opening-drill";
import { SIDE_LABEL, SideDot } from "./side-dot";
import { StudyProgressBar } from "./study-progress-bar";
import type { DrillSelection } from "./use-opening-drill";

/**
 * Point d'entrée de `/ouvertures/[slug]` — interface UNIQUE façon Listudy
 * (audit UX du 2026-08-30) : cliquer une ouverture (ou une variante depuis
 * "Lancer les révisions du jour"/"Mes erreurs fréquentes") tombe TOUJOURS
 * directement sur l'échiquier réactif de `OpeningDrill` (flèche d'indice par
 * défaut, IA qui répond automatiquement) — plus jamais sur un bac à sable
 * passif à côté. L'ancien mode « Explorer » (échiquier libre, arbre des
 * variantes, `useOpeningExplorer`) a été retiré : `autoStartSelection`
 * retombe sur la ligne principale plutôt que sur `null` précisément pour ça,
 * aucun placeholder « choisis un chapitre » n'est plus jamais montré au
 * premier chargement.
 */
export function OpeningExplorer({
  opening,
  plies,
  variations,
  drillVariationKey,
  practicedVariationKeys,
  deviations,
  variationAccuracies,
}: {
  opening: OpeningLine;
  plies: readonly AnnotatedPly[];
  variations: readonly OpeningVariation[];
  /** `?drill=<clé>` — relance directe une variante depuis "Lancer les révisions du jour", voir `review-queue.ts`. */
  drillVariationKey?: string;
  /** Clés des variantes déjà pratiquées au moins une fois — sert le Test Final (Étape 3 du Mode Entraînement). */
  practicedVariationKeys: readonly string[];
  /** Écarts de répertoire récurrents détectés dans les parties importées — voir `server/queries/opening-mistakes.ts`. */
  deviations: readonly RepertoireDeviation[];
  /** Dernière précision par variante — étoiles des chapitres et transition automatique du Mode Entraînement, voir `use-opening-drill.ts`. */
  variationAccuracies: readonly VariationAccuracy[];
}) {
  const router = useRouter();
  // Exercice ciblé demandé depuis "Mes erreurs fréquentes" (`trainOnDeviation`
  // ci-dessous) — a priorité sur `?drill=<clé>` : cliquer une erreur alors
  // qu'on était arrivé via la file de révisions doit lancer CET exercice-là.
  const [mistakeSelection, setMistakeSelection] = useState<DrillSelection | null>(null);

  // Résout la sélection à démarrer immédiatement : l'exercice ciblé choisi
  // (le cas échéant), sinon `?drill=<clé>` (le cas échéant, `null` si la clé
  // est absente/périmée), sinon la LIGNE PRINCIPALE par défaut — jamais
  // `null` pour un premier chargement normal, voir le docstring du fichier.
  const autoStartSelection = useMemo<DrillSelection>(() => {
    if (mistakeSelection) return mistakeSelection;
    if (drillVariationKey) {
      if (drillVariationKey === MAIN_LINE_VARIATION_KEY) return { kind: "main-line" };
      const variation = findVariationByKey(variations, drillVariationKey);
      if (variation) return { kind: "variation", variation };
    }
    return { kind: "main-line" };
  }, [mistakeSelection, drillVariationKey, variations]);

  const accuracyByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of variationAccuracies) map.set(entry.variationKey, entry.lastAccuracy);
    return map;
  }, [variationAccuracies]);

  function trainOnDeviation(deviation: RepertoireDeviation) {
    const round: DrillRound = {
      startFen: deviation.fenBefore,
      script: plies.slice(deviation.ply - 1).map((ply) => ply.uci),
      label: `${deviation.expectedSan} attendu ici`,
      startPly: deviation.ply - 1,
    };
    // Position fautive déjà connue (`deviation.fenBefore`) mais pas la partie
    // entière — `leadInUci` vide saute directement dessus, sans autoplay (voir
    // `opening-mistakes-hub.tsx` pour le cas où la partie complète est rejouée).
    setMistakeSelection({ kind: "mistake", round, leadInUci: [], actualSan: deviation.actualSan });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/ouvertures" className="text-sm text-foreground-muted hover:text-foreground">
          ← Toutes les ouvertures
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{opening.name}</h1>
          <span className="rounded-full border border-book/40 bg-book/10 px-2 py-0.5 text-xs font-medium text-book">
            {opening.eco}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
            <SideDot side={opening.side} />
            {SIDE_LABEL[opening.side]}
          </span>
        </div>
        <p className="mt-2 max-w-prose text-sm text-foreground-muted">{opening.description}</p>
      </div>

      <StudyProgressBar variations={variations} accuracyByKey={accuracyByKey} />

      {deviations.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">⚠️ Mes erreurs fréquentes</h2>
          <p className="mt-1 text-xs text-foreground-muted">
            Coups que tu joues dans tes parties importées à la place de la théorie — transformés en exercices ciblés à
            répéter.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {deviations.map((deviation) => (
              <li
                key={`${deviation.fenBefore}-${deviation.actualUci}`}
                className="rounded-md border border-border px-2.5 py-2 text-sm"
              >
                <span className="block font-mono text-foreground">
                  {deviation.ply}. … {deviation.actualSan} <span className="font-sans text-foreground-muted">au lieu de</span>{" "}
                  {deviation.expectedSan}
                </span>
                <span className="text-xs text-foreground-muted">
                  {deviation.count} partie{deviation.count > 1 ? "s" : ""} importée{deviation.count > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => trainOnDeviation(deviation)}
                  className="mt-2 block rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent/20"
                >
                  🎯 M&apos;entraîner
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <OpeningDrill
        opening={opening}
        plies={plies}
        variations={variations}
        practicedVariationKeys={practicedVariationKeys}
        variationAccuracies={variationAccuracies}
        autoStart={autoStartSelection}
        inReviewQueue={drillVariationKey != null}
        onExit={() => router.push("/ouvertures")}
      />
    </div>
  );
}
