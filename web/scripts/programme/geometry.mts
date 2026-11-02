/**
 * Filtres géométriques du Programme 1000 Heures : on ne se fie jamais au seul
 * tag Lichess pour rattacher un puzzle au concept du jour, la définition est
 * vérifiée sur l'échiquier (même principe que `scripts/academy-mining/`).
 *
 * Chaque filtre reçoit le contexte rejoué d'un puzzle (position AU TRAIT DU
 * SOLVEUR, coup d'installation déjà joué) et répond oui/non.
 */
import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";
import type { GeometryFilter } from "../../src/core/programme/content/spec-types";

export interface PuzzleContext {
  /** Position avant le coup d'installation (pour l'animer). */
  setupFen: string;
  setup: Move;
  start: Chess;
  startFen: string;
  /** Position avant chaque pli de la solution. */
  fens: string[];
  /** Plis de la solution (solveur aux indices pairs). */
  mvs: Move[];
  me: Color;
  them: Color;
  final: Chess;
}

export function buildContext(fen: string, uci: readonly string[]): PuzzleContext | null {
  try {
    const c = new Chess(fen);
    const setupFen = c.fen();
    const setup = c.move(uciMove(uci[0]));
    const startFen = c.fen();
    const me = c.turn();
    const fens: string[] = [];
    const mvs: Move[] = [];
    for (const u of uci.slice(1)) {
      fens.push(c.fen());
      mvs.push(c.move(uciMove(u)));
    }
    return { setupFen, setup, start: new Chess(startFen), startFen, fens, mvs, me, them: me === "w" ? "b" : "w", final: c };
  } catch {
    return null;
  }
}

export function uciMove(u: string) {
  return { from: u.slice(0, 2), to: u.slice(2, 4), promotion: u.slice(4, 5) || undefined };
}

// ── Géométrie de base ────────────────────────────────────────────────────────
const fileOf = (sq: string) => sq.charCodeAt(0) - 97;
const rankOf = (sq: string) => Number(sq[1]) - 1;
const sqOf = (f: number, r: number): Square | null => (f < 0 || f > 7 || r < 0 || r > 7 ? null : (`${"abcdefgh"[f]}${r + 1}` as Square));
const relRank = (sq: string, color: Color) => (color === "w" ? rankOf(sq) + 1 : 8 - rankOf(sq));
const isLight = (sq: string) => (fileOf(sq) + rankOf(sq)) % 2 === 1;

function pieces(c: Chess, color?: Color, type?: PieceSymbol) {
  return c.board().flat().filter((p): p is NonNullable<typeof p> => !!p && (!color || p.color === color) && (!type || p.type === type));
}
const pawnsOf = (c: Chess, color: Color) => pieces(c, color, "p").map((p) => p.square);
const kingOf = (c: Chess, color: Color) => pieces(c, color, "k")[0]?.square;
const onlyKingsAndPawns = (c: Chess) => pieces(c).every((p) => p.type === "k" || p.type === "p");
const onlyRooksKingsPawns = (c: Chess) => pieces(c).every((p) => "krp".includes(p.type));
const solverMoves = (x: PuzzleContext) => x.mvs.filter((_, i) => i % 2 === 0);

function fileHasPawn(c: Chess, file: number, color?: Color): boolean {
  for (let r = 0; r < 8; r += 1) {
    const p = c.get(sqOf(file, r)!);
    if (p?.type === "p" && (!color || p.color === color)) return true;
  }
  return false;
}

function isPassed(c: Chess, sq: string, color: Color): boolean {
  const dir = color === "w" ? 1 : -1;
  for (let df = -1; df <= 1; df += 1) {
    for (let r = rankOf(sq) + dir; r >= 0 && r <= 7; r += dir) {
      const p = sqOf(fileOf(sq) + df, r) && c.get(sqOf(fileOf(sq) + df, r)!);
      if (p && p.type === "p" && p.color !== color) return false;
    }
  }
  return true;
}

