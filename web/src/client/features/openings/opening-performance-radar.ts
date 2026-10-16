/**
 * Logique pure du radar de performance (`opening-performance-radar-view.tsx`),
 * en tête de l'onglet Ouvertures : trois piliers chiffrés, un diagnostic
 * rédigé et le hit-parade du répertoire, à partir des sessions « Sans Guide »
 * (`OpeningSessionHistory`, voir `core/curriculum/opening-endurance.ts`).
 *
 * Isolé du rendu pour être testé sans DOM (`opening-performance-radar.test.ts`).
 * Réutilise les briques de l'historique d'endurance (`cleanPlyOf`,
 * `compareOpenings`, `buildEnduranceStatus`) : un même historique donne les
 * mêmes chiffres sur les deux écrans.
 *
 * ## Ce que les données permettent de mesurer
 *
 * Une session ne stocke que le ply de la PREMIÈRE faute, le dernier ply
 * atteint et la précision globale — pas de précision coup par coup. Avant la
 * première faute, tous les coups sont par construction justes (le drill
 * refuse tout coup hors théorie). Les piliers sont donc définis sur ce qu'on
 * sait vraiment :
 *  - Discipline Théorique : part des `THEORY_WINDOW_PLY` premiers plies
 *    (coups 1 à 6) jouée sans faute, en moyenne sur les sessions récentes ;
 *  - Endurance Stratégique : moyenne glissante du dernier coup propre
 *    (`buildEnduranceStatus`), rapportée au coup `GAUGE_FULL_AT_MOVE` ;
 *  - Instinct de Punition : à la PREMIÈRE session Sans Guide de chaque
 *    variante nommée (une déviation adverse, jamais la ligne principale),
 *    part de la ligne jouée sans faute (`sessionSurvival`). Le mode
 *    Aléatoire/Surprise n'enregistre aucune session : il ne compte pas ici.
 */
import type { OpeningSessionHistory } from "@/core/curriculum/opening-endurance";
import { MAIN_LINE_VARIATION_KEY } from "@/core/curriculum/opening-variation-key";
import {
  ROLLING_WINDOW,
  buildEnduranceStatus,
  cleanPlyOf,
  compareOpenings,
  sessionSurvival,
  sortRecentFirst,
  type OpeningEnduranceComparison,
} from "./opening-endurance-history";
import { GAUGE_FULL_AT_MOVE, SOLID_AFTER_MOVE, plyToMoveNumber } from "./opening-stats";

/** Fenêtre de la Discipline Théorique : ply 12 = fin du coup 6. */
export const THEORY_WINDOW_PLY = 12;
/** Robustesse (0-100) à partir de laquelle une ouverture est une « forteresse ». */
export const FORTRESS_MIN_ROBUSTNESS = 75;
/** Nombre de cartes par bloc du hit-parade. */
export const HIT_PARADE_SIZE = 3;

export type PillarId = "discipline" | "endurance" | "punition";

/** `fort` ≥ 75, `moyen` ≥ 50, `faible` sinon. */
export type PillarLevel = "fort" | "moyen" | "faible";

export interface Pillar {
  id: PillarId;
  label: string;
  /** Score 0-100, `null` quand rien ne permet encore de le mesurer. */
  score: number | null;
  level: PillarLevel | null;
  /** Une phrase : ce que le chiffre veut dire, en clair. */
  detail: string;
  /** Repère tracé sur la barre (0-100), ex. le coup 12 de l'endurance. */
  marker?: { at: number; label: string };
  /** Nombre de sessions (ou de variantes) derrière le score. */
  sampleSize: number;
}

export interface OpeningPerformanceProfile {
  /** « Profil : … » — une phrase. */
  headline: string;
  /** Deux ou trois phrases de précision sous le titre. */
  details: string[];
  pillars: [Pillar, Pillar, Pillar];
  /** Ouvertures les plus robustes, la plus solide d'abord. */
  fortresses: OpeningEnduranceComparison[];
  /** Ouvertures fragiles, la plus critique d'abord (ordre de `compareOpenings`). */
  dangerZones: OpeningEnduranceComparison[];
  sessionCount: number;
}

export function levelOf(score: number): PillarLevel {
  return score >= 75 ? "fort" : score >= 50 ? "moyen" : "faible";
}

/** Part (0-1) des `THEORY_WINDOW_PLY` premiers plies jouée sans faute ; une ligne plus courte est jugée sur sa longueur. */
export function theoryDiscipline(session: OpeningSessionHistory): number {
  const window = Math.min(THEORY_WINDOW_PLY, Math.max(session.lastPly, 1));
  if (session.firstMistakePly === null || session.firstMistakePly > window) return 1;
  return Math.min(cleanPlyOf(session), window) / window;
}

