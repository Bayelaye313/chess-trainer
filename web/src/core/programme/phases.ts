import type { PhaseId, PlanningBlock } from "./types";

/**
 * Les cinq phases du Programme 1000 Heures : 36 semaines × 7 jours × 4 h
 * = 1008 h (7 + 7 + 8 + 7 + 7 semaines ; calcul dans `docs/programme/`). Les semaines sont numérotées sur TOUT le programme (la Phase 2
 * commence en semaine 8), ce qui garde `S<n>J<m>` unique.
 *
 * `soloMoves` borne le nombre de coups DU SOLVEUR par combinaison (la colonne
 * NbMoves du dump Lichess compte aussi les réponses adverses et le coup
 * d'installation) : il croît avec la phase, comme l'exige le cahier des
 * charges.
 */
export interface PhaseDefinition {
  id: PhaseId;
  index: number;
  titre: string;
  eloDebut: number;
  eloFin: number;
  semaineDebut: number;
  semaineFin: number;
  soloMoves: { min: number; max: number };
  /** Secondes d'affichage de la position du blindfold, début → fin de phase. */
  blindfoldSeconds: { debut: number; fin: number };
}

export const PHASES: readonly PhaseDefinition[] = [
  { id: "1500-1700", index: 1, titre: "Fondamentaux structurels", eloDebut: 1500, eloFin: 1700, semaineDebut: 1, semaineFin: 7, soloMoves: { min: 1, max: 3 }, blindfoldSeconds: { debut: 30, fin: 20 } },
  { id: "1700-1900", index: 2, titre: "Tactique avancée, finales techniques", eloDebut: 1700, eloFin: 1900, semaineDebut: 8, semaineFin: 14, soloMoves: { min: 2, max: 4 }, blindfoldSeconds: { debut: 20, fin: 15 } },
  { id: "1900-2100", index: 3, titre: "Stratégie profonde, structures et plans", eloDebut: 1900, eloFin: 2100, semaineDebut: 15, semaineFin: 22, soloMoves: { min: 2, max: 5 }, blindfoldSeconds: { debut: 15, fin: 12 } },
  { id: "2100-2250", index: 4, titre: "Calcul long, finales complexes", eloDebut: 2100, eloFin: 2250, semaineDebut: 23, semaineFin: 29, soloMoves: { min: 3, max: 6 }, blindfoldSeconds: { debut: 12, fin: 10 } },
  { id: "2250-2400", index: 5, titre: "Perfectionnement, décisions de compétition", eloDebut: 2250, eloFin: 2400, semaineDebut: 30, semaineFin: 36, soloMoves: { min: 3, max: 7 }, blindfoldSeconds: { debut: 10, fin: 8 } },
];

export const TOTAL_WEEKS = 36;
export const DAYS_PER_WEEK = 7;
export const MINUTES_PER_DAY = 240;

export function getPhase(id: PhaseId): PhaseDefinition {
  const phase = PHASES.find((p) => p.id === id);
  if (!phase) throw new Error(`Phase inconnue : ${id}`);
  return phase;
}

export function phaseOfWeek(semaine: number): PhaseDefinition {
  const phase = PHASES.find((p) => semaine >= p.semaineDebut && semaine <= p.semaineFin);
  if (!phase) throw new Error(`Semaine hors programme : ${semaine}`);
  return phase;
}

/** Progression linéaire de 0 (1er jour de la phase) à 1 (dernier jour). */
function progressInPhase(phase: PhaseDefinition, semaine: number, jour: number): number {
  const totalDays = (phase.semaineFin - phase.semaineDebut + 1) * DAYS_PER_WEEK;
  const dayIndex = (semaine - phase.semaineDebut) * DAYS_PER_WEEK + (jour - 1);
  return totalDays <= 1 ? 1 : dayIndex / (totalDays - 1);
}

/** Elo cible du jour, arrondi à 10 : centre de la fenêtre de rating par défaut (±100). */
export function targetElo(semaine: number, jour: number): number {
  const phase = phaseOfWeek(semaine);
  const t = progressInPhase(phase, semaine, jour);
  return Math.round((phase.eloDebut + t * (phase.eloFin - phase.eloDebut)) / 10) * 10;
}

/** Nombre maximal de coups du solveur ce jour-là : croît linéairement dans la phase. */
export function maxSolverMoves(semaine: number, jour: number): number {
  const phase = phaseOfWeek(semaine);
  const t = progressInPhase(phase, semaine, jour);
  return Math.max(phase.soloMoves.min + 1, Math.round(phase.soloMoves.min + t * (phase.soloMoves.max - phase.soloMoves.min)));
}

