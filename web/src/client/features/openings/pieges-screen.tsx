"use client";

/**
 * Onglet « ⚔️ Pièges » — Dashboard de Campagne à DEUX niveaux de navigation,
 * pensé pour absorber l'explosion de contenu de l'architecture « Gambits &
 * Variantes » (voir le docstring de `traps.ts`) :
 *
 *  - NIVEAU 1 (`selectedFamily === null`) : grille de dossiers, une grande
 *    carte par `family` (l'ouverture — « Partie Italienne », « Défense
 *    Sicilienne »…) avec un anneau de progression (résolus / total, voir
 *    `trap-progress.ts`).
 *  - NIVEAU 2 (`selectedFamily` posé) : au clic sur une ouverture, liste des
 *    séries de gambits (`gambit`) qu'elle contient — chaque carte est un lien
 *    DIRECT vers `/pieges/[slug]` du premier piège NON résolu de la série (le
 *    premier tout court si elle est déjà entièrement résolue), jamais une
 *    grille de pastilles numériques intermédiaire à parcourir avant
 *    d'atteindre l'échiquier (voir `firstActiveTrap` ci-dessous) : `/pieges/
 *    [slug]` sert déjà tout l'enchaînement de la série (`seriesTraps`,
 *    bouton « Suivant → » de `OpeningTrapDrill`), inutile de reparcourir
 *    manuellement chaque pastille pour y accéder.
 *
 * Filtrage/navigation entièrement côté client pour NIVEAU 1↔2 (pas de route
 * dédiée) : `selectedFamily` est un simple état React, jamais persisté — un
 * aller-retour vers `/pieges` repart toujours du NIVEAU 1, ce qui est le
 * comportement voulu (voir aussi `PiegeDrillScreen`, qui ramène ici via
 * `onExit`).
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OpeningTrap } from "@/core/curriculum/traps";
import { DIFFICULTY_ORDER } from "@/core/curriculum/traps";
import { familyIcon } from "./trap-family-icon";
import { getSolvedTrapIds } from "./trap-progress";

/** Regroupe `items` par la clé de `keyOf`, dans l'ordre de première apparition — sert aux trois niveaux (famille, gambit). */
function groupByKey<T>(items: readonly T[], keyOf: (item: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return Array.from(map.entries());
}

/** Puzzles d'une série (`gambit`), triés du plus accessible au plus pointu — même ordre que la grille de pastilles NIVEAU 3 et que `OpeningTrapDrill` (voir `seriesTraps` dans `piege-drill-screen.tsx`). */
function sortByDifficulty(traps: readonly OpeningTrap[]): OpeningTrap[] {
  return [...traps].sort((a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty));
}

/** Anneau de progression façon Dashboard de Campagne — pur CSS (`conic-gradient`), aucune lib de charts pour un simple pourcentage. */
function ProgressRing({ percent }: { percent: number }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(var(--accent) ${Math.round(percent * 3.6)}deg, var(--surface-muted) 0deg)` }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-foreground">
        {percent}%
      </div>
    </div>
  );
}

function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
    >
      {children}
    </button>
  );
}

export function PiegesScreen({ traps }: { traps: readonly OpeningTrap[] }) {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  // Chargée après montage (localStorage n'existe pas côté serveur) — voir `trap-progress.ts`.
  const [solvedIds, setSolvedIds] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    // `setState` déféré au prochain tick (jamais synchrone dans le corps de l'effet, react-hooks/set-state-in-effect)
    // — même convention que `use-opening-drill.ts`/`error-feedback.ts`.
    const timer = setTimeout(() => setSolvedIds(getSolvedTrapIds()), 0);
    return () => clearTimeout(timer);
  }, []);

  const familyGroups = useMemo(() => groupByKey(traps, (trap) => trap.family), [traps]);

  const gambitGroups = useMemo(() => {
    if (selectedFamily === null) return [];
    const familyTraps = traps.filter((trap) => trap.family === selectedFamily);
    return groupByKey(familyTraps, (trap) => trap.gambit);
  }, [traps, selectedFamily]);

  function goToFamilies() {
    setSelectedFamily(null);
  }

  // ──────────────────────────────────────────────────────────────────────
  // NIVEAU 2 — séries de gambits d'une ouverture, chacune un lien direct
  // vers l'échiquier de son premier piège actif (voir le docstring de fichier).
  // ──────────────────────────────────────────────────────────────────────
  if (selectedFamily !== null) {
    return (
      <div className="space-y-6">
        <div>
          <BackButton onClick={goToFamilies}>← Retour aux ouvertures</BackButton>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">
            {familyIcon(selectedFamily)} {selectedFamily}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gambitGroups.map(([gambit, gambitTraps]) => {
            const sorted = sortByDifficulty(gambitTraps);
            const solvedCount = sorted.filter((trap) => solvedIds.has(trap.id)).length;
            const percent = Math.round((solvedCount / sorted.length) * 100);
            // Premier piège NON résolu de la série (le tout premier si elle est déjà entièrement résolue) — c'est
            // LUI que sert `/pieges/[slug]`, jamais l'entrée #1 sans égard à la progression déjà faite.
            const firstActiveTrap = sorted.find((trap) => !solvedIds.has(trap.id)) ?? sorted[0];
            return (
              <Link
                key={gambit}
                href={`/pieges/${firstActiveTrap.id}`}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-accent/40"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-foreground">{gambit}</h3>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    {solvedCount} / {sorted.length} résolus
                  </p>
                </div>
                <ProgressRing percent={percent} />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // NIVEAU 1 — grille de dossiers, une carte par ouverture.
  // ──────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">⚔️ Pièges d&apos;ouverture</h1>
        <p className="mt-2 max-w-prose text-sm text-foreground-muted">
          {traps.length} puzzles répartis en {familyGroups.length} ouvertures, chacune découpée en séries de gambits.
          L&apos;ordinateur amène chaque position de manière agressive — à toi de résister à la tentation et de trouver
          la réfutation précise avant qu&apos;il ne referme le piège.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {familyGroups.map(([family, familyTraps]) => {
          const solvedCount = familyTraps.filter((trap) => solvedIds.has(trap.id)).length;
          const percent = Math.round((solvedCount / familyTraps.length) * 100);
          return (
            <button
              key={family}
              type="button"
              onClick={() => setSelectedFamily(family)}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-5 text-left transition-colors hover:border-accent/40 hover:shadow-sm"
            >
              <span className="text-3xl" aria-hidden="true">
                {familyIcon(family)}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-foreground">{family}</h2>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  {solvedCount} / {familyTraps.length} résolus
                </p>
              </div>
              <ProgressRing percent={percent} />
            </button>
          );
        })}
        {familyGroups.length === 0 && <p className="text-sm text-foreground-muted">Aucun piège disponible pour l&apos;instant.</p>}
      </div>
    </div>
  );
}
