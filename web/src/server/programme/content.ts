import "server-only";

import phase1 from "@/core/programme/content/phase-1.json";
import phase2 from "@/core/programme/content/phase-2.json";
import phase3 from "@/core/programme/content/phase-3.json";
import phase4 from "@/core/programme/content/phase-4.json";
import phase5 from "@/core/programme/content/phase-5.json";
import type { ProgrammeDay, ProgrammePhaseContent } from "@/core/programme/types";

/**
 * Contenu du programme disponible : les phases déjà générées par
 * `scripts/programme/generate-phase.mts`. Une phase absente d'ici n'existe pas
 * encore pour l'écran (il l'annonce, sans inventer de contenu).
 */
const PHASES: readonly ProgrammePhaseContent[] = [phase1, phase2, phase3, phase4, phase5].map((p) => p as unknown as ProgrammePhaseContent);

export const ALL_DAYS: readonly ProgrammeDay[] = PHASES.flatMap((p) => p.jours);

export function findDay(semaine: number, jour: number): ProgrammeDay | null {
  return ALL_DAYS.find((d) => d.semaine === semaine && d.jour === jour) ?? null;
}
