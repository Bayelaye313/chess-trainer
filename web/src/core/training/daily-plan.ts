/**
 * Plan du jour « appliqué » — le contrat entre la carte « Séance du jour » et
 * l'arène des bots (page d'accueil).
 *
 * Trois responsabilités, toutes pures (aucune dépendance à la base ni à
 * chess.js) :
 *  1. la CHARGE d'un plan : chaque objectif pèse un nombre fixe de points
 *     d'effort (`GOAL_EFFORT_POINTS`, total 100), un plan sous
 *     `OPTIMAL_EFFORT_THRESHOLD` est « léger » ;
 *  2. la SESSION figée au clic sur « Appliquer » (`DailySession`), persistée
 *     dans `settings` (`server/queries/daily-plan.ts`) et valable uniquement
 *     le jour UTC où elle a été appliquée — même découpage que
 *     `startOfUtcDay` côté recommandations ;
 *  3. les LIGNES DE DÉPART du bot (`BotStartLine`) : quand « Ouvertures » ou
 *     « Pièges » sont au plan, la prochaine partie démarre sur une ligne du
 *     répertoire (`OPENINGS` restreint aux cours `op-*.ts`) ou à la position
 *     critique d'un piège de ces mêmes familles — jamais une position
 *     inventée.
 */
import { GOAL_ENTITY_TYPE, TRAINING_GOALS, isTrainingGoal, type TrainingGoal } from "./preferences";
import { startOfUtcDay } from "./priority";

export const GOAL_EFFORT_POINTS: Record<TrainingGoal, number> = {
  tactics: 35,
  openings: 25,
  traps: 25,
  review: 15,
};

export const MAX_EFFORT_POINTS = TRAINING_GOALS.reduce((sum, goal) => sum + GOAL_EFFORT_POINTS[goal], 0);

/** En dessous : plan « léger » (orange) ; à partir de : plan optimal (vert). */
export const OPTIMAL_EFFORT_THRESHOLD = 60;

export type EffortLevel = "light" | "optimal";

export interface DailyEffort {
  points: number;
  /** Part de `MAX_EFFORT_POINTS`, arrondie, bornée à [0, 100] — largeur de la barre. */
  percent: number;
  level: EffortLevel;
}

export function computeDailyEffort(goals: readonly TrainingGoal[]): DailyEffort {
  const points = [...new Set(goals)].reduce((sum, goal) => sum + GOAL_EFFORT_POINTS[goal], 0);
  return {
    points,
    percent: Math.min(100, Math.max(0, Math.round((points / MAX_EFFORT_POINTS) * 100))),
    level: points >= OPTIMAL_EFFORT_THRESHOLD ? "optimal" : "light",
  };
}

/** Clé de jour UTC `YYYY-MM-DD` — la même frontière que `startOfUtcDay`. */
export function utcDayKey(now: Date): string {
  return startOfUtcDay(now).toISOString().slice(0, 10);
}

export interface DailySession {
  /** Jour UTC d'application — une session d'hier n'est plus active. */
  day: string;
  goals: TrainingGoal[];
  /** Charge figée au clic sur « Appliquer ». */
  effortPoints: number;
  /** ISO 8601 — borne basse des événements comptés pour la complétion. */
  appliedAt: string;
}

export function createDailySession(goals: readonly TrainingGoal[], now: Date): DailySession {
  const unique = TRAINING_GOALS.filter((goal) => goals.includes(goal));
  return {
    day: utcDayKey(now),
    goals: unique,
    effortPoints: computeDailyEffort(unique).points,
    appliedAt: now.toISOString(),
  };
}

/**
 * Contrat défensif, même esprit que `normalizeTrainingPreferences` : JSON
 * corrompu, session d'un autre jour ou sans objectif → `null` (aucune session
 * active), jamais un crash de la page d'accueil.
 */
export function normalizeDailySession(raw: unknown, now: Date): DailySession | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Partial<Record<keyof DailySession, unknown>>;
  if (record.day !== utcDayKey(now)) return null;
  if (typeof record.appliedAt !== "string" || Number.isNaN(Date.parse(record.appliedAt))) return null;
  if (!Array.isArray(record.goals)) return null;
  const goals = TRAINING_GOALS.filter((goal) => (record.goals as unknown[]).some((item) => isTrainingGoal(item) && item === goal));
  if (goals.length === 0) return null;
  return {
    day: record.day,
    goals,
    // Recalculée plutôt que lue : un poids modifié dans le code ne laisse
    // jamais une charge persistée incohérente avec la barre affichée.
    effortPoints: computeDailyEffort(goals).points,
    appliedAt: record.appliedAt,
  };
}