/** Première session Sans Guide de chaque variante nommée (hors ligne principale), dans l'ordre chronologique. */
export function firstEncounters(sessions: readonly OpeningSessionHistory[]): OpeningSessionHistory[] {
  const seen = new Set<string>();
  const firsts: OpeningSessionHistory[] = [];
  for (const session of sortRecentFirst(sessions).reverse()) {
    if (session.variationKey === MAIN_LINE_VARIATION_KEY) continue;
    const key = `${session.openingId}::${session.variationKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    firsts.push(session);
  }
  return firsts;
}

const average = (values: readonly number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

function disciplinePillar(recent: readonly OpeningSessionHistory[]): Pillar {
  const score = Math.round(average(recent.map(theoryDiscipline)) * 100);
  const flawless = recent.filter((s) => theoryDiscipline(s) === 1).length;
  return {
    id: "discipline",
    label: "Discipline Théorique",
    score,
    level: levelOf(score),
    detail: `Coups 1 à 6 sans faute dans ${flawless} de tes ${plural(recent.length, "dernière session")}.`,
    sampleSize: recent.length,
  };
}

function endurancePillar(sessions: readonly OpeningSessionHistory[]): Pillar {
  const status = buildEnduranceStatus(sessions)!;
  const score = Math.round(Math.min(status.rollingMove / GAUGE_FULL_AT_MOVE, 1) * 100);
  const beyond = status.rollingMove > SOLID_AFTER_MOVE;
  return {
    id: "endurance",
    label: "Endurance Stratégique",
    score,
    level: levelOf(score),
    detail: `En moyenne, tu tiens sans faute jusqu'au coup ${status.rollingMove.toLocaleString("fr-FR")}${
      beyond ? ", au-delà du cap du coup 12." : ` : le cap du coup ${SOLID_AFTER_MOVE} reste à franchir.`
    }`,
    marker: { at: Math.round((SOLID_AFTER_MOVE / GAUGE_FULL_AT_MOVE) * 100), label: `Coup ${SOLID_AFTER_MOVE}` },
    sampleSize: status.rollingCount,
  };
}

function punitionPillar(sessions: readonly OpeningSessionHistory[]): Pillar {
  const firsts = firstEncounters(sessions);
  if (firsts.length === 0) {
    return {
      id: "punition",
      label: "Instinct de Punition",
      score: null,
      level: null,
      detail: "Joue une variante nommée en Sans Guide : ta réplique du premier coup sera mesurée ici.",
      sampleSize: 0,
    };
  }
  const score = Math.round(average(firsts.map(sessionSurvival)) * 100);
  const clean = firsts.filter((s) => s.firstMistakePly === null).length;
  return {
    id: "punition",
    label: "Instinct de Punition",
    score,
    level: levelOf(score),
    detail: `${clean} variante${clean > 1 ? "s" : ""} adverse${clean > 1 ? "s" : ""} sur ${firsts.length} jouée${
      clean > 1 ? "s" : ""
    } sans faute dès la première rencontre.`,
    sampleSize: firsts.length,
  };
}

/** Coup moyen (entier) de la première gaffe sur les sessions fautives, `null` si aucune. */
function averageMistakeMove(sessions: readonly OpeningSessionHistory[]): number | null {
  const mistakes = sessions.flatMap((s) => (s.firstMistakePly === null ? [] : [s.firstMistakePly]));
  return mistakes.length === 0 ? null : plyToMoveNumber(Math.round(average(mistakes)));
}

const DISCIPLINE_PHRASE: Record<PillarLevel, string> = {
  fort: "Réflexes d'ouverture solides",
  moyen: "Réflexes d'ouverture perfectibles",
  faible: "Premiers coups encore fragiles",
};

function enduranceClause(pillar: Pillar, mistakeMove: number | null): string {
  if (mistakeMove === null) return "aucune gaffe sur tes sessions récentes";
  if (pillar.level === "fort") return `tu tiens la théorie loin, première gaffe vers le coup ${mistakeMove} en moyenne`;
  return `sujet à l'essoufflement positionnel vers le coup ${mistakeMove}`;
}

const PUNITION_PHRASE: Record<PillarLevel, string> = {
  fort: "Excellent sens de la réplique face aux déviations adverses.",
  moyen: "Réplique correcte face aux déviations adverses, encore quelques trous.",
  faible: "Les déviations adverses te prennent encore de court.",
};

/** Profil complet, `null` sans aucune session (l'écran affiche alors un état vide). */
export function buildPerformanceProfile(sessions: readonly OpeningSessionHistory[]): OpeningPerformanceProfile | null {
  if (sessions.length === 0) return null;
  const recent = sortRecentFirst(sessions).slice(0, ROLLING_WINDOW);
  const pillars: [Pillar, Pillar, Pillar] = [disciplinePillar(recent), endurancePillar(sessions), punitionPillar(sessions)];
  const [discipline, endurance, punition] = pillars;

  const ranking = compareOpenings(sessions);
  const fortresses = ranking
    .filter((row) => row.robustness >= FORTRESS_MIN_ROBUSTNESS)
    .reverse()
    .slice(0, HIT_PARADE_SIZE);
  const dangerZones = ranking.filter((row) => row.robustness < FORTRESS_MIN_ROBUSTNESS).slice(0, HIT_PARADE_SIZE);

  // « Réflexes solides MAIS essoufflement » : la conjonction suit le contraste entre les deux piliers.
  const mistakeMove = averageMistakeMove(recent);
  const contrast = mistakeMove !== null && (discipline.level === "fort") !== (endurance.level === "fort");
  const headline = `Profil : ${DISCIPLINE_PHRASE[discipline.level!]}${contrast ? " mais " : ", "}${enduranceClause(
    endurance,
    mistakeMove,
  )}.`;

  const details: string[] = [];
  details.push(
    punition.level === null
      ? "Instinct de punition pas encore mesuré : aucune variante nommée jouée en Sans Guide."
      : PUNITION_PHRASE[punition.level],
  );
  if (fortresses[0]) {
    details.push(`Point d'appui : ${fortresses[0].openingName}, ${fortresses[0].robustness} % de la ligne tenue sans faute.`);
  }
  if (dangerZones[0]) {
    const worst = dangerZones[0];
    details.push(
      `Priorité de travail : ${worst.openingName}${
        worst.avgMistakeMove === null ? "" : `, première gaffe au coup ${worst.avgMistakeMove} en moyenne`
      }.`,
    );
  }

  return { headline, details, pillars, fortresses, dangerZones, sessionCount: sessions.length };
}
