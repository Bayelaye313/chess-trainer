/**
 * Logique pure de l'écran d'historique d'endurance (`opening-endurance-history.tsx`) :
 * le joueur repousse-t-il sa PREMIÈRE gaffe de plus en plus tard, session
 * « Sans Guide » après session ?
 *
 * Isolé du rendu pour être testé sans DOM (`opening-endurance-history.test.ts`).
 * Les seuils de couleur ne sont PAS redéfinis ici : ils viennent de
 * `readEndurance` (`opening-stats.ts`), pour que la Zone Stats d'une ouverture
 * et cet historique classent un même coup de la même façon.
 *
 * Ply contre coup : toutes les données sont en PLY (1 = premier coup blanc) ;
 * tout ce qui est affiché est converti en numéro de COUP (`plyToMoveNumber`).
 */
import type { OpeningSessionHistory } from "@/core/curriculum/opening-endurance";
import { plyToMoveNumber, readEndurance, type EnduranceTier } from "./opening-stats";

// Type partagé avec le serveur (`server/queries/opening-endurance.ts`) : il vit dans `core/`.
export type { OpeningSessionHistory };

/** Nombre de sessions de la moyenne glissante. */
export const ROLLING_WINDOW = 10;
/** Nombre de sessions racontées dans la chronologie. */
export const TIMELINE_LENGTH = 8;

/** Dernier ply joué SANS erreur dans une session. */
export function cleanPlyOf(session: OpeningSessionHistory): number {
  return session.firstMistakePly === null ? session.lastPly : Math.max(session.firstMistakePly - 1, 0);
}

/** Plus récente d'abord ; tri stable sur l'id pour un rendu identique serveur/client. */
export function sortRecentFirst(sessions: readonly OpeningSessionHistory[]): OpeningSessionHistory[] {
  return [...sessions].sort((a, b) => b.playedAt.localeCompare(a.playedAt) || a.sessionId.localeCompare(b.sessionId));
}

export interface EnduranceStatus {
  /** Coup le plus tardif atteint sans erreur, toutes sessions confondues. */
  recordMove: number;
  /** Ouverture et date du record. */
  recordSession: OpeningSessionHistory;
  /** Moyenne glissante (en coups, 1 décimale) du dernier coup propre sur les `ROLLING_WINDOW` dernières sessions. */
  rollingMove: number;
  /** Nombre de sessions réellement prises dans la moyenne (< 10 au début). */
  rollingCount: number;
  /** Écart (en coups) entre la moyenne glissante et celle des 10 sessions précédentes, `null` sans historique suffisant. */
  trend: number | null;
  tier: EnduranceTier;
}

function averageCleanMove(sessions: readonly OpeningSessionHistory[]): number {
  const total = sessions.reduce((sum, s) => sum + cleanPlyOf(s), 0);
  return Math.round((total / sessions.length / 2) * 10) / 10;
}

/** Statut global, `null` sans aucune session. */
export function buildEnduranceStatus(sessions: readonly OpeningSessionHistory[]): EnduranceStatus | null {
  if (sessions.length === 0) return null;
  const recent = sortRecentFirst(sessions);
  const recordSession = recent.reduce((best, s) => (cleanPlyOf(s) > cleanPlyOf(best) ? s : best));
  const window = recent.slice(0, ROLLING_WINDOW);
  const previous = recent.slice(ROLLING_WINDOW, ROLLING_WINDOW * 2);
  const rollingMove = averageCleanMove(window);
  return {
    recordMove: plyToMoveNumber(cleanPlyOf(recordSession)),
    recordSession,
    rollingMove,
    rollingCount: window.length,
    trend: previous.length === 0 ? null : Math.round((rollingMove - averageCleanMove(previous)) * 10) / 10,
    // Même règle que la Zone Stats : la moyenne du coup propre lue comme un ply de première gaffe.
    tier: readEndurance(Math.round(rollingMove * 2) + 1).tier,
  };
}

/** « aujourd'hui », « hier », « il y a 3 jours », « il y a 2 semaines »... `now` est injecté : pas de `Date.now()` au rendu. */
export function relativeDay(iso: string, now: Date): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 14) return `il y a ${days} jours`;
  if (days < 60) return `il y a ${Math.floor(days / 7)} semaines`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

export type TimelineMood = "record" | "progres" | "recul" | "stable";

export interface TimelineEntry {
  session: OpeningSessionHistory;
  mood: TimelineMood;
  /** « Il y a 2 jours dans l'Alapine » */
  headline: string;
  /** Phrase narrative complète. */
  story: string;
}

/** Nom du profil coach (`coach-feedbacks.ts`) correspondant au coup de la première gaffe. */
function fatigueLabel(mistakeMove: number): string {
  if (mistakeMove <= 6) return "d'amnésie précoce";
  if (mistakeMove >= 12 && mistakeMove <= 15) return "de fatigue stratégique";
  return "d'endurance";
}

/**
 * Chronologie narrative, la plus récente d'abord. Le « record » est comparé
 * à TOUTES les sessions antérieures, pas seulement à celles affichées.
 */