/** Un pion de `byColor` pourra-t-il un jour attaquer `sq` ? */
function pawnCanEverAttack(c: Chess, sq: string, byColor: Color): boolean {
  const dir = byColor === "w" ? 1 : -1;
  for (const df of [-1, 1]) {
    const f = fileOf(sq) + df;
    if (f < 0 || f > 7) continue;
    for (let r = 0; r < 8; r += 1) {
      const p = c.get(sqOf(f, r)!);
      // Un pion attaque en avançant : il doit être « derrière » la case (de son point de vue).
      if (p?.type === "p" && p.color === byColor && (rankOf(sq) - r) * dir > 0) return true;
    }
  }
  return false;
}

function defendedByPawn(c: Chess, sq: string, color: Color): boolean {
  const back = color === "w" ? -1 : 1;
  return [-1, 1].some((df) => {
    const s = sqOf(fileOf(sq) + df, rankOf(sq) + back);
    const p = s && c.get(s);
    return !!p && p.type === "p" && p.color === color;
  });
}

function isIsolated(c: Chess, sq: string, color: Color): boolean {
  return ![fileOf(sq) - 1, fileOf(sq) + 1].some((f) => f >= 0 && f <= 7 && fileHasPawn(c, f, color));
}

function hasChain(c: Chess, color: Color): string[] {
  const own = new Set(pawnsOf(c, color));
  const dir = color === "w" ? 1 : -1;
  for (const base of own) {
    for (const df of [-1, 1]) {
      const s1 = sqOf(fileOf(base) + df, rankOf(base) + dir);
      const s2 = s1 && sqOf(fileOf(base) + 2 * df, rankOf(base) + 2 * dir);
      if (s1 && s2 && own.has(s1) && own.has(s2)) return [base, s1, s2];
    }
  }
  return [];
}

function directionOf(from: string, to: string): [number, number] | null {
  const df = fileOf(to) - fileOf(from), dr = rankOf(to) - rankOf(from);
  if (df === 0 && dr === 0) return null;
  if (df !== 0 && dr !== 0 && Math.abs(df) !== Math.abs(dr)) return null;
  return [Math.sign(df), Math.sign(dr)];
}

function badBishopOf(c: Chess, color: Color): { square: string; light: boolean } | null {
  const bs = pieces(c, color, "b");
  if (bs.length !== 1) return null;
  const b = bs[0].square, fwd = color === "w" ? 1 : -1;
  const same = pawnsOf(c, color).filter((p) => isLight(p) === isLight(b));
  const fixed = same.filter((p) => {
    const s = sqOf(fileOf(p), rankOf(p) + fwd);
    const q = s && c.get(s);
    return !!q && q.type === "p" && q.color !== color;
  });
  return same.length >= 3 && fixed.length >= 1 ? { square: b, light: isLight(b) } : null;
}

function material(c: Chess, color: Color) {
  const count: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  for (const p of pieces(c, color)) count[p.type] += 1;
  return count;
}

// ── Filtres ──────────────────────────────────────────────────────────────────
type Filter = (x: PuzzleContext) => boolean;

