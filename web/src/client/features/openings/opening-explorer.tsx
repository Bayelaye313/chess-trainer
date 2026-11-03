"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OPENING_COURSE_IDS } from "@/core/curriculum/opening-course-ids";
import { findVariationByKey, MAIN_LINE_VARIATION_KEY } from "@/core/curriculum/opening-variation-key";
import type { OpeningLine } from "@/core/curriculum/openings";
import type { RepertoireDeviation } from "@/server/queries/opening-mistakes";
import type { VariationAccuracy } from "@/server/queries/opening-progress";
import type { AnnotatedPly, OpeningVariation } from "@/server/queries/openings";
import type { DrillRound } from "./build-final-test";
import { OpeningDrill } from "./opening-drill";
import { OpeningSparring } from "./opening-sparring";
import { DRILL_ANCHOR_ID } from "./opening-stats";
import { BookOpen, BookOpenCheck, ChartColumn, Clock, Dumbbell, TriangleAlert } from "lucide-react";
import type { CourseGamesOverviewRow } from "@/server/queries/course-games";
import { moveNumberLabel } from "@/core/curriculum/course-game-match";
import type { CourseTreeFocus } from "@/client/features/learn/course-tree-viewer";
import { accuracyTextClass } from "@/lib/labels";
import { BackLink } from "@/components/ui/back-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Disclosure } from "@/components/ui/disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courseHref, readCoursePosition } from "./course-position";
import type { OpeningEnduranceComparison } from "./opening-endurance-history";
import { COURSE_STATE_DISPLAY, courseState, displayOpeningName } from "./opening-display";
import { OpeningStatsZone } from "./opening-stats-zone";
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
  sideOverride,
  startInSansGuide = false,
  practicedVariationKeys,
  deviations,
  variationAccuracies,
  ranking,
  courseGames,
}: {
  /** Classement d'endurance global (`compareOpenings`) — zone « Mon endurance » du Drill. */
  ranking: readonly OpeningEnduranceComparison[];
  /** Résumé de tes parties face au cours (ouvertures à cours seulement). */
  courseGames: CourseGamesOverviewRow | null;
  opening: OpeningLine;
  plies: readonly AnnotatedPly[];
  variations: readonly OpeningVariation[];
  /** `?drill=<clé>` — relance directe une variante depuis "Lancer les révisions du jour", voir `review-queue.ts`. */
  drillVariationKey?: string;
  /**
   * `?side=white|black` (feuille de route Zone 4) : camp majoritaire DU
   * JOUEUR dans cette ouverture, transmis par le bandeau « Ouverture en
   * difficulté » du Rapport — oriente le drill ET le sparring pour
   * s'entraîner du bon côté. `undefined` : perspective camp du catalogue
   * (`opening.side`), comportement historique inchangé.
   */
  sideOverride?: "white" | "black";
  /** `?mode=sans-guide` (Zone Stats) — le drill démarre en Manche 2, voir `useOpeningDrill`. */
  startInSansGuide?: boolean;
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
  const hasCourse = OPENING_COURSE_IDS.has(opening.id);
  // Onglet par défaut : le Drill quand l'URL le vise (révision, ?side=, Sans aide), sinon le Cours s'il existe.
  const [tab, setTab] = useState<string>(drillVariationKey || sideOverride || startInSansGuide || !hasCourse ? "drill" : "cours");
  const [resume, setResume] = useState<CourseTreeFocus | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture d'une position locale après montage
  useEffect(() => setResume(readCoursePosition(opening.id)), [opening.id]);
  const name = displayOpeningName(opening.name);
  const state = COURSE_STATE_DISPLAY[courseState(opening.id)];

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
    setTab("drill");
  }

  return (
    <div>
      <header className="mb-4">
        <BackLink href="/ouvertures">Ouvertures</BackLink>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-[26px] leading-tight font-semibold sm:text-[32px]">{name}</h1>
          <span className="font-mono text-sm text-foreground-subtle">{opening.eco}</span>
          <span className="flex items-center gap-1.5 text-sm text-foreground-muted">
            <SideDot side={opening.side} />
            {SIDE_LABEL[opening.side]}
          </span>
          <Chip icon={state.icon} tone={state.tone}>
            {state.label}
          </Chip>
        </div>
        <p className="mt-1 line-clamp-2 max-w-[70ch] text-sm text-foreground-muted">{opening.description}</p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Sections de l'ouverture">
          <TabsTrigger value="cours">
            <BookOpen aria-hidden="true" />
            Cours
          </TabsTrigger>
          <TabsTrigger value="drill">
            <Dumbbell aria-hidden="true" />
            Drill
          </TabsTrigger>
          <TabsTrigger value="parties">
            <ChartColumn aria-hidden="true" />
            Mes parties
          </TabsTrigger>
          <TabsTrigger value="erreurs">
            <TriangleAlert aria-hidden="true" />
            Mes erreurs
            {deviations.length > 0 && <span className="font-mono text-xs text-foreground-subtle">{deviations.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cours">
          {hasCourse ? (
            <div className="max-w-2xl">
              <p className="text-foreground-muted">
                Fiche d&apos;identité, arbre théorique commenté coup par coup, déviations à punir et plans du milieu de jeu.
              </p>
              <ButtonLink href={courseHref(opening.id, resume)} variant="primary" data-primary-action className="mt-4">
                <BookOpenCheck aria-hidden="true" />
                {resume ? `Reprendre le cours (chapitre ${resume.chapterIndex + 1})` : "Commencer le cours"}
              </ButtonLink>
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title={opening.id.startsWith("lichess-") ? "Pas de cours pour cette famille" : "Cours à venir"}
              action={
                <Button variant="primary" data-primary-action onClick={() => setTab("drill")}>
                  <Dumbbell aria-hidden="true" />
                  Aller au drill
                </Button>
              }
            >
              En attendant, le drill de la ligne principale et de ses variantes est prêt.
            </EmptyState>
          )}
        </TabsContent>

        {/* Toujours monté : changer d'onglet ne perd pas la partie de drill en cours. */}
        <TabsContent value="drill" forceMount className="data-[state=inactive]:hidden">
          <div className="space-y-5">
            {/* Cible des liens `#drill` (`DRILL_ANCHOR_ID`) ; la marge évite que l'en-tête fixe masque le haut du drill. */}
            <div id={DRILL_ANCHOR_ID} className="scroll-mt-20">
              <OpeningDrill
                opening={opening}
                plies={plies}
                variations={variations}
                practicedVariationKeys={practicedVariationKeys}
                variationAccuracies={variationAccuracies}
                autoStart={autoStartSelection}
                inReviewQueue={drillVariationKey != null}
                playerSide={sideOverride}
                startInSansGuide={startInSansGuide}
                onExit={() => router.push("/ouvertures")}
              />
            </div>
            <div>
              <Disclosure summary="Progression de l'étude">
                <StudyProgressBar variations={variations} accuracyByKey={accuracyByKey} />
              </Disclosure>
              <Disclosure summary="Mon endurance sans aide">
                <OpeningStatsZone
                  openingId={opening.id}
                  openingName={name}
                  playerSide={sideOverride ?? opening.side}
                  ranking={ranking}
                  onOpenCourse={hasCourse ? () => setTab("cours") : undefined}
                />
              </Disclosure>
              <Disclosure summary="Jouer cette ligne contre le moteur" className="border-b">
                <OpeningSparring
                  openingId={opening.id}
                  openingName={name}
                  variationKey={drillVariationKey ?? MAIN_LINE_VARIATION_KEY}
                  script={autoStartSelection.kind === "variation" ? autoStartSelection.variation.uciMoves : plies.map((ply) => ply.uci)}
                  playerSide={sideOverride ?? opening.side}
                />
              </Disclosure>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parties">
          {courseGames && courseGames.gamesPlayed > 0 ? (
            <div className="max-w-2xl space-y-4">
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dd className="font-mono text-2xl">{courseGames.gamesPlayed}</dd>
                  <dt className="text-sm text-foreground-muted">parties dans ce cours</dt>
                </div>
                <div>
                  <dd className="font-mono text-2xl">{courseGames.gamesWithDeviation}</dd>
                  <dt className="text-sm text-foreground-muted">sorties du cours</dt>
                </div>
                <div>
                  <dd className={`font-mono text-2xl ${accuracyTextClass(courseGames.winRate)}`}>{courseGames.winRate !== null ? `${courseGames.winRate} %` : "—"}</dd>
                  <dt className="text-sm text-foreground-muted">de victoires</dt>
                </div>
              </dl>
              {courseGames.topDeviation && (
                <p className="text-sm text-foreground-muted">
                  Ta sortie la plus fréquente :{" "}
                  <span className="font-mono text-warning">
                    {moveNumberLabel(courseGames.topDeviation.ply)}
                    {courseGames.topDeviation.playedSan}
                  </span>{" "}
                  ({courseGames.topDeviation.count} fois).
                </p>
              )}
              <ButtonLink href={`/rapport/ouvertures/${opening.id}`} variant="primary" data-primary-action>
                <ChartColumn aria-hidden="true" />
                Voir le rapport de mes parties
              </ButtonLink>
            </div>
          ) : (
            <EmptyState icon={ChartColumn} title="Aucune de tes parties analysées n'entre dans ce cours">
              {hasCourse
                ? "Dès qu'une partie importée suit cette ouverture, elle est rejouée ici dans le cours."
                : "Le rapport partie par partie existe pour les ouvertures qui ont un cours. Tes parties restent visibles dans Progrès."}
            </EmptyState>
          )}
        </TabsContent>

        <TabsContent value="erreurs">
          {deviations.length === 0 ? (
            <EmptyState icon={TriangleAlert} title="Aucune erreur fréquente détectée">
              Les coups que tu joues à la place de la théorie dans tes parties importées apparaîtront ici.
            </EmptyState>
          ) : (
            <>
              <p className="mb-3 text-sm text-foreground-muted">Coups joués dans tes parties à la place de la théorie, à transformer en drill ciblé.</p>
              <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
                {deviations.map((deviation) => (
                  <li key={`${deviation.fenBefore}-${deviation.actualUci}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono">
                        {deviation.ply}. … <span className="text-warning">{deviation.actualSan}</span> <span className="font-sans text-foreground-muted">au lieu de</span>{" "}
                        <span className="text-success">{deviation.expectedSan}</span>
                      </span>
                      <span className="text-sm text-foreground-muted">
                        {deviation.count} partie{deviation.count > 1 ? "s" : ""} importée{deviation.count > 1 ? "s" : ""}
                      </span>
                    </span>
                    <Button onClick={() => trainOnDeviation(deviation)}>
                      <Dumbbell aria-hidden="true" />
                      M&apos;entraîner
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
