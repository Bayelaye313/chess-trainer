"use client";

/**
 * Onglet « ⚔️ Pièges » — Dashboard de Campagne à TROIS niveaux de navigation,
 * pensé pour absorber l'explosion de contenu de l'architecture « Gambits &
 * Variantes » (voir le docstring de `traps.ts`) :
 *
 *  - NIVEAU 1 (`selectedFamily === null`) : grille de dossiers, une grande
 *    carte par `family` (l'ouverture — « Partie Italienne », « Défense
 *    Sicilienne »…) avec un anneau de progression (résolus / total, voir
 *    `trap-progress.ts`).
 *  - NIVEAU 2 (`selectedFamily` posé, `selectedGambit === null`) : au clic sur
 *    une ouverture, liste des séries de gambits (`gambit`) qu'elle contient.
 *  - NIVEAU 3 (les deux posés) : grille de pastilles numériques (une par
 *    puzzle, triées par difficulté croissante) — couleur = difficulté,
 *    contour + ✅ si déjà résolue.
 *
 * Filtrage/navigation entièrement côté client (pas de route dédiée par
 * niveau) : `selectedFamily`/`selectedGambit` sont de simples états React,
 * jamais persistés — un aller-retour vers `/pieges` repart toujours du
 * NIVEAU 1, ce qui est le comportement voulu (voir aussi `PiegeDrillScreen`,
 * qui ramène ici via `onExit`).
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OpeningTrap, TrapDifficulty } from "@/core/curriculum/traps";
import { DIFFICULTY_LABEL, DIFFICULTY_ORDER } from "@/core/curriculum/traps";
import { familyIcon } from "./trap-family-icon";
import { getSolvedTrapIds } from "./trap-progress";

/** Couleur de pastille NIVEAU 3 — réutilise les jetons `--quality-*` de `classify.ts` (best/inaccuracy/blunder), même parti pris que l'ex-`TrapCard`. */
const DIFFICULTY_TILE_CLASS: Record<TrapDifficulty, string> = {
  beginner: "border-best/50 bg-best/10 text-best hover:bg-best/20",
  intermediate: "border-inaccuracy/50 bg-inaccuracy/10 text-inaccuracy hover:bg-inaccuracy/20",
  expert: "border-blunder/50 bg-blunder/10 text-blunder hover:bg-blunder/20",
};
const DIFFICULTY_DOT: Record<TrapDifficulty, string> = { beginner: "🟢", intermediate: "🟡", expert: "🔴" };

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
  const [selectedGambit, setSelectedGambit] = useState<string | null>(null);
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

  const activeSeriesTraps = useMemo(() => {
    if (selectedGambit === null) return [];
    const group = gambitGroups.find(([gambit]) => gambit === selectedGambit);
    return group ? sortByDifficulty(group[1]) : [];
  }, [gambitGroups, selectedGambit]);

  function goToFamilies() {
    setSelectedFamily(null);
    setSelectedGambit(null);
  }
  function goToSeries() {
    setSelectedGambit(null);
  }

  // ──────────────────────────────────────────────────────────────────────
  // NIVEAU 3 — pastilles numériques d'une série de gambit.
  // ──────────────────────────────────────────────────────────────────────
  if (selectedFamily !== null && selectedGambit !== null) {
    const solvedCount = activeSeriesTraps.filter((trap) => solvedIds.has(trap.id)).length;
    return (
      <div className="space-y-6">
        <div>
          <BackButton onClick={goToSeries}>← Retour aux séries</BackButton>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">
            {familyIcon(selectedFamily)} {selectedFamily} <span className="text-foreground-muted">· {selectedGambit}</span>
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {solvedCount} / {activeSeriesTraps.length} résolus
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {activeSeriesTraps.map((trap, index) => {
            const solved = solvedIds.has(trap.id);
            return (
              <Link
                key={trap.id}
                href={`/pieges/${trap.id}`}
                title={trap.name}
                className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border-2 text-lg font-bold transition-transform hover:scale-105 ${DIFFICULTY_TILE_CLASS[trap.difficulty]} ${
                  solved ? "ring-2 ring-best ring-offset-2 ring-offset-surface" : ""
                }`}
              >
                {solved && (
                  <span aria-hidden="true" className="absolute right-1 top-1 text-xs">
                    ✅
                  </span>
                )}
                <span>{index + 1}</span>
                <span aria-hidden="true" className="text-xs leading-none">
                  {DIFFICULTY_DOT[trap.difficulty]}
                </span>
              </Link>
            );
          })}
        </div>

        <p className="text-[11px] text-foreground-muted">
          Niveaux : {DIFFICULTY_ORDER.map((level) => `${DIFFICULTY_DOT[level]} ${DIFFICULTY_LABEL[level]}`).join(" → ")}
        </p>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // NIVEAU 2 — séries de gambits d'une ouverture.
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
            const solvedCount = gambitTraps.filter((trap) => solvedIds.has(trap.id)).length;
            const percent = Math.round((solvedCount / gambitTraps.length) * 100);
            return (
              <button
                key={gambit}
                type="button"
                onClick={() => setSelectedGambit(gambit)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-accent/40"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-foreground">{gambit}</h3>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    {solvedCount} / {gambitTraps.length} résolus
                  </p>
                </div>
                <ProgressRing percent={percent} />
              </button>
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
