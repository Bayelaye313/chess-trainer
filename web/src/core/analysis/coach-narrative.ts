/**
 * Le Coach Virtuel de la Revue de partie (`game-review-screen.tsx`) :
 * transforme un coup déjà analysé (`AnalysedPly`, `timeline.ts`) en phrase
 * humaine, sur le modèle « Humanized Coaching » de CLAUDE.md (« Left piece en
 * prise », jamais un simple delta de centipions).
 *
 * Pur (chess.js + les heuristiques bon marché déjà en place — `attacks.ts`,
 * `coach-hints.ts` — jamais un nouvel appel moteur) : la classification
 * `quality`/`motifs`/`mateMissed` vient toujours de `evaluate-move.ts` à
 * l'analyse, ce module ne fait que la METTRE EN MOTS, dans l'ordre de
 * priorité le plus parlant pour le joueur.
 *
 * Deux façades, deux usages distincts :
 *  - `buildCoachMessage` : la bulle 🎓 affichée pour le coup COURAMMENT montré
 *    à l'écran (`coach-bubble.tsx`).
 *  - `buildGameCoachFindings` : le bilan de fin de revue (`coach-report.tsx`)
 *    — une entrée par LACUNE DISTINCTE (motif manqué, mat manqué), jamais une
 *    par coup fautif ; scanne le timeline indépendamment de `buildCoachMessage`
 *    pour rester exhaustif même quand la bulle, elle, a dû choisir UNE seule
 *    explication pour un coup qui en cumulait plusieurs.
 */
import { Chess, type PieceSymbol } from "chess.js";
import { newlyHangingPieces } from "../chess/attacks";
import { exposesKingToCheck } from "../chess/coach-hints";
import { parsePosition, type ParsedPosition } from "../chess/structures";
import type { Motif } from "../chess/types";
import type { AnalysedPly, TimelinePly } from "./timeline";

export type CoachMessageTag =
  | "deviation"
  | "brilliant"
  | "critical"
  | "missed_mate"
  | "hanging_piece"
  | "king_safety"
  | "missed_tactic"
  | "open_file"
  | "blunder"
  | "inaccuracy";

export interface CoachMessage {
  tag: CoachMessageTag;
  text: string;
  /** Motif à recommander en Académie — seulement pour `tag: "missed_tactic"`, voir `core/curriculum/motif-theme.ts`. */
  motif?: Motif;
}

/**
 * Ce que le Coach sait d'une déviation de répertoire à un ply donné —
 * sous-ensemble de `GameDeviation` (`game-review-screen.tsx`), pour ne pas
 * faire dépendre ce module `core/` d'un type défini côté client.
 */
export interface DeviationHint {
  ply: number;
  expectedSan: string;
  openingName: string;
}

const MOTIF_NAME: Record<Motif, string> = {
  fork: "fourchette",
  pin: "clouage",
  skewer: "enfilade",
  discovered_attack: "attaque à la découverte",
  back_rank_mate: "mat du couloir",
  hanging_piece: "pièce en prise",
};

const PIECE_NAME: Record<PieceSymbol, string> = {
  p: "ton pion",
  n: "ton cavalier",
  b: "ton fou",
  r: "ta tour",
  q: "ta dame",
  k: "ton roi",
};

/** Article défini accordé au genre de la pièce, pour « l'adversaire peut {le/la} capturer ». */
const PIECE_PRONOUN: Record<PieceSymbol, string> = { p: "le", n: "le", b: "le", r: "la", q: "la", k: "le" };

const FILE_LETTERS = "abcdefgh";

/** Rejoue `uci` depuis `fenBefore` ; `null` si illégal (ne devrait pas arriver, coup déjà validé à l'import). */
function tryReplay(fenBefore: string, uci: string): Chess | null {
  const board = new Chess(fenBefore);
  try {
    board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
    return board;
  } catch {
    return null;
  }
}

/** Une pièce du joueur vient-elle d'être laissée en prise par CE coup (pas déjà avant) ? */
function hangingPieceMessage(entry: TimelinePly): CoachMessage | null {
  const after = tryReplay(entry.fenBefore, entry.uci);
  if (!after) return null;
  const hanging = newlyHangingPieces(new Chess(entry.fenBefore), after, entry.side);
  if (hanging.length === 0) return null;
  const { piece, square } = hanging[0];
  return {
    tag: "hanging_piece",
    text: `Tu as laissé ${PIECE_NAME[piece]} en prise en ${square} — l'adversaire peut ${PIECE_PRONOUN[piece]} capturer gratuitement.`,
  };
}

/** Le meilleur coup exploitait un motif que le coup joué a laissé filer — même condition que `findKeyMoments`/`missed_tactic` (`timeline.ts`). */
function missedTacticMessage(a: AnalysedPly, ply: number): CoachMessage | null {
  if (a.motifs.length === 0 || a.motifFound) return null;
  const motif = a.motifs[0];
  const bestHint = a.bestSan ? ` ${a.bestSan} l'exploitait.` : "";
  return { tag: "missed_tactic", motif, text: `Tu as raté une opportunité de ${MOTIF_NAME[motif]} au coup ${ply}.${bestHint}` };
}

function isFileOpenAt(position: ParsedPosition, file: number): boolean {
  return position.pawns.w[file].length === 0 && position.pawns.b[file].length === 0;
}

/**
 * La colonne de départ du coup vient-elle de s'ouvrir, avec une tour/dame
 * adverse déjà alignée dessus ? Reconnaissance de forme bon marché, comme
 * `structures.ts` (dont elle réutilise `parsePosition`/`ParsedPosition.pawns`
 * sans recalcul) : un faux négatif ne prive la bulle que de ce cas précis,
 * jamais une fausse accusation — les deux conditions (bascule fermée→ouverte
 * ET pièce lourde adverse déjà en place) doivent être réunies.
 */