const FILTERS: Record<GeometryFilter, Filter> = {
  /** Une tour/dame du solveur entre dans, ou circule sur, une colonne sans aucun pion. */
  openFile: (x) =>
    solverMoves(x).some((m, k) => (m.piece === "r" || m.piece === "q") && !fileHasPawn(new Chess(x.fens[2 * k]), fileOf(m.to)) && (fileOf(m.from) === fileOf(m.to) || relRank(m.to, x.me) >= 7)),

  /** Une tour/dame du solveur arrive sur la 7e rangée relative. */
  seventhRank: (x) => solverMoves(x).some((m) => (m.piece === "r" || m.piece === "q") && relRank(m.to, x.me) === 7),

  /** Le coup du solveur part d'une batterie orthogonale de pièces lourdes (la poudre est derrière). */
  battery: (x) =>
    solverMoves(x).some((m, k) => {
      if (m.piece !== "r" && m.piece !== "q") return false;
      const d = directionOf(m.from, m.to);
      if (!d || (d[0] !== 0 && d[1] !== 0)) return false;
      const c = new Chess(x.fens[2 * k]);
      for (let f = fileOf(m.from) - d[0], r = rankOf(m.from) - d[1]; f >= 0 && f <= 7 && r >= 0 && r <= 7; f -= d[0], r -= d[1]) {
        const p = c.get(sqOf(f, r)!);
        if (!p) continue;
        return p.color === x.me && (p.type === "r" || p.type === "q");
      }
      return false;
    }),

  /** Tour/dame sur une colonne sans pion du solveur mais avec un pion adverse, et qui l'utilise. */
  semiOpenFile: (x) =>
    solverMoves(x).some((m, k) => {
      if (m.piece !== "r" && m.piece !== "q") return false;
      const c = new Chess(x.fens[2 * k]);
      const f = fileOf(m.to);
      const semi = !fileHasPawn(c, f, x.me) && fileHasPawn(c, f, x.them);
      return semi && (fileOf(m.from) === f || m.captured === "p");
    }),

  /** Une chaîne de 3 pions existe ; la solution comporte une poussée de pion ou prend un pion de la chaîne. */
  pawnChain: (x) => {
    const chains = [...hasChain(x.start, "w"), ...hasChain(x.start, "b")];
    if (!chains.length) return false;
    return solverMoves(x).some((m) => m.piece === "p" || (m.captured === "p" && chains.includes(m.to)));
  },

  /** Un pion isolé est pris, poussé, ou bloqué (pièce posée devant lui) par la solution. */
  isolatedPawn: (x) =>
    solverMoves(x).some((m, k) => {
      const c = new Chess(x.fens[2 * k]);
      if (m.captured === "p" && isIsolated(c, m.to, x.them)) return true;
      if (m.piece === "p" && isIsolated(c, m.from, x.me) && "cde".includes(m.from[0])) return true;
      for (const sq of pawnsOf(c, x.them)) {
        const front = sqOf(fileOf(sq), rankOf(sq) + (x.them === "w" ? 1 : -1));
        if (front === m.to && m.piece !== "p" && isIsolated(c, sq, x.them)) return true;
      }
      return false;
    }),

  /** L'adversaire a des pions doublés que la solution prend, ou la solution les lui inflige. */
  doubledPawns: (x) => {
    const doubled = (c: Chess, color: Color) => {
      const files = pawnsOf(c, color).map(fileOf);
      return new Set(files.filter((f, i) => files.indexOf(f) !== i));
    };
    const before = doubled(x.start, x.them);
    if (solverMoves(x).some((m) => m.captured === "p" && before.has(fileOf(m.to)))) return true;
    for (let i = 1; i < x.mvs.length; i += 2) {
      const m = x.mvs[i], prev = x.mvs[i - 1];
      if (m.piece === "p" && m.captured && m.to === prev.to && prev.piece !== "p" && doubled(new Chess(x.fens[i + 1] ?? x.final.fen()), x.them).has(fileOf(m.to))) return true;
    }
    return false;
  },

  /** Le solveur pousse un pion passé. */
  passedPawnPush: (x) => solverMoves(x).some((m, k) => m.piece === "p" && !m.captured && isPassed(new Chess(x.fens[2 * k]), m.from, x.me)),

  /** Un coup de pion du solveur crée un pion passé qui n'existait pas. */
  createPassedPawn: (x) =>
    solverMoves(x).some((m, k) => {
      if (m.piece !== "p" || m.promotion) return false;
      const before = new Chess(x.fens[2 * k]);
      const after = new Chess(x.fens[2 * k + 1] ?? x.final.fen());
      if (!isPassed(before, m.from, x.me) && isPassed(after, m.to, x.me)) return true;
      return pawnsOf(after, x.me).some((p) => p !== m.to && isPassed(after, p, x.me) && !isPassed(before, p, x.me));
    }),

  /** Finale rois + pions : un pion passé du solveur avance (course, règle du carré). */
  squareRule: (x) => onlyKingsAndPawns(x.start) && solverMoves(x).some((m, k) => m.piece === "p" && isPassed(new Chess(x.fens[2 * k]), m.from, x.me)),

  /** Finale rois + pions : le premier coup du solveur est un coup de roi. */
  activeKing: (x) => onlyKingsAndPawns(x.start) && x.mvs[0]?.piece === "k",

  /** Finale rois + pions : après un coup de roi du solveur, les rois sont en opposition (directe ou diagonale). */
  opposition: (x) =>
    onlyKingsAndPawns(x.start) &&
    solverMoves(x).some((m, k) => {
      if (m.piece !== "k") return false;
      const after = new Chess(x.fens[2 * k + 1] ?? x.final.fen());
      const a = kingOf(after, x.me), b = kingOf(after, x.them);
      if (!a || !b) return false;
      const df = Math.abs(fileOf(a) - fileOf(b)), dr = Math.abs(rankOf(a) - rankOf(b));
      return (df === 0 && dr === 2) || (df === 2 && dr === 0) || (df === 2 && dr === 2);
    }),

  /** Finale rois + pions : au moins deux coups de roi du solveur (manœuvre, triangulation). */
  kingManoeuvre: (x) => onlyKingsAndPawns(x.start) && solverMoves(x).filter((m) => m.piece === "k").length >= 2,

  /** Finale rois + pions : pion passé du solveur à 3 colonnes ou plus du roi adverse. */
  outsidePasser: (x) => {
    if (!onlyKingsAndPawns(x.start)) return false;
    const k = kingOf(x.start, x.them);
    return !!k && pawnsOf(x.start, x.me).some((p) => isPassed(x.start, p, x.me) && Math.abs(fileOf(p) - fileOf(k)) >= 3);
  },

  /** Finale rois + pions : le premier coup du solveur est un pion offert à un pion adverse. */
  breakthrough: (x) => {
    if (!onlyKingsAndPawns(x.start)) return false;
    const [m1, r1] = x.mvs;
    return m1?.piece === "p" && !!r1 && r1.piece === "p" && r1.to === m1.to;
  },

  /** Un cavalier du solveur s'installe sur une case avancée qu'aucun pion adverse ne pourra attaquer, soutenu par un pion. */
  outpost: (x) =>
    solverMoves(x).some((m, k) => {
      if (m.piece !== "n" || relRank(m.to, x.me) < 4) return false;
      const after = new Chess(x.fens[2 * k + 1] ?? x.final.fen());
      return !pawnCanEverAttack(after, m.to, x.them) && defendedByPawn(after, m.to, x.me);
    }),

  /** Le fou de fianchetto du solveur (b2/g2/b7/g7, pion b3/g3/b6/g6 devant) joue sur la grande diagonale. */
  fianchetto: (x) =>
    solverMoves(x).some((m, k) => {
      if (m.piece !== "b") return false;
      const c = new Chess(x.fens[2 * k]);
      const ranks = x.me === "w" ? ["2", "3"] : ["7", "6"];
      const fiancSquares = ["b", "g"].map((f) => f + ranks[0]);
      if (!fiancSquares.includes(m.from)) return false;
      const pawnSq = (m.from[0] + ranks[1]) as Square;
      const p = c.get(pawnSq);
      const longDiag = fileOf(m.from) === rankOf(m.from) || fileOf(m.from) + rankOf(m.from) === 7;
      return longDiag && !!p && p.type === "p" && p.color === x.me && directionOf(m.from, m.to) !== null;
    }),

  /** L'adversaire a un mauvais fou ; la solution le prend ou joue sur l'autre couleur. */
  badBishop: (x) => {
    const bad = badBishopOf(x.start, x.them);
    if (!bad) return false;
    if (solverMoves(x).some((m) => m.captured === "b" && m.to === bad.square)) return true;
    const pieceMoves = solverMoves(x).filter((m) => m.piece !== "p" && m.piece !== "k");
    return pieceMoves.length > 0 && pieceMoves.every((m) => isLight(m.to) !== bad.light);
  },

  /** Le solveur a la paire de fous, l'adversaire non ; un fou joue dans la solution. */
  bishopPair: (x) => {
    const mine = pieces(x.start, x.me, "b");
    return mine.length === 2 && isLight(mine[0].square) !== isLight(mine[1].square) && pieces(x.start, x.them, "b").length < 2 && solverMoves(x).some((m) => m.piece === "b");
  },

  /** Seul déséquilibre de pièces mineures : cavalier du solveur contre fou adverse, sans dame ; le cavalier joue. */
  knightVsBishop: (x) => {
    const me = material(x.start, x.me), them = material(x.start, x.them);
    if (me.n !== 1 || me.b !== 0 || them.n !== 0 || them.b !== 1 || me.q || them.q) return false;
    return solverMoves(x).some((m) => m.piece === "n");
  },

  /** Un pion du solveur avance vers le roi adverse roqué (colonnes voisines du roi). */
  pawnStorm: (x) => {
    const k = kingOf(x.start, x.them);
    if (!k || relRank(k, x.them) > 2 || "de".includes(k[0])) return false;
    return solverMoves(x).some((m) => m.piece === "p" && Math.abs(fileOf(m.to) - fileOf(k)) <= 1 && relRank(m.to, x.me) >= 4);
  },

  /** Premier coup : le fou prend en h7/h2 (ou a7/a2) avec échec — le cadeau grec. */
  greekGift: (x) => {
    const m = x.mvs[0];
    const targets = x.me === "w" ? ["h7", "a7"] : ["h2", "a2"];
    return !!m && m.piece === "b" && m.captured === "p" && targets.includes(m.to) && m.san.includes("+");
  },

  /** Finale de tours : une tour du solveur est (ou s'installe) derrière un pion passé, sur sa colonne. */
  rookBehindPasser: (x) => {
    if (!onlyRooksKingsPawns(x.start)) return false;
    const check = (c: Chess) =>
      pieces(c, x.me, "r").some((r) =>
        (["w", "b"] as Color[]).some((color) =>
          pawnsOf(c, color).some((p) => {
            if (fileOf(p) !== fileOf(r.square) || !isPassed(c, p, color)) return false;
            const behind = color === "w" ? rankOf(r.square) < rankOf(p) : rankOf(r.square) > rankOf(p);
            return behind;
          }),
        ),
      );
    return solverMoves(x).some((m, k) => m.piece === "r" && check(new Chess(x.fens[2 * k + 1] ?? x.final.fen())));
  },

  /** Finale de tours : un coup de tour latéral place la tour entre le roi adverse et le pion passé du solveur. */
  cutOff: (x) => {
    if (!onlyRooksKingsPawns(x.start)) return false;
    const passed = pawnsOf(x.start, x.me).filter((p) => isPassed(x.start, p, x.me));
    const k = kingOf(x.start, x.them);
    if (!passed.length || !k) return false;
    return solverMoves(x).some((m) => {
      if (m.piece !== "r" || fileOf(m.from) === fileOf(m.to)) return false;
      const f = fileOf(m.to);
      return passed.some((p) => (f - fileOf(k)) * (f - fileOf(p)) < 0);
    });
  },

  /** Tour + pion contre tour, pion du solveur en 6e/7e, roi du solveur devant (motif de Lucena). */
  lucenaLike: (x) => {
    const me = material(x.start, x.me), them = material(x.start, x.them);
    if (me.r !== 1 || them.r !== 1 || me.p !== 1 || them.p > 1 || me.n + me.b + me.q + them.n + them.b + them.q) return false;
    const pawn = pawnsOf(x.start, x.me)[0];
    const king = kingOf(x.start, x.me)!;
    return relRank(pawn, x.me) >= 6 && relRank(king, x.me) >= relRank(pawn, x.me) && Math.abs(fileOf(king) - fileOf(pawn)) <= 1;
  },

  /** Le solveur défend tour contre tour + pion (motif de Philidor). */
  philidorLike: (x) => {
    const me = material(x.start, x.me), them = material(x.start, x.them);
    return me.r === 1 && them.r === 1 && me.p === 0 && them.p === 1 && !(me.n + me.b + me.q + them.n + them.b + them.q);
  },

  /** Finale de tours qui se termine en finale de rois et pions. */
  rookTradeToPawnEnding: (x) => onlyRooksKingsPawns(x.start) && pieces(x.start, undefined, "r").length >= 1 && onlyKingsAndPawns(x.final),

  /** Finale de tours : le pion passé du solveur avance. */
  rookEndingPasser: (x) =>
    onlyRooksKingsPawns(x.start) && solverMoves(x).some((m, k) => m.piece === "p" && isPassed(new Chess(x.fens[2 * k]), m.from, x.me)),
};

export function matchesGeometry(filter: GeometryFilter, x: PuzzleContext): boolean {
  try {
    return FILTERS[filter](x);
  } catch {
    return false;
  }
}

export function pieceCount(fen: string): number {
  return fen.split(" ")[0].replace(/[^a-zA-Z]/g, "").length;
}
