"use client";

/** Petit pont client entre `app/pieges/[slug]/page.tsx` (serveur, résout le slug + la série) et `OpeningTrapDrill` : `onExit` doit naviguer vers `/pieges`, ce qu'un composant serveur ne peut pas faire lui-même. */
import { useRouter } from "next/navigation";
import type { OpeningTrap } from "@/core/curriculum/traps";
import { OpeningTrapDrill } from "./opening-trap-drill";

export function PiegeDrillScreen({ trap, seriesTraps }: { trap: OpeningTrap; seriesTraps: readonly OpeningTrap[] }) {
  const router = useRouter();
  return <OpeningTrapDrill trap={trap} seriesTraps={seriesTraps} onExit={() => router.push("/pieges")} />;
}
