"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleCheck, Shield } from "lucide-react";
import type { OpeningTrap } from "@/core/curriculum/traps";
import { DIFFICULTY_ORDER } from "@/core/curriculum/traps";
import { ButtonLink } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { displayOpeningName } from "./opening-display";
import { getSolvedTrapIds } from "./trap-progress";

/** Regroupe en conservant l'ordre de première apparition. */
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

function sortByDifficulty(traps: readonly OpeningTrap[]): OpeningTrap[] {
  return [...traps].sort((a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty));
}

function Progress({ solved, total }: { solved: number; total: number }) {
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <span className="flex w-28 shrink-0 flex-col items-end gap-1">
      <span className="font-mono text-xs text-foreground-muted">
        {solved}/{total} {solved === total && total > 0 ? "maîtrisés" : "résolus"}
      </span>
      <span aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
        <span className="block h-full rounded-full bg-best" style={{ width: `${percent}%` }} />
      </span>
    </span>
  );
}

function FamilyRow({ family, traps, solvedIds, onOpen }: { family: string; traps: OpeningTrap[]; solvedIds: ReadonlySet<string>; onOpen: () => void }) {
  const solved = traps.filter((trap) => solvedIds.has(trap.id)).length;
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-muted">
        {solved === traps.length ? (
          <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-success" />
        ) : (
          <Shield aria-hidden="true" className="size-5 shrink-0 text-foreground-subtle" />
        )}
        <span className="min-w-0 flex-1 truncate font-medium">{displayOpeningName(family)}</span>
        <Progress solved={solved} total={traps.length} />
      </button>
    </li>
  );
}

/**
 * Pièges d'ouverture, 3 niveaux : famille → série (gambit) → piège
 * (`/pieges/<id>`). « Mon répertoire » d'abord (familles qui correspondent
 * aux ouvertures de ton répertoire), les autres familles repliées.
 */
export function PiegesScreen({ traps, repertoireFamilies = [] }: { traps: readonly OpeningTrap[]; repertoireFamilies?: readonly string[] }) {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [solvedIds, setSolvedIds] = useState<ReadonlySet<string>>(() => new Set());
  // Progression en localStorage : lue après montage (absente au rendu serveur).
  useEffect(() => {
    const timer = setTimeout(() => setSolvedIds(getSolvedTrapIds()), 0);
    return () => clearTimeout(timer);
  }, []);

  const familyGroups = useMemo(() => groupByKey(traps, (trap) => trap.family), [traps]);
  const inRepertoire = new Set(repertoireFamilies);
  const mine = familyGroups.filter(([family]) => inRepertoire.has(family));
  const others = familyGroups.filter(([family]) => !inRepertoire.has(family));
  const nextTrap = (mine.length > 0 ? mine : familyGroups).flatMap(([, list]) => sortByDifficulty(list)).find((trap) => !solvedIds.has(trap.id));

  const gambitGroups = useMemo(() => {
    if (selectedFamily === null) return [];
    return groupByKey(
      traps.filter((trap) => trap.family === selectedFamily),
      (trap) => trap.gambit,
    );
  }, [traps, selectedFamily]);

  if (selectedFamily !== null) {
    return (
      <div>
        <PageHeader
          back={
            <button type="button" onClick={() => setSelectedFamily(null)} className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-foreground-muted hover:text-foreground">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Pièges
            </button>
          }
          title={displayOpeningName(selectedFamily)}
          description="Chaque série s'enchaîne du piège le plus simple au plus difficile."
        />
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {gambitGroups.map(([gambit, gambitTraps]) => {
            const sorted = sortByDifficulty(gambitTraps);
            const solved = sorted.filter((trap) => solvedIds.has(trap.id)).length;
            const first = sorted.find((trap) => !solvedIds.has(trap.id)) ?? sorted[0];
            return (
              <li key={gambit}>
                <Link href={`/pieges/${first.id}`} className="flex min-h-14 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted">
                  <span className="min-w-0 flex-1 truncate font-medium">{gambit}</span>
                  <Progress solved={solved} total={sorted.length} />
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-foreground-subtle" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pièges"
        description={`${traps.length} pièges d'ouverture : l'ordinateur amène la position, à toi de trouver la réfutation.`}
        action={
          nextTrap && (
            <ButtonLink href={`/pieges/${nextTrap.id}`} variant="primary" data-primary-action className="w-full sm:w-auto">
              Continuer : {displayOpeningName(nextTrap.family)}
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          )
        }
      />

      {familyGroups.length === 0 ? (
        <EmptyState icon={Shield} title="Aucun piège disponible pour l'instant." />
      ) : (
        <>
          <section aria-labelledby="pieges-repertoire" className="mb-6">
            <SectionTitle id="pieges-repertoire">Mon répertoire</SectionTitle>
            {mine.length === 0 ? (
              <EmptyState title="Aucune famille de pièges ne correspond à ton répertoire.">Toutes les familles sont dans « Autres ouvertures ».</EmptyState>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
                {mine.map(([family, list]) => (
                  <FamilyRow key={family} family={family} traps={list} solvedIds={solvedIds} onOpen={() => setSelectedFamily(family)} />
                ))}
              </ul>
            )}
          </section>
          {others.length > 0 && (
            <Disclosure summary="Autres ouvertures" meta={`${others.length} familles`} className="border-b">
              <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
                {others.map(([family, list]) => (
                  <FamilyRow key={family} family={family} traps={list} solvedIds={solvedIds} onOpen={() => setSelectedFamily(family)} />
                ))}
              </ul>
            </Disclosure>
          )}
        </>
      )}
    </div>
  );
}