export function buildTimeline(
  sessions: readonly OpeningSessionHistory[],
  now: Date,
  limit: number = TIMELINE_LENGTH,
): TimelineEntry[] {
  const chronological = sortRecentFirst(sessions).reverse();
  let bestSoFar: number | null = null;
  const lastByOpening = new Map<string, number>();
  const entries: TimelineEntry[] = [];

  for (const session of chronological) {
    const clean = cleanPlyOf(session);
    const cleanMove = plyToMoveNumber(clean);
    const previousInOpening = lastByOpening.get(session.openingId);
    const isRecord = bestSoFar !== null && clean > bestSoFar;
    const accuracy = Math.round(session.accuracy);

    let story =
      session.firstMistakePly === null
        ? `Ligne complète sans la moindre faute jusqu'au coup ${cleanMove}, à ${accuracy} % de précision.`
        : `Tu as tenu une précision de ${accuracy} % jusqu'au coup ${plyToMoveNumber(session.firstMistakePly)}, où tombe ta première gaffe`;
    if (session.firstMistakePly !== null) {
      story += isRecord
        ? `, brisant ton précédent record ${fatigueLabel(plyToMoveNumber(session.firstMistakePly))} (coup ${plyToMoveNumber(bestSoFar!)}).`
        : ".";
    } else if (isRecord) {
      story += ` Nouveau record personnel, l'ancien s'arrêtait au coup ${plyToMoveNumber(bestSoFar!)}.`;
    }

    let mood: TimelineMood = isRecord ? "record" : "stable";
    if (!isRecord && previousInOpening !== undefined) {
      const delta = cleanMove - plyToMoveNumber(previousInOpening);
      if (delta > 0) {
        mood = "progres";
        story += ` ${delta} coup${delta > 1 ? "s" : ""} de mieux que ta session précédente dans cette ouverture.`;
      } else if (delta < 0) {
        mood = "recul";
        story += ` C'est ${-delta} coup${delta < -1 ? "s" : ""} plus tôt que la dernière fois : la ligne mérite une révision.`;
      }
    }

    entries.push({
      session,
      mood,
      headline: `${capitalize(relativeDay(session.playedAt, now))} dans ${withArticle(session.openingName)}`,
      story,
    });
    bestSoFar = bestSoFar === null ? clean : Math.max(bestSoFar, clean);
    lastByOpening.set(session.openingId, clean);
  }
  return entries.reverse().slice(0, limit);
}

export interface OpeningEnduranceComparison {
  openingId: string;
  openingName: string;
  sessions: number;
  /** Coup moyen de la première gaffe sur les sessions qui en ont une, `null` si aucune. */
  avgMistakeMove: number | null;
  /** Meilleur coup atteint sans erreur dans cette ouverture. */
  bestCleanMove: number;
  avgAccuracy: number;
  tier: EnduranceTier;
  /** « Mur de briques », « Risque d'amnésie »... */
  verdict: string;
}

const VERDICT: Record<EnduranceTier, string> = {
  fragile: "Risque d'amnésie",
  moyen: "Transition fragile",
  solide: "Mur de briques",
  intact: "Mur de briques",
};

/** Une carte par ouverture, la plus fragile d'abord (c'est là qu'il faut travailler). */
export function compareOpenings(sessions: readonly OpeningSessionHistory[]): OpeningEnduranceComparison[] {
  const groups = new Map<string, OpeningSessionHistory[]>();
  for (const s of sessions) groups.set(s.openingId, [...(groups.get(s.openingId) ?? []), s]);

  const rows = [...groups.values()].map((group): OpeningEnduranceComparison => {
    const mistakes = group.flatMap((s) => (s.firstMistakePly === null ? [] : [s.firstMistakePly]));
    const avgMistakePly = mistakes.length === 0 ? null : mistakes.reduce((a, b) => a + b, 0) / mistakes.length;
    const tier = readEndurance(avgMistakePly === null ? null : Math.round(avgMistakePly)).tier;
    return {
      openingId: group[0].openingId,
      openingName: group[0].openingName,
      sessions: group.length,
      avgMistakeMove: avgMistakePly === null ? null : plyToMoveNumber(Math.round(avgMistakePly)),
      bestCleanMove: plyToMoveNumber(Math.max(...group.map(cleanPlyOf))),
      avgAccuracy: Math.round(group.reduce((sum, s) => sum + s.accuracy, 0) / group.length),
      tier,
      verdict: VERDICT[tier],
    };
  });
  const order = (r: OpeningEnduranceComparison) => r.avgMistakeMove ?? Number.POSITIVE_INFINITY;
  return rows.sort((a, b) => order(a) - order(b) || a.openingName.localeCompare(b.openingName));
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** « l'Alapine », « la Caro-Kann », « l'Est-Indienne » — élision devant voyelle. */
function withArticle(name: string): string {
  return /^[aeiouyhéèêàâîôûAEIOUYHÉÈÊÀÂÎÔÛ]/.test(name) ? `l'${name}` : `la ${name}`;
}