export function blindfoldSeconds(semaine: number, jour: number): number {
  const phase = phaseOfWeek(semaine);
  const t = progressInPhase(phase, semaine, jour);
  return Math.round(phase.blindfoldSeconds.debut + t * (phase.blindfoldSeconds.fin - phase.blindfoldSeconds.debut));
}

/**
 * Planning type d'un jour de concept (jours 1 à 6) — 240 min.
 *
 * Règle SMR : tout bloc de calcul intense de 25 min ou plus est suivi d'une
 * micro-pause de 5 à 10 min (consolidation courte, yeux fermés, aucun écran) —
 * vérifié par `programme-content.test.ts`.
 */
export function conceptDayPlanning(concept: string, partie: string): PlanningBlock[] {
  return [
    { bloc: "A", duree_min: 40, type: "cours", contenu: `Cours palais de mémoire : ${concept}. Lire, puis fermer les yeux et parcourir le lieu deux fois.` },
    { bloc: "B", duree_min: 15, type: "hack_visuel", contenu: "Échauffement sous hack visuel : 2 puzzles de rappel tirés des jours précédents (thèmes alternés)." },
    { bloc: "C", duree_min: 30, type: "puzzles", contenu: "Puzzles 1 à 3 : désigner le squelette du pattern, PUIS résoudre." },
    { bloc: "SMR-1", duree_min: 8, type: "pause", contenu: "Micro-pause de consolidation : yeux fermés, respiration lente, aucun écran. Ce n'est pas une sieste." },
    { bloc: "D", duree_min: 30, type: "puzzles", contenu: "Puzzles 4 à 6 : même protocole, sans indice." },
    { bloc: "SMR-2", duree_min: 8, type: "pause", contenu: "Micro-pause de consolidation : marcher, regard au loin." },
    { bloc: "E", duree_min: 20, type: "blindfold", contenu: "Cécité partielle : la position s'affiche une fois puis disparaît. Calcul mental pur." },
    { bloc: "SMR-3", duree_min: 6, type: "pause", contenu: "Micro-pause de consolidation : rappeler mentalement la position du blindfold, sans la revoir." },
    { bloc: "F", duree_min: 45, type: "partie", contenu: partie },
    { bloc: "SMR-4", duree_min: 8, type: "pause", contenu: "Micro-pause de consolidation avant la reconsolidation active." },
    { bloc: "G", duree_min: 20, type: "reconsolidation", contenu: "Reconsolidation active (jamais de relecture passive)." },
    { bloc: "H", duree_min: 10, type: "analyse", contenu: "Checklist et bilan : noter le taux de réussite squelette + solution." },
  ];
}

/** Planning du jour 7 : test de rétention, révision entrelacée, partie longue — 240 min. */
export function retentionDayPlanning(partie: string): PlanningBlock[] {
  return [
    { bloc: "A", duree_min: 40, type: "reconsolidation", contenu: "Test de rétention : rejouer, sans aide, des puzzles d'il y a une semaine. Il conditionne le passage à la semaine suivante." },
    { bloc: "SMR-1", duree_min: 8, type: "pause", contenu: "Micro-pause de consolidation." },
    { bloc: "B", duree_min: 30, type: "cours", contenu: "Visite du palais : réciter de mémoire chaque lieu de la semaine, dans l'ordre, puis à l'envers." },
    { bloc: "C", duree_min: 30, type: "puzzles", contenu: "Puzzles entrelacés : les thèmes de la semaine et des semaines précédentes, mélangés (interférence contextuelle)." },
    { bloc: "SMR-2", duree_min: 8, type: "pause", contenu: "Micro-pause de consolidation." },
    { bloc: "D", duree_min: 25, type: "blindfold", contenu: "Cécité partielle : une position de la semaine, affichée une fois." },
    { bloc: "SMR-3", duree_min: 7, type: "pause", contenu: "Micro-pause de consolidation." },
    { bloc: "E", duree_min: 60, type: "partie", contenu: partie },
    { bloc: "SMR-4", duree_min: 8, type: "pause", contenu: "Micro-pause de consolidation." },
    { bloc: "F", duree_min: 24, type: "analyse", contenu: "Bilan de semaine : quels lieux du palais se sont présentés dans la partie ?" },
  ];
}
