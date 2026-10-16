/**
 * Le PATTERN d'un puzzle, nommé avant la recherche, avec le cours d'Académie
 * qui l'enseigne.
 *
 * Retour utilisateur (onglet Entraîner) : au lieu d'un conseil générique
 * (« Observe les menaces adverses… »), le Coach doit dire quel schéma est en
 * jeu et quel cours revoir. Deux sources, dans l'ordre :
 *  1. les motifs stockés avec le puzzle (`puzzles.motifs`) ;
 *  2. sinon (≈ un tiers des puzzles), ce que la solution fait RÉELLEMENT une
 *     fois rejouée avec chess.js : mat (du couloir ou en N coups), promotion,
 *     moulin, clouage, sacrifice, chasse au roi, coup tranquille, prise d'une
 *     pièce non défendue — via `describeTacticalSignals`.
 * Le cours est résolu par tag Lichess (`themeForLichessTag`), jamais par un id
 * codé en dur. Pur, sans React.
 */
import { Chess, type Square } from "chess.js";
import { isBackRankMate } from "../chess/motifs";
import { describeTacticalSignals } from "../chess/tactical-signals";
import type { Motif } from "../chess/types";
import type { CurriculumCategory } from "@/server/db/schema/curriculum";
import { themeForLichessTag, type MotifTheme } from "../curriculum/motif-theme";

export interface PuzzlePattern {
  /** Nom du schéma, ex. « La fourchette », « Mat en 2 ». */
  name: string;
  /** Ce qu'il faut chercher, en une phrase. */
  idea: string;
  /** Cours d'Académie à revoir — `null` si aucun thème du catalogue ne couvre ce schéma. */
  theme: MotifTheme | null;
}

interface PatternDef {
  name: string;
  idea: string;
  tag: string;
  /** Catégorie du cours voulu quand le tag est partagé par deux thèmes différents (voir `themeForLichessTag`). */
  prefer?: CurriculumCategory;
}

const MOTIF_PATTERN: Record<Motif, PatternDef> = {
  fork: { name: "La fourchette", idea: "Une seule pièce va attaquer deux cibles à la fois.", tag: "fork" },
  pin: { name: "Le clouage", idea: "Une pièce adverse est (ou va être) immobilisée devant une pièce plus importante.", tag: "pin" },
  skewer: { name: "L'enfilade", idea: "Attaque la grosse pièce : en s'écartant, elle laissera prendre celle qui est derrière.", tag: "skewer" },
  discovered_attack: { name: "L'attaque à la découverte", idea: "Déplace une pièce pour démasquer la ligne d'une autre.", tag: "discoveredAttack" },
  back_rank_mate: { name: "Le mat du couloir", idea: "Le roi adverse est enfermé derrière ses propres pions sur la dernière rangée.", tag: "backRankMate" },
  hanging_piece: { name: "La pièce en prise", idea: "Une pièce adverse n'est pas assez défendue : trouve comment la gagner.", tag: "hangingPiece" },
};

function resolve(def: PatternDef): PuzzlePattern {
  return { name: def.name, idea: def.idea, theme: themeForLichessTag(def.tag, def.prefer) };
}

function moveOf(uci: string) {
  return { from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square, promotion: uci.length > 4 ? uci[4] : undefined };
}

/** Rejoue la solution : position finale + nombre de coups du solveur, ou `null` si la ligne est incohérente. */
function replay(fen: string, solution: readonly string[]): { final: Chess; solverMoves: number } | null {
  try {
    const board = new Chess(fen);
    for (const uci of solution) board.move(moveOf(uci));
    return { final: board, solverMoves: Math.ceil(solution.length / 2) };
  } catch {
    return null;
  }
}

/** Le premier coup prend-il une pièce que personne ne défendait ? */
function firstMoveTakesUndefended(fen: string, firstUci: string): boolean {
  try {
    const board = new Chess(fen);
    const victim = board.turn() === "w" ? "b" : "w";
    const target = board.get(moveOf(firstUci).to);
    if (!target || target.color !== victim) return false;
    return board.attackers(moveOf(firstUci).to, victim).length === 0;
  } catch {
    return false;
  }
}

/** Le schéma du puzzle, `null` seulement si rien de fiable ne peut être affirmé. */
export function identifyPuzzlePattern(fen: string, solution: readonly string[], motifs: readonly Motif[]): PuzzlePattern | null {
  if (motifs.length > 0) return resolve(MOTIF_PATTERN[motifs[0]]);

  const line = replay(fen, solution);
  if (!line) return null;

  if (line.final.isCheckmate()) {
    if (isBackRankMate(line.final)) return resolve(MOTIF_PATTERN.back_rank_mate);
    const n = Math.min(line.solverMoves, 5);
    return resolve({ name: `Mat en ${line.solverMoves}`, idea: "Une suite de coups forcés mène au mat : commence par les échecs et les captures.", tag: `mateIn${n}` });
  }

  const signals = new Set(describeTacticalSignals(fen, solution));
  if (signals.has("under_promotion")) return resolve({ name: "La sous-promotion", idea: "Un pion va à promotion — mais la dame n'est pas forcément la bonne pièce.", tag: "underPromotion" });
  if (signals.has("promotion")) return resolve({ name: "La promotion", idea: "Un pion est tout près de la dame : dégage-lui la route.", tag: "promotion" });
  if (signals.has("windmill")) return resolve({ name: "Le moulin", idea: "Une série d'échecs à la découverte ramasse du matériel à chaque tour.", tag: "discoveredCheck" });
  if (signals.has("absolute_pin")) return resolve(MOTIF_PATTERN.pin);
  if (signals.has("relative_pin")) return resolve({ ...MOTIF_PATTERN.pin, prefer: "lichess_motifs" });
  if (signals.has("greek_gift") || signals.has("sacrifice_first")) return resolve({ name: "Le sacrifice", idea: "Donner du matériel tout de suite pour en gagner plus, ou pour mater.", tag: "sacrifice" });
  if (signals.has("king_hunt")) return resolve({ name: "La chasse au roi", idea: "Le roi adverse est exposé : chasse-le à coups d'échecs.", tag: "exposedKing" });
  if (signals.has("en_passant")) return resolve({ name: "La prise en passant", idea: "Le pion adverse vient d'avancer de deux cases : la prise en passant est possible.", tag: "enPassant" });
  if (signals.has("quiet_first")) return resolve({ name: "Le coup tranquille", idea: "Ni échec ni prise : le coup décisif prépare une menace imparable.", tag: "quietMove", prefer: "lichess_advanced" });
  if (solution.length > 0 && firstMoveTakesUndefended(fen, solution[0])) return resolve(MOTIF_PATTERN.hanging_piece);
  return null;
}
