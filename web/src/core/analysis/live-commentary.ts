/**
 * Flux de commentaires « Grand Maître » coup par coup (cahier des charges
 * §12a) — un "Live Broadcast" qui commente LES DEUX camps, contrairement à
 * `coach-narrative.ts#buildCoachMessage` qui reste volontairement sélectif
 * (`null` pour un coup adverse ou un coup sain du joueur, voir son
 * docstring) : cette sélectivité est le bon comportement pour la bulle 🎓
 * actionnable, mais pas pour un flux qui doit avancer coup après coup sans
 * jamais rester silencieux.
 *
 * `buildLiveCommentaryLine` ne retourne donc JAMAIS `null` :
 *  - un coup au tag notable (déviation/brillant/critique/mat manqué/gaffe/
 *    imprécision) réutilise directement le texte de `buildCoachMessage`
 *    (aucune duplication de logique), sans son filtre `byPlayer` ;
 *  - sinon (coup sain, des deux côtés), retombe sur `classifyMoveFx`
 *    (`move-fx.ts`, déjà pur) pour une phrase courte variée par catégorie de
 *    forme (roque/capture/développement/neutre) — plusieurs formulations par
 *    catégorie, choisies par un index dérivé du `ply` pour rester
 *    déterministe (aucun `Math.random`, cohérent avec le reste du repo :
 *    aucun test flaky).
 */
import { buildCoachMessage, type DeviationHint } from "./coach-narrative";
import { classifyMoveFx, type MoveFxKind } from "./move-fx";
import type { TimelinePly } from "./timeline";

export interface LiveCommentaryLine {
  ply: number;
  side: "w" | "b";
  text: string;
}

const NEUTRAL_FALLBACK: readonly ((san: string) => string)[] = [
  (san) => `${san}, sans rien bousculer dans la position.`,
  (san) => `${san} — un coup tranquille, la lutte continue.`,
];

/**
 * Formulations tournantes par catégorie de forme (§12a) — voir le docstring
 * du fichier pour le choix déterministe de l'index. `brilliant`/`critical`/
 * `blunder` n'arrivent JAMAIS jusqu'ici en pratique (`buildCoachMessage`
 * répond toujours pour ces qualités, voir `buildLiveCommentaryLine`) : couvertes
 * quand même, pour un `Record` total plutôt qu'un repli au runtime.
 */
const SHAPE_TEMPLATES: Record<MoveFxKind, readonly ((san: string) => string)[]> = {
  brilliant: NEUTRAL_FALLBACK,
  critical: NEUTRAL_FALLBACK,
  blunder: NEUTRAL_FALLBACK,
  excellent: [
    (san) => `${san} — précisément le coup que jouerait le moteur ici.`,
    (san) => `${san}, exécution nette : le meilleur choix disponible dans cette position.`,
  ],
  castle: [
    (san) => `${san} — le Roi se met à l'abri, la tour entre en jeu.`,
    (san) => `Roque (${san}) : la sécurité avant tout, un classique bien exécuté.`,
  ],
  capture: [
    (san) => `${san} rééquilibre le matériel sur l'échiquier.`,
    (san) => `Échange avec ${san} — simplification, chacun compte ses pions.`,
  ],
  development: [
    (san) => `${san} — développement naturel, une pièce de plus entre en jeu.`,
    (san) => `${san} sort la pièce de sa case de départ, gagne en activité.`,
  ],
  neutral: NEUTRAL_FALLBACK,
};

const PLAYER_LABEL: Record<"w" | "b", string> = { w: "Les Blancs", b: "Les Noirs" };

function shapeLine(entry: TimelinePly): string {
  const templates = SHAPE_TEMPLATES[classifyMoveFx(entry)];
  const template = templates[entry.ply % templates.length];
  return `${PLAYER_LABEL[entry.side]} jouent ${template(entry.san)}`;
}

/**
 * Une ligne de commentaire pour CE demi-coup — jamais `null` (voir le
 * docstring du fichier). `deviation` : même signal que `buildCoachMessage`,
 * pour annoncer une sortie de répertoire dans le flux aussi.
 */
export function buildLiveCommentaryLine(entry: TimelinePly, deviation: DeviationHint | null = null): LiveCommentaryLine {
  // `buildCoachMessage` filtre sur `byPlayer` en interne — on le contourne en
  // se faisant passer pour "le joueur" le temps de l'appel : sa classification
  // (quality/mateMissed/deviation) ne dépend jamais de `byPlayer` lui-même,
  // seul son garde-fou d'entrée le fait.
  const asPlayerEntry: TimelinePly = entry.analysis ? { ...entry, analysis: { ...entry.analysis, byPlayer: true } } : entry;
  const notable = buildCoachMessage(asPlayerEntry, deviation);

  const text = notable ? `${PLAYER_LABEL[entry.side]} : ${notable.text}` : shapeLine(entry);
  return { ply: entry.ply, side: entry.side, text };
}

/** Le flux entier jusqu'à `uptoPly` inclus (Revue de partie : n'avance qu'avec la navigation, jamais toute la partie d'un coup). */
export function buildLiveCommentaryFeed(
  timeline: readonly TimelinePly[],
  uptoPly: number,
  deviation: DeviationHint | null = null,
): LiveCommentaryLine[] {
  return timeline.slice(0, uptoPly).map((entry) => buildLiveCommentaryLine(entry, deviation));
}