function abandonedOpenFile(entry: TimelinePly, opponentColor: "w" | "b"): string | null {
  const before = parsePosition(entry.fenBefore);
  const after = parsePosition(entry.fenAfter);
  if (!before || !after) return null;

  const file = entry.uci.charCodeAt(0) - "a".charCodeAt(0);
  if (file < 0 || file > 7) return null;
  if (isFileOpenAt(before, file) || !isFileOpenAt(after, file)) return null;

  const rook = opponentColor === "w" ? "R" : "r";
  const queen = opponentColor === "w" ? "Q" : "q";
  const heavyOnFile = after.board.some((rank) => rank[file] === rook || rank[file] === queen);
  return heavyOnFile ? FILE_LETTERS[file] : null;
}

/**
 * La bulle du Coach pour le coup COURAMMENT affiché — `null` si rien ne
 * mérite d'être dit (coup de l'adversaire, ou coup du joueur sain sans motif
 * manqué : pas de bruit inutile). Ordre de priorité, chaque étage
 * court-circuite le suivant : déviation de répertoire > coup remarquable
 * (Brillant/Critique) > mat manqué > gaffe/imprécision (pièce en prise >
 * sécurité du roi > tactique manquée > colonne cédée > repli générique) >
 * tactique manquée sans gaffe patente.
 */
export function buildCoachMessage(entry: TimelinePly, deviation: DeviationHint | null): CoachMessage | null {
  const a = entry.analysis;
  if (!a || !a.byPlayer) return null;

  if (deviation && deviation.ply === entry.ply) {
    return {
      tag: "deviation",
      text: `Tu as dévié de ta théorie au coup ${deviation.ply}. Le coup de ton catalogue était ${deviation.expectedSan} (${deviation.openingName}).`,
    };
  }

  if (a.quality === "brilliant") {
    return { tag: "brilliant", text: "Coup brillant : un sacrifice qui reste objectivement gagnant — bravo pour l'audace." };
  }
  if (a.quality === "critical") {
    return { tag: "critical", text: "Seul coup qui tenait la position, et tu l'as trouvé." };
  }
  if (a.mateMissed) {
    const suffix = a.bestSan ? ` — ${a.bestSan} menait droit au mat.` : ".";
    return { tag: "missed_mate", text: `Un mat forcé était disponible ici et tu l'as laissé filer${suffix}` };
  }

  if (a.quality === "blunder" || a.quality === "inaccuracy") {
    const hanging = hangingPieceMessage(entry);
    if (hanging) return hanging;

    const after = tryReplay(entry.fenBefore, entry.uci);
    if (after && exposesKingToCheck(after)) {
      return { tag: "king_safety", text: "Ce coup expose ton roi à une attaque immédiate — la sécurité du roi passait avant le reste ici." };
    }

    const tactic = missedTacticMessage(a, entry.ply);
    if (tactic) return tactic;

    const file = abandonedOpenFile(entry, entry.side === "w" ? "b" : "w");
    if (file) {
      return {
        tag: "open_file",
        text: `Tu as abandonné le contrôle de la colonne ouverte '${file}', ce qui permet à l'adversaire d'y infiltrer sa tour.`,
      };
    }

    const bestHint = a.bestSan ? ` ${a.bestSan} restait nettement meilleur.` : "";
    return a.quality === "blunder"
      ? { tag: "blunder", text: `Gaffe : ce coup fait chuter ton évaluation.${bestHint}` }
      : { tag: "inaccuracy", text: `Imprécision, sans gravité immédiate.${bestHint}` };
  }

  return missedTacticMessage(a, entry.ply);
}

export interface CoachFinding {
  ply: number;
  message: CoachMessage;
}

/**
 * Bilan de fin de revue (`coach-report.tsx`) : une entrée par lacune DISTINCTE
 * rencontrée dans la partie (un motif manqué, un mat manqué), au premier ply
 * où elle apparaît — jamais une par coup fautif : le panneau recommande un
 * exercice par lacune, pas un mur de lignes redondantes si le joueur a raté
 * la même fourchette trois fois dans la partie.
 *
 * Scanne le timeline indépendamment de `buildCoachMessage` : celle-ci choisit
 * UNE SEULE explication par coup (une gaffe qui hante ET rate un motif
 * n'affiche que « pièce en prise » dans la bulle), alors que le bilan doit
 * rester exhaustif sur les motifs manqués — même condition que
 * `findKeyMoments`/`missed_tactic` (`timeline.ts`), appliquée ici à
 * l'agrégation plutôt qu'à la navigation.
 */
export function buildGameCoachFindings(timeline: readonly TimelinePly[]): CoachFinding[] {
  const seen = new Set<string>();
  const findings: CoachFinding[] = [];

  for (const entry of timeline) {
    const a = entry.analysis;
    if (!a || !a.byPlayer) continue;

    if (a.mateMissed && !seen.has("missed_mate")) {
      seen.add("missed_mate");
      const bestHint = a.bestSan ? ` — ${a.bestSan} menait droit au mat` : "";
      findings.push({
        ply: entry.ply,
        message: { tag: "missed_mate", text: `Tu as raté un mat forcé au coup ${entry.ply}${bestHint}.` },
      });
    }

    if (a.motifs.length > 0 && !a.motifFound) {
      const motif = a.motifs[0];
      const key = `tactic:${motif}`;
      if (!seen.has(key)) {
        seen.add(key);
        findings.push({ ply: entry.ply, message: missedTacticMessage(a, entry.ply)! });
      }
    }
  }

  return findings;
}
