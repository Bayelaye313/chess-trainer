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
  | "weak_square"
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

function squareName(file: number, rank: number): string {
  return `${FILE_LETTERS[file]}${rank + 1}`;
}

function findKingSquare(position: ParsedPosition, color: "w" | "b"): { file: number; rank: number } | null {
  const target = color === "w" ? "K" : "k";
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      if (position.board[rank][file] === target) return { file, rank };
    }
  }
  return null;
}

const KING_NEIGHBOR_OFFSETS: readonly [number, number][] = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

/**
 * Lecture géométrique du Roi qui vient d'être maté (ou aurait dû l'être) —
 * remplace l'annonce robotique « un mat était disponible » par une vraie
 * description de la cage : ses propres pions/pièces qui lui bouchent la
 * retraite, plutôt que la case de mat elle-même (que seule la PV moteur
 * connaîtrait avec certitude). `null` si la position est illisible ou si le
 * roi adverse est introuvable (ne devrait pas arriver pour une position
 * valide).
 */
function describeKingTrap(fenBefore: string, mateColor: "w" | "b"): string | null {
  const position = parsePosition(fenBefore);
  if (!position) return null;
  const king = findKingSquare(position, mateColor);
  if (!king) return null;

  let ownBlockers = 0;
  let empty = 0;
  for (const [df, dr] of KING_NEIGHBOR_OFFSETS) {
    const file = king.file + df;
    const rank = king.rank + dr;
    if (file < 0 || file > 7 || rank < 0 || rank > 7) continue;
    const occupant = position.board[rank][file];
    if (occupant === null) {
      empty += 1;
      continue;
    }
    const isOwn = mateColor === "w" ? occupant === occupant.toUpperCase() : occupant === occupant.toLowerCase();
    if (isOwn) ownBlockers += 1;
  }

  const onBackRank = (mateColor === "w" && king.rank === 0) || (mateColor === "b" && king.rank === 7);
  const square = squareName(king.file, king.rank);

  if (onBackRank && ownBlockers >= 2) {
    return `Le Roi adverse (${square}) est acculé sur sa rangée de départ, muré par ses propres pions — la dernière rangée ne lui laisse plus aucune issue.`;
  }
  if (empty === 0) {
    return `Le Roi adverse (${square}) n'a structurellement plus une seule case de fuite : chaque case voisine est bloquée par ${
      ownBlockers > 0 ? "ses propres pièces" : "le bord de l'échiquier"
    }.`;
  }
  if (ownBlockers >= 2) {
    return `Le Roi adverse (${square}) est à l'étroit, gêné par ses propres pièces autour de lui.`;
  }
  return null;
}

function canPawnEverDefend(position: ParsedPosition, file: number, rank: number, color: "w" | "b"): boolean {
  for (const adjacentFile of [file - 1, file + 1]) {
    if (adjacentFile < 0 || adjacentFile > 7) continue;
    for (const pawnRank of position.pawns[color][adjacentFile]) {
      if (color === "w" ? pawnRank < rank : pawnRank > rank) return true;
    }
  }
  return false;
}

/**
 * Un coup de pion vient-il de créer, pour le joueur qui l'a joué, une case
 * définitivement hors de portée de TOUS ses pions — la définition classique
 * de la « case faible » (Nimzowitsch) ? La case perdue est celle que le pion
 * gardait juste avant de bouger (diagonale avant depuis sa case de départ) ;
 * elle ne devient un vrai « trou » que si aucun pion voisin ne peut plus
 * jamais la reprendre en charge. `null` pour tout coup qui n'est pas une
 * simple poussée de pion, ou si aucune case adjacente ne bascule.
 */
function newlyWeakSquareMessage(entry: TimelinePly): CoachMessage | null {
  const fromFile = entry.uci.charCodeAt(0) - "a".charCodeAt(0);
  const fromRank = Number(entry.uci[1]) - 1;
  const toFile = entry.uci.charCodeAt(2) - "a".charCodeAt(0);
  if (fromFile !== toFile) return null; // capture ou coup de pièce : hors du champ de cette heuristique.

  const before = parsePosition(entry.fenBefore);
  const after = parsePosition(entry.fenAfter);
  if (!before || !after) return null;
  if (before.board[fromRank]?.[fromFile]?.toLowerCase() !== "p") return null;

  const forward = entry.side === "w" ? 1 : -1;
  const weakenedRank = fromRank + forward;
  if (weakenedRank < 0 || weakenedRank > 7) return null;

  for (const weakenedFile of [fromFile - 1, fromFile + 1]) {
    if (weakenedFile < 0 || weakenedFile > 7) continue;
    if (after.board[weakenedRank][weakenedFile] !== null) continue; // case déjà occupée : rien à annoncer ici.
    if (canPawnEverDefend(after, weakenedFile, weakenedRank, entry.side)) continue;

    const square = squareName(weakenedFile, weakenedRank);
    return {
      tag: "weak_square",
      text: `En jouant ${entry.san}, tu viens de créer une faiblesse chronique en ${square} : plus aucun de tes pions ne pourra jamais la défendre. Ton plan à long terme est d'y manœuvrer une pièce — souvent un cavalier — pour l'exploiter durablement.`,
    };
  }

  return null;
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
    const opponentColor = entry.side === "w" ? "b" : "w";
    const geometry = describeKingTrap(entry.fenBefore, opponentColor);
    const bestHint = a.bestSan ? ` Le coup clé était ${a.bestSan}, qui ne laissait plus aucune échappatoire.` : "";
    return {
      tag: "missed_mate",
      text: `Un mat forcé était disponible ici et tu l'as laissé filer.${geometry ? ` ${geometry}` : ""}${bestHint}`,
    };
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

    const weakSquare = newlyWeakSquareMessage(entry);
    if (weakSquare) return weakSquare;

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

  // Aucun motif inventé hors gaffe/imprécision avérée : un coup `best`/`okay`/`book`
  // n'a rien coûté de mesurable, même si le meilleur coup exploitait
  // structurellement un motif (`detectMotifs` ne juge que la FORME du meilleur
  // coup, pas ce que le coup joué a réellement coûté). Annoncer « tu as raté
  // une fourchette » sur un coup par ailleurs correct — typiquement un simple
  // échange matériel linéaire où le motif ne pesait pour ainsi dire rien sur
  // la probabilité de gain — est une fausse alerte du Coach, corrigée ici :
  // voir aussi `buildGameCoachFindings` ci-dessous, même garde-fou.
  return null;
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
      const opponentColor = entry.side === "w" ? "b" : "w";
      const geometry = describeKingTrap(entry.fenBefore, opponentColor);
      const bestHint = a.bestSan ? ` — ${a.bestSan} menait droit au mat` : "";
      findings.push({
        ply: entry.ply,
        message: {
          tag: "missed_mate",
          text: `Tu as raté un mat forcé au coup ${entry.ply}${bestHint}.${geometry ? ` ${geometry}` : ""}`,
        },
      });
    }

    // Même garde-fou que `buildCoachMessage` : un motif manqué ne compte que
    // s'il a coûté quelque chose de mesurable (gaffe/imprécision) — sinon ce
    // n'est qu'une forme tactique du meilleur coup sans lien avec un vrai
    // manque à gagner du joueur (ex. simple échange matériel linéaire).
    const hadRealCost = a.quality === "blunder" || a.quality === "inaccuracy";
    if (hadRealCost && a.motifs.length > 0 && !a.motifFound) {
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