export type TrainingEventKindForPlan = (typeof GOAL_ENTITY_TYPE)[TrainingGoal];

export interface DailyCompletion {
  completedGoals: TrainingGoal[];
  completedPoints: number;
  /** Part de la charge figée effectivement réalisée, [0, 100]. */
  percent: number;
}

/**
 * Un objectif est « fait » dès qu'au moins un événement d'entraînement de son
 * type (`GOAL_ENTITY_TYPE`) a été enregistré depuis l'application du plan —
 * les mêmes `training_events` qui ferment les cartes de recommandation.
 */
export function computeDailyCompletion(
  session: DailySession,
  eventKinds: Iterable<string>,
): DailyCompletion {
  const kinds = new Set(eventKinds);
  const completedGoals = session.goals.filter((goal) => kinds.has(GOAL_ENTITY_TYPE[goal]));
  const completedPoints = computeDailyEffort(completedGoals).points;
  return {
    completedGoals,
    completedPoints,
    percent: session.effortPoints === 0 ? 0 : Math.round((completedPoints / session.effortPoints) * 100),
  };
}

export type BotStartSide = "white" | "black";

export interface BotStartLine {
  kind: "opening" | "trap";
  /** `OpeningLine.id` ou `OpeningTrap.id`. */
  sourceId: string;
  label: string;
  /** Le camp que tient l'UTILISATEUR sur cette ligne. */
  side: BotStartSide;
  /** Coups SAN depuis la position initiale, rejoués avant de rendre la main. */
  moves: readonly string[];
}

export interface RepertoireOpening {
  id: string;
  name: string;
  side: BotStartSide;
  moves: readonly string[];
}

export interface RepertoireTrap {
  id: string;
  name: string;
  family: string;
  victimSide: BotStartSide;
  setupMoves: readonly string[];
}

/** Rattache un piège à une ouverture du répertoire par son nom de famille (« Partie Écossaise », « Défense Caro-Kann »…). */
function trapBelongsTo(trap: RepertoireTrap, openings: readonly RepertoireOpening[]): RepertoireOpening | null {
  const family = trap.family.toLocaleLowerCase("fr");
  return openings.find((opening) => opening.name.toLocaleLowerCase("fr").startsWith(family)) ?? null;
}

/**
 * Lignes que le bot peut imposer pour un plan donné. Rien sans « Ouvertures »
 * ni « Pièges » : la partie part alors de la position initiale, comme avant.
 * Un piège n'est retenu que si l'utilisateur y tient le camp de la VICTIME
 * avec l'ouverture correspondante de son répertoire (c'est le bot qui tend
 * le piège, l'utilisateur qui doit l'éviter).
 */
export function buildBotStartLines(
  goals: readonly TrainingGoal[],
  openings: readonly RepertoireOpening[],
  traps: readonly RepertoireTrap[],
): BotStartLine[] {
  const lines: BotStartLine[] = [];
  if (goals.includes("openings")) {
    for (const opening of openings) {
      lines.push({ kind: "opening", sourceId: opening.id, label: opening.name, side: opening.side, moves: opening.moves });
    }
  }
  if (goals.includes("traps")) {
    for (const trap of traps) {
      const opening = trapBelongsTo(trap, openings);
      if (!opening || opening.side !== trap.victimSide) continue;
      lines.push({ kind: "trap", sourceId: trap.id, label: trap.name, side: trap.victimSide, moves: trap.setupMoves });
    }
  }
  return lines;
}

/** Tirage d'une ligne jouable avec la couleur choisie — `null` : départ classique. */
export function pickBotStartLine(
  lines: readonly BotStartLine[],
  color: "w" | "b",
  random: () => number = Math.random,
): BotStartLine | null {
  const side: BotStartSide = color === "w" ? "white" : "black";
  const candidates = lines.filter((line) => line.side === side);
  if (candidates.length === 0) return null;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[index];
}
