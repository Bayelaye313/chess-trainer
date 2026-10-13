/**
 * Étape 1 du pipeline (voir README.md) : une seule passe sur la base officielle
 * des puzzles Lichess (CC0, ~6 M lignes), chaque puzzle rejoué UNE fois par
 * chess.js puis soumis à un détecteur GÉOMÉTRIQUE par thème (`D[themeId]`) —
 * on ne se fie jamais au seul tag Lichess, la définition du thème est vérifiée
 * sur l'échiquier (sources des définitions en commentaire de chaque groupe).
 *
 *   node scripts/academy-mining/mine-lichess-puzzles.mjs <lichess_db_puzzle.csv.zst> <candidats.json>
 *
 * Options (variables d'environnement) :
 *   ONLY=th1,th2          ne lancer que ces détecteurs
 *   MINPOP / MINPLAYS     préfiltre qualité Lichess (défaut 75 / 100)
 *   PREFILTER_GRUNFELD=1  préfiltre texte (pions d4+e4 blancs) pour accélérer
 *                         une passe dédiée à `ps-la-structure-grunfeld`
 */
import { openSync, readSync, closeSync, fstatSync, writeFileSync } from "node:fs";
import * as zlib from "node:zlib";
import { Chess } from "chess.js";

const [csvPath, outPath] = process.argv.slice(2);
if (!csvPath || !outPath) {
  console.error("usage: node mine-lichess-puzzles.mjs <lichess_db_puzzle.csv.zst> <candidats.json>");
  process.exit(1);
}

// ── zstd tolérant (repris de scripts/convert-lichess-puzzles-csv.ts) ──────────
const MASK = 0xfffffff0, BASE = 0x184d2a50, REAL = [0x28, 0xb5, 0x2f, 0xfd], CHUNK = 65536, MARGIN = 4 * CHUNK;
function findSkipFrame(fd, size, start, end) {
  const len = Math.min(end, size) - start;
  if (len <= 0) return null;
  const buf = Buffer.alloc(len);
  readSync(fd, buf, 0, len, start);
  for (let i = 0; i + 8 <= len; i++) {
    if ((buf.readUInt32LE(i) & MASK) >>> 0 !== BASE) continue;
    const after = start + i + 8 + buf.readUInt32LE(i + 4);
    if (after === size) return after;
    if (after + 4 > size) continue;
    const c = Buffer.alloc(4);
    readSync(fd, c, 0, 4, after);
    if (c[0] === REAL[0] && c[1] === REAL[1] && c[2] === REAL[2] && c[3] === REAL[3]) return after;
  }
  return null;
}
async function eachLine(path, onLine) {
  const fd = openSync(path, "r");
  const size = fstatSync(fd).size;
  let abs = 0, leftover = "";
  while (abs < size) {
    const seg = abs;
    abs = await new Promise((resolve, reject) => {
      const d = zlib.createZstdDecompress();
      let fed = 0, settled = false;
      d.on("data", (chunk) => {
        leftover += chunk.toString("utf8");
        let i;
        while ((i = leftover.indexOf("\n")) !== -1) { const l = leftover.slice(0, i); leftover = leftover.slice(i + 1); try { onLine(l); } catch {} }
      });
      d.on("error", (err) => {
        if (settled) return;
        settled = true;
        const f = findSkipFrame(fd, size, seg, seg + fed + MARGIN);
        if (f === null) return reject(err);
        leftover = "";
        resolve(f);
      });
      d.on("close", () => { if (!settled) { settled = true; resolve(size); } });
      (function feed() {
        if (settled) return;
        if (seg + fed >= size) return d.end();
        const n = Math.min(CHUNK, size - seg - fed);
        const b = Buffer.alloc(n);
        fed += readSync(fd, b, 0, n, seg + fed);
        const ok = d.write(b);
        if (settled) return;
        if (ok) setImmediate(feed); else d.once("drain", feed);
      })();
    });
  }
  closeSync(fd);
}

// ── Géométrie ────────────────────────────────────────────────────────────────
const F = "abcdefgh";
const fileOf = (sq) => sq.charCodeAt(0) - 97;
const rankOf = (sq) => +sq[1] - 1;
const sqOf = (f, r) => (f < 0 || f > 7 || r < 0 || r > 7 ? null : F[f] + (r + 1));
const isLight = (sq) => (fileOf(sq) + rankOf(sq)) % 2 === 1;
const rel = (sq, color) => (color === "w" ? rankOf(sq) + 1 : 8 - rankOf(sq)); // rangée relative 1..8
const opp = (c) => (c === "w" ? "b" : "w");
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
function between(a, b) {
  const df = fileOf(b) - fileOf(a), dr = rankOf(b) - rankOf(a);
  if (!(df === 0 || dr === 0 || Math.abs(df) === Math.abs(dr))) return null;
  const sf = Math.sign(df), sr = Math.sign(dr), out = [];
  for (let f = fileOf(a) + sf, r = rankOf(a) + sr; f !== fileOf(b) || r !== rankOf(b); f += sf, r += sr) out.push(sqOf(f, r));
  return out;
}
function around(sq) { const out = []; for (let df = -1; df <= 1; df++) for (let dr = -1; dr <= 1; dr++) if (df || dr) { const s = sqOf(fileOf(sq) + df, rankOf(sq) + dr); if (s) out.push(s); } return out; }
function pieces(c, color, type) { return c.board().flat().filter((p) => p && (!color || p.color === color) && (!type || p.type === type)); }
function kingSq(c, color) { return pieces(c, color, "k")[0].square; }
function material(c, color) { return pieces(c, color).reduce((s, p) => s + VAL[p.type], 0); }
function pawnsOf(c, color) { return pieces(c, color, "p").map((p) => p.square); }
/** La case `sq` peut-elle un jour être attaquée par un pion de `byColor` ? (pion d'une colonne voisine encore « derrière » la case) */
function pawnCanAttack(c, sq, byColor) {
  const f = fileOf(sq), r = rankOf(sq);
  return pawnsOf(c, byColor).some((p) => Math.abs(fileOf(p) - f) === 1 && (byColor === "w" ? rankOf(p) < r : rankOf(p) > r));
}
function defendedByPawn(c, sq, color) {
  const back = color === "w" ? -1 : 1;
  return [-1, 1].some((df) => { const s = sqOf(fileOf(sq) + df, rankOf(sq) + back); const p = s && c.get(s); return p && p.type === "p" && p.color === color; });
}
const isDiscovered = (fenAfter, mv, defenderKing, me) => !new Chess(fenAfter).attackers(defenderKing, me).includes(mv.to);

// ── Contexte d'un puzzle (rejoué UNE fois) ───────────────────────────────────
function buildCtx(fen, uci) {
  const c = new Chess(fen);
  c.move({ from: uci[0].slice(0, 2), to: uci[0].slice(2, 4), promotion: uci[0][4] });
  const startFen = c.fen(), me = c.turn(), them = opp(me);
  const fens = [startFen], mvs = [];
  for (const u of uci.slice(1)) { mvs.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] })); fens.push(c.fen()); }
  const start = new Chess(startFen);
  return { startFen, me, them, mvs, fens, final: c, start, mate: c.isCheckmate(), san: mvs.map((m) => m.san), solver: mvs.filter((_, i) => i % 2 === 0) };
}

// ── Détecteurs : thème → (ctx, tags) => info|null ────────────────────────────
const D = {};
const mateBy = (ctx, type) => ctx.mate && ctx.mvs.at(-1).piece === type && ctx.mvs.at(-1).color === ctx.me;
const decisive = (t) => /crushing|mate/.test(t);
const gain = (t) => /crushing|advantage/.test(t) && !/\bmate\b/.test(t);

// Lot 1
/** Sacrifice grec strict : Fxh7+ (Fxh2+), le roi g8 (g1) reprend, Cg5+ (Cg4+), puis la Dame du solveur arrive en h5 (h4). */
D["tm-le-sacrifice-grec"] = (x, t) => {
  const [h7, g8, g5, h5] = x.me === "w" ? ["h7", "g8", "g5", "h5"] : ["h2", "g1", "g4", "h4"];
  const k = x.start.get(g8);
  if (!decisive(t) || !k || k.type !== "k" || k.color !== x.them) return null;
  const [m1, m2, m3] = x.mvs;
  if (!m1 || m1.piece !== "b" || m1.to !== h7 || !m1.captured || !m1.san.includes("+")) return null;
  if (!m2 || m2.piece !== "k" || m2.to !== h7) return null; // le roi accepte le cadeau
  if (!m3 || m3.piece !== "n" || m3.to !== g5 || !m3.san.includes("+")) return null;
  return x.solver.some((m) => m.piece === "q" && m.to === h5) ? {} : null;
};
/** Canon d'Alekhine strict : sur une colonne sans pion du solveur, T + T + D du solveur consécutives (Dame la plus en arrière), et le 1er coup est joué par la Tour de tête le long de cette colonne. */
D["tm-le-canon-d-alekhine"] = (x, t) => {
  if (!decisive(t)) return null;
  const b = x.start.board();
  for (let f = 0; f < 8; f++) {
    const col = []; // du camp du solveur vers l'adversaire
    for (let r = 0; r < 8; r++) col.push(b[x.me === "w" ? 7 - r : r][f]);
    if (col.some((p) => p && p.type === "p" && p.color === x.me)) continue;
    const occupied = col.map((p, i) => ({ p, i })).filter((o) => o.p);
    for (let j = 0; j + 2 < occupied.length; j++) {
      const [q, r1, r2] = occupied.slice(j, j + 3);
      if (q.p.color !== x.me || q.p.type !== "q" || r1.p.color !== x.me || r1.p.type !== "r" || r2.p.color !== x.me || r2.p.type !== "r") continue;
      const sq = (o) => F[f] + (x.me === "w" ? o.i + 1 : 8 - o.i);
      const first = x.mvs[0];
      return first.from === sq(r2) && first.to[0] === F[f] ? { battery: [sq(q), sq(r1), sq(r2)] } : null;
    }
  }
  return null;
};
/** Mat de l'Opéra strict : mat par une Tour du solveur, défendue par un Fou, roi adverse sur sa dernière rangée. */
D["cm-mat-de-l-opera"] = (x, t) => {
  if (!/operaMate/.test(t) || !mateBy(x, "r")) return null;
  const k = kingSq(x.final, x.them), rook = x.mvs.at(-1).to;
  if (rel(k, x.them) !== 1) return null;
  const bishop = x.final.attackers(rook, x.me).find((s) => x.final.get(s).type === "b");
  return bishop ? { king: k, rook, bishop } : null;
};

// Lot 4
/** La pièce `type` glisse-t-elle sur la ligne a→b ? (Tour : colonne/rangée, Fou : diagonale, Dame : les deux) */
function slidesAlong(type, a, b) {
  const orth = fileOf(a) === fileOf(b) || rankOf(a) === rankOf(b);
  return type === "q" || (type === "r" && orth) || (type === "b" && !orth && between(a, b) !== null);
}
const occupiedBetween = (c, a, b) => (between(a, b) ?? []).filter((s) => c.get(s));
/**
 * Attaques DÉCOUVERTES par le coup `mv` : une pièce à longue portée du camp `me`
 * dont la ligne vers une cible adverse n'était masquée QUE par `mv.from`.
 */
function discoveries(before, after, mv, me) {
  const out = [];
  for (const s of pieces(after, me).filter((p) => "brq".includes(p.type) && p.square !== mv.to)) {
    for (const t of pieces(after, opp(me))) {
      const line = between(s.square, t.square);
      if (!line || !line.includes(mv.from) || !slidesAlong(s.type, s.square, t.square)) continue;
      if (occupiedBetween(after, s.square, t.square).length) continue; // ligne ouverte APRÈS le coup
      const masked = occupiedBetween(before, s.square, t.square);
      if (masked.length === 1 && masked[0] === mv.from) out.push({ slider: s.square, target: t.square, type: t.type });
    }
  }
  return out;
}
/**
 * Attaque à la découverte : le 1er coup du solveur démasque une attaque sur une
 * pièce adverse ≥ 3 (le roi relève de `tm-l-echec-a-la-decouverte`), et la
 * suite gagne du matériel. `preferred` = double attaque : la pièce démasquante
 * fait sa propre menace (échec, capture ou attaque d'une autre pièce ≥ 3).
 */
D["tm-l-attaque-a-la-decouverte"] = (x, t) => {
  if (!gain(t) && !decisive(t)) return null;
  const mv = x.mvs[0], after = new Chess(x.fens[1]);
  const hits = discoveries(x.start, after, mv, x.me).filter((d) => d.type !== "k" && VAL[d.type] >= 3);
  if (!hits.length) return null;
  if (!x.solver.slice(1).some((m) => m.captured && VAL[m.captured] >= 3)) return null; // l'attaque est encaissée
  const ownThreat = /[+#]/.test(mv.san) || (mv.captured && VAL[mv.captured] >= 3) ||
    pieces(after, x.them).some((p) => VAL[p.type] >= 3 && !hits.some((h) => h.target === p.square) && after.attackers(p.square, x.me).includes(mv.to));
  return { slider: hits[0].slider, target: hits[0].target, preferred: Boolean(ownThreat) };
};
/**
 * Mat du couloir (Wikipédia « Back-rank checkmate ») : mat par Tour ou Dame le
 * long de la dernière rangée du roi, à distance (pas un mat collé), les cases
 * de fuite de la 2e rangée relative toutes fermées, dont au moins deux par les
 * propres pièces du roi (en coin, il n'y en a que deux).
 */
D["cm-mat-du-couloir"] = (x) => {
  if (!x.mate) return null;
  const last = x.mvs.at(-1);
  if (last.color !== x.me || !["r", "q"].includes(last.piece)) return null;
  const k = kingSq(x.final, x.them);
  if (rel(k, x.them) !== 1 || last.to[1] !== k[1] || Math.abs(fileOf(last.to) - fileOf(k)) < 2) return null;
  const front = around(k).filter((s) => rel(s, x.them) === 2);
  const own = front.filter((s) => x.final.get(s)?.color === x.them);
  if (own.length < 2 || !front.every((s) => own.includes(s) || x.final.attackers(s, x.me).length)) return null;
  return { king: k, blockers: own };
};
/**
 * Rayons X : le solveur capture en T ; l'adversaire reprend en T avec la pièce E
 * qui masquait la ligne d'une pièce à longue portée S du solveur vers T ; S
 * reprend alors en T à travers la case libérée. Avant le 1er coup, T semblait
 * suffisamment défendu (attaquants visibles ≤ défenseurs).
 */
D["tm-l-attaque-a-rayons-x"] = (x, t) => {
  if (!gain(t) && !decisive(t)) return null;
  const [m1, m2, m3] = x.mvs;
  if (!m3 || !m1.captured || m2.to !== m1.to || !m2.captured || m3.to !== m1.to || !m3.captured) return null;
  if (!"brq".includes(m3.piece) || m3.from === m1.from || !slidesAlong(m3.piece, m3.from, m1.to)) return null;
  const T = m1.to;
  if (occupiedBetween(x.start, m3.from, T).join() !== m2.from) return null; // seule E masquait S → T
  if (x.start.attackers(T, x.me).length > x.start.attackers(T, x.them).length) return null; // T « surprotégé » en apparence
  return { slider: m3.from, through: m2.from, target: T };
};

// Mats nommés (définitions : Wikipédia « Checkmate pattern »)
D["cm-mat-de-blackburne"] = (x) => {
  if (!mateBy(x, "b") || pieces(x.final, x.me, "b").length < 2) return null;
  const k = kingSq(x.final, x.them);
  if (rel(k, x.them) !== 1) return null;
  const knightConfines = pieces(x.final, x.me, "n").some((n) => around(k).some((s) => x.final.attackers(s, x.me).includes(n.square)));
  return knightConfines ? { king: k } : null;
};
D["cm-mat-de-greco"] = (x) => {
  if (!x.mate) return null;
  const last = x.mvs.at(-1);
  if (!["q", "r"].includes(last.piece) || !"ah".includes(last.to[0])) return null;
  const k = kingSq(x.final, x.them);
  if (!["a1", "a8", "h1", "h8"].includes(k)) return null;
  const inner = k[0] === "h" ? 6 : 1, pawnSq = sqOf(inner, x.them === "b" ? 6 : 1), side = sqOf(inner, rankOf(k));
  const pawn = x.final.get(pawnSq);
  if (!pawn || pawn.type !== "p" || pawn.color !== x.them) return null;
  const bishopCovers = x.final.attackers(side, x.me).some((s) => x.final.get(s).type === "b");
  return bishopCovers ? { king: k, mateOn: last.to } : null;
};
D["cm-mat-de-lolli"] = (x) => {
  if (!mateBy(x, "q")) return null;
  const k = kingSq(x.final, x.them), q = x.mvs.at(-1).to;
  const back = x.them === "b" ? 7 : 0, dir = x.them === "b" ? -1 : 1;
  if (rankOf(k) !== back || !["g", "h"].includes(k[0])) return null;
  if (q !== sqOf(6, back + dir)) return null; // Dame en g7 / g2
  const pf = x.final.get(sqOf(5, back + 2 * dir)); // pion en f6 / f3
  const pg = x.final.get(sqOf(6, back + 2 * dir)); // pion fianchetto g6 / g3
  return pf && pf.type === "p" && pf.color === x.me && pg && pg.type === "p" && pg.color === x.them ? { king: k } : null;
};
D["cm-mat-de-reti"] = (x) => {
  if (!mateBy(x, "b")) return null;
  const k = kingSq(x.final, x.them), b = x.mvs.at(-1).to;
  const supported = x.final.attackers(b, x.me).some((s) => ["r", "q"].includes(x.final.get(s).type));
  const ownBlockers = around(k).filter((s) => { const p = x.final.get(s); return p && p.color === x.them; }).length;
  return supported && ownBlockers >= 3 ? { king: k, blockers: ownBlockers } : null;
};
D["cm-mat-de-cozio"] = (x, t) => {
  if (!/dovetailMate/.test(t) || !mateBy(x, "q")) return null;
  const k = kingSq(x.final, x.them), q = x.mvs.at(-1).to;
  if (Math.abs(fileOf(q) - fileOf(k)) !== 1 || Math.abs(rankOf(q) - rankOf(k)) !== 1) return null;
  const own = around(k).filter((s) => { const p = x.final.get(s); return p && p.color === x.them; }).length;
  return own >= 2 && x.final.attackers(q, x.me).length > 0 ? { king: k } : null;
};
D["cm-mat-de-max-lange"] = (x) => {
  if (!mateBy(x, "q")) return null;
  const k = kingSq(x.final, x.them), q = x.mvs.at(-1).to;
  if (!around(k).includes(q)) return null;
  const bishops = x.final.attackers(q, x.me).filter((s) => x.final.get(s).type === "b");
  for (const b of bishops) {
    const covers = around(k).some((s) => s !== q && !x.final.get(s) && x.final.attackers(s, x.me).includes(b));
    if (covers) return { king: k, bishop: b };
  }
  return null;
};
function discoveredBySamePiece(x) {
  let count = 0, piece = null;
  for (let i = 0; i < x.mvs.length; i += 2) {
    const mv = x.mvs[i];
    if (!mv.san.includes("+") && !mv.san.includes("#")) continue;
    const k = kingSq(new Chess(x.fens[i + 1]), x.them);
    if (!isDiscovered(x.fens[i + 1], mv, k, x.me)) continue;
    if (piece === null || piece === mv.from) { count++; piece = mv.to; }
  }
  return count;
}
D["cm-mat-du-moulin"] = (x) => (x.mate && discoveredBySamePiece(x) >= 2 ? {} : null);
D["cm-mat-du-filet"] = (x, t) => {
  const m1 = x.mvs[0];
  return x.mate && /quietMove/.test(t) && x.solver.length >= 2 && !m1.captured && !/[+#]/.test(m1.san) ? {} : null;
};
D["cm-mat-roi-et-dame-contre-roi"] = (x) => {
  const mine = pieces(x.start, x.me).map((p) => p.type).sort().join(""), theirs = pieces(x.start, x.them).map((p) => p.type).join("");
  return x.mate && mine === "kq" && theirs === "k" && x.mvs.length >= 3 ? {} : null;
};

// Motifs tactiques
D["tm-le-clouage-relatif"] = (x, t) => {
  if (!/\bpin\b/.test(t) || !gain(t)) return null;
  for (const i of [0, 1]) { // position de départ, ou après le 1er coup du solveur
    const c = new Chess(x.fens[i === 0 ? 0 : 1]);
    for (const s of pieces(c, x.me).filter((p) => ["b", "r", "q"].includes(p.type))) {
      for (const target of pieces(c, x.them).filter((p) => ["n", "b", "r"].includes(p.type))) {
        const line = between(s.square, target.square);
        if (!line || line.some((q) => c.get(q))) continue;
        const diag = fileOf(s.square) !== fileOf(target.square) && rankOf(s.square) !== rankOf(target.square);
        if ((diag && s.type === "r") || (!diag && s.type === "b")) continue;
        // pièce derrière la cible, sur la même ligne
        const sf = Math.sign(fileOf(target.square) - fileOf(s.square)), sr = Math.sign(rankOf(target.square) - rankOf(s.square));
        let f = fileOf(target.square) + sf, r = rankOf(target.square) + sr, behind = null;
        while (sqOf(f, r)) { const p = c.get(sqOf(f, r)); if (p) { behind = p; break; } f += sf; r += sr; }
        if (!behind || behind.color !== x.them || behind.type === "k" || VAL[behind.type] <= VAL[target.type]) continue;
        if (x.mvs.some((m, j) => j % 2 === 0 && m.captured && (m.to === target.square || m.to === sqOf(f, r)))) return { pinned: target.square, behind: sqOf(f, r) };
      }
    }
  }
  return null;
};
D["tm-la-surcharge"] = (x, t) => {
  if (x.mvs.length < 3 || !decisive(t) && !gain(t)) return null;
  const [m1, m2, m3] = x.mvs;
  if (!m1.captured && !/\+/.test(m1.san)) return null;
  if (m2.to !== m1.to || !m2.captured) return null;
  if (m3.to === m1.to) return null;
  const before = x.start;
  const defended = before.attackers(m3.to, x.them);
  if (!defended.includes(m2.from) || defended.length !== 1) return null; // D était le SEUL défenseur de B
  if (!before.attackers(m1.to, x.them).includes(m2.from)) return null;
  return { overloaded: m2.from, a: m1.to, b: m3.to };
};
D["tm-l-elimination-du-defenseur"] = (x, t) => (/capturingDefender/.test(t) && x.mvs[0].captured && (decisive(t) || gain(t)) ? {} : null);
D["tm-le-sacrifice-de-degagement"] = (x, t) => {
  if (!/clearance/.test(t) || !/sacrifice/.test(t) || x.mvs.length < 3) return null;
  const [m1, m2] = x.mvs;
  if (m1.piece === "p" || m2.to !== m1.to) return null;
  const used = x.mvs.some((m, i) => i >= 2 && i % 2 === 0 && (m.to === m1.from || (between(m.from, m.to) || []).includes(m1.from)));
  return used ? { cleared: m1.from } : null;
};
D["tm-le-moulin-tactique"] = (x, t) => (!x.mate && gain(t) && discoveredBySamePiece(x) >= 2 ? {} : null);
D["tm-le-desespoir-desperado"] = (x, t) => {
  if (x.mvs.length < 2 || !(gain(t) || /equality/.test(t))) return null;
  const [m1, m2] = x.mvs;
  if (!m1.captured || m1.piece === "p" || m1.piece === "k" || m2.to !== m1.to) return null;
  const attackers = x.start.attackers(m1.from, x.them);
  if (attackers.length === 0) return null;
  const cheapest = Math.min(...attackers.map((s) => VAL[x.start.get(s).type] || 100));
  const defended = x.start.attackers(m1.from, x.me).length > 0;
  return cheapest < VAL[m1.piece] || !defended ? { doomed: m1.from } : null; // la pièce était perdue de toute façon
};
D["tm-l-attraction-sur-case-fatale"] = (x, t) => {
  if (!/attraction/.test(t) || !x.mate || x.mvs.length < 3) return null;
  const [m1, m2] = x.mvs;
  return m2.piece === "k" && m2.to === m1.to ? { lure: m1.to } : null;
};
D["tm-le-blocage-tactique"] = (x) => {
  if (!x.mate || x.mvs.length < 3) return null;
  const blocker = x.mvs.at(-2), k = kingSq(x.final, x.them);
  return blocker.piece !== "k" && around(k).includes(blocker.to) ? { selfBlock: blocker.to } : null;
};
const placement = (fen) => fen.split(" ").slice(0, 2).join(" ");
D["tm-l-echec-perpetuel"] = (x, t) => {
  if (!/equality/.test(t) || x.solver.length < 2 || !x.solver.every((m) => /\+/.test(m.san))) return null;
  const seen = x.fens.map(placement), last = seen.at(-1);
  return seen.slice(0, -1).includes(last) || x.solver.length >= 3 ? {} : null;
};
D["tm-le-pat-comme-ressource"] = (x, t) => {
  if (!/equality/.test(t)) return null;
  if (x.final.isStalemate()) return {};
  const last = x.mvs.at(-1);
  if (last.color !== x.me) return null;
  for (const reply of x.final.moves({ verbose: true }).filter((m) => m.to === last.to)) {
    const c = new Chess(x.final.fen());
    c.move(reply);
    if (c.isStalemate()) return { via: reply.san };
  }
  return null;
};
D["tm-la-batterie-de-pieces"] = (x) => {
  if (!x.mate) return null;
  const last = x.mvs.at(-1);
  if (!["q", "b", "r"].includes(last.piece)) return null;
  const k = kingSq(x.final, x.them);
  const line = between(k, last.to);
  if (line === null) return null;
  const sf = Math.sign(fileOf(last.to) - fileOf(k)), sr = Math.sign(rankOf(last.to) - rankOf(k));
  const diag = sf !== 0 && sr !== 0;
  let f = fileOf(last.to) + sf, r = rankOf(last.to) + sr;
  while (sqOf(f, r)) {
    const p = x.final.get(sqOf(f, r));
    if (p) {
      const ok = p.color === x.me && (p.type === "q" || (diag ? p.type === "b" : p.type === "r")) && (last.piece === "q" || p.type === "q");
      return ok ? { front: last.to, back: sqOf(f, r) } : null;
    }
    f += sf; r += sr;
  }
  return null;
};
const exchangeSac = (x) => { const [m1, m2] = x.mvs; return m1 && m2 && m1.piece === "r" && ["n", "b"].includes(m1.captured) && m2.to === m1.to && m2.captured === "r"; };
D["tm-le-sacrifice-de-qualite"] = (x) => (x.mate && exchangeSac(x) ? {} : null);
D["tm-le-sacrifice-positionnel"] = (x, t) => {
  if (!/sacrifice/.test(t) || !gain(t) || x.mate) return null;
  const startBal = material(x.start, x.me) - material(x.start, x.them), endBal = material(x.final, x.me) - material(x.final, x.them);
  return endBal <= startBal - 2 ? { down: startBal - endBal } : null; // toujours en déficit à la fin de la ligne
};
D["tm-le-sacrifice-de-dame"] = (x, t) => {
  const [m1, m2] = x.mvs;
  return m1 && m2 && m1.piece === "q" && m2.to === m1.to && (x.mate || /crushing/.test(t)) ? {} : null;
};
function opensLine(x, sliders, onFile) {
  const m1 = x.mvs[0];
  if (m1.piece !== "p") return null;
  for (let i = 2; i < x.mvs.length; i += 2) {
    const m = x.mvs[i];
    if (!sliders.includes(m.piece)) continue;
    const straight = fileOf(m.from) === fileOf(m.to);
    const diag = Math.abs(fileOf(m.from) - fileOf(m.to)) === Math.abs(rankOf(m.from) - rankOf(m.to));
    if (onFile ? !straight : !diag) continue;
    if ((between(m.from, m.to) || []).includes(m1.from) || m.to === m1.from) return { opened: m1.from, by: m.san };
  }
  return null;
}
D["tm-l-ouverture-de-colonne"] = (x, t) => (decisive(t) || gain(t) ? opensLine(x, ["r", "q"], true) : null);
D["tm-l-ouverture-de-diagonale"] = (x, t) => (decisive(t) || gain(t) ? opensLine(x, ["b", "q"], false) : null);

// Stratégie (Positional Mastery)
// Partie entre joueurs titrés (tags Lichess) : passe en priorité à la sélection.
const masterGame = (t) => /\bmaster(VsMaster)?\b|superGM/.test(t);
/** Avant-poste : case des rangées relatives 4-6, protégée par un pion, hors d'atteinte des pions adverses. */
const isOutpost = (c, sq, color) => rel(sq, color) >= 4 && rel(sq, color) <= 6 && defendedByPawn(c, sq, color) && !pawnCanAttack(c, sq, opp(color));
// Lot 5 : un cavalier du solveur part d'un avant-poste ou s'y installe, à n'importe quel coup de la solution.
D["pm-l-avant-poste-du-cavalier"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  for (let i = 0; i < x.mvs.length; i += 2) {
    const m = x.mvs[i];
    if (m.piece !== "n") continue;
    if (isOutpost(new Chess(x.fens[i]), m.from, x.me)) return { outpost: m.from, preferred: masterGame(t) };
    if (isOutpost(new Chess(x.fens[i + 1]), m.to, x.me)) return { outpost: m.to, preferred: masterGame(t) };
  }
  return null;
};
D["pm-la-case-faible-dans-le-camp-adverse"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  for (let i = 0; i < x.mvs.length; i += 2) {
    const m = x.mvs[i];
    if (m.piece === "p" || m.piece === "k" || m.piece === "n") continue; // le cavalier relève de l'avant-poste
    if (rel(m.to, x.me) < 6) continue;
    const c = new Chess(x.fens[i]);
    if (!pawnCanAttack(c, m.to, x.them) && (i === 0 || /[+#]/.test(m.san))) return { hole: m.to };
  }
  return null;
};
/**
 * Mauvais fou (Silman, « Reassess Your Chess » : fou gêné par ses propres pions
 * fixés sur sa couleur). L'adversaire n'a qu'un fou, ≥ 4 de ses pions sont sur
 * la couleur de ce fou dont ≥ 2 bloqués par un pion du solveur. Puis, au choix :
 * le solveur capture ce fou, ou TOUS ses coups de pièce frappent l'autre couleur
 * (celle que le fou ne défendra jamais) dans le camp adverse.
 */
function badBishopOf(c, color) {
  const bs = pieces(c, color, "b");
  if (bs.length !== 1) return null;
  const b = bs[0].square, fwd = color === "w" ? 1 : -1;
  const same = pawnsOf(c, color).filter((p) => isLight(p) === isLight(b));
  const fixed = same.filter((p) => { const s = sqOf(fileOf(p), rankOf(p) + fwd); const q = s && c.get(s); return q && q.type === "p" && q.color === opp(color); });
  return same.length >= 4 && fixed.length >= 2 ? { square: b, light: isLight(b), blockers: same.length } : null;
}
D["pm-le-mauvais-fou"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  const bad = badBishopOf(x.start, x.them);
  if (!bad) return null;
  if (x.mvs.some((m, i) => i % 2 === 0 && m.captured === "b" && m.to === bad.square)) return { badBishop: bad.square, blockers: bad.blockers, preferred: masterGame(t) };
  const pieceMoves = x.solver.filter((m) => m.piece !== "p");
  if (pieceMoves.length && pieceMoves.every((m) => isLight(m.to) !== bad.light && rel(m.to, x.me) >= 5)) return { badBishop: bad.square, otherColour: true, preferred: masterGame(t) };
  return null;
};
/**
 * Cavalier contre fou qui domine : seul déséquilibre de pièces mineures = un
 * cavalier du solveur contre un fou adverse (mauvais au sens ci-dessus), pas de
 * Dame ; le cavalier joue au moins un coup de la solution gagnante.
 */
D["pm-cavalier-contre-fou-qui-domine"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  const n = (c, col) => pieces(c, col, "n").length, b = (c, col) => pieces(c, col, "b").length;
  if (n(x.start, x.me) !== 1 || b(x.start, x.me) !== 0 || n(x.start, x.them) !== 0 || b(x.start, x.them) !== 1) return null;
  if (pieces(x.start, null, "q").length) return null;
  if (!badBishopOf(x.start, x.them)) return null;
  return x.solver.some((m) => m.piece === "n") ? { preferred: masterGame(t) } : null;
};
/**
 * Pions pendants (Flores Rios, « Chess Structures », ch. 2) : pions c et d d'un
 * camp côte à côte sur la même rangée (c4-d4 / c5-d5), sans pion de ce camp sur
 * les colonnes b et e. La solution pousse l'un d'eux (camp des pions pendants)
 * ou en capture un (camp adverse).
 */
D["pm-les-pions-pendants"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  for (const color of ["w", "b"]) {
    const ps = pawnsOf(x.start, color), r = color === "w" ? "4" : "5";
    if (!ps.includes("c" + r) || !ps.includes("d" + r) || ps.some((p) => "be".includes(p[0]))) continue;
    if (ps.filter((p) => "cd".includes(p[0])).length !== 2) continue;
    const pair = ["c" + r, "d" + r];
    const push = color === x.me && x.solver.some((m) => m.piece === "p" && pair.includes(m.from));
    const hit = color === x.them && x.solver.some((m) => m.captured === "p" && pair.includes(m.to));
    if (push || hit) return { hanging: pair.join("-"), side: color, preferred: masterGame(t) };
  }
  return null;
};
/**
 * Doubler les pions adverses : un coup du solveur capture une pièce, l'adversaire
 * reprend avec un pion sur une colonne où il avait déjà un pion — la solution
 * gagne quand même (le doublement fait partie du gain).
 */
D["pm-doubler-les-pions-adverses"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  for (let i = 1; i < x.mvs.length; i += 2) {
    const m = x.mvs[i], prev = x.mvs[i - 1];
    if (m.piece !== "p" || !m.captured || m.to !== prev.to || prev.piece === "p") continue;
    const before = new Chess(x.fens[i]);
    if (pawnsOf(before, x.them).some((p) => p[0] === m.to[0])) return { doubled: m.to[0], preferred: masterGame(t) };
  }
  return null;
};
/** Pion passé protégé : le solveur en a un au départ (aucun pion adverse devant, sur sa colonne ou les voisines ; protégé par un pion) et la solution le fait avancer. */
function isPassed(c, sq, color) {
  const f = fileOf(sq), r = rankOf(sq);
  return !pawnsOf(c, opp(color)).some((p) => Math.abs(fileOf(p) - f) <= 1 && (color === "w" ? rankOf(p) > r : rankOf(p) < r));
}
D["pm-le-pion-passe-protege"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  for (const p of pawnsOf(x.start, x.me)) {
    if (!isPassed(x.start, p, x.me) || !defendedByPawn(x.start, p, x.me) || rel(p, x.me) < 4) continue;
    if (x.solver.some((m) => m.piece === "p" && m.from === p)) return { passed: p, preferred: masterGame(t) };
  }
  return null;
};
D["pm-le-pion-isole-de-la-dame"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  for (const color of ["w", "b"]) {
    const ps = pawnsOf(x.start, color), d = color === "w" ? "d4" : "d5";
    if (!ps.includes(d) || ps.some((p) => p[0] === "c" || p[0] === "e") || ps.filter((p) => p[0] === "d").length !== 1) continue;
    const brk = color === x.me && x.mvs.some((m, i) => i % 2 === 0 && m.from === d && m.piece === "p");
    const win = color === x.them && x.mvs.some((m, i) => i % 2 === 0 && m.to === d && m.captured === "p");
    if (brk || win) return { iqp: d, plan: brk ? "rupture d4-d5" : "gain du pion isolé" };
  }
  return null;
};
const pawnsOnFile = (c, f) => pieces(c, null, "p").filter((p) => p.square[0] === f);
D["pm-la-colonne-ouverte"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  const m1 = x.mvs[0];
  if (!["r", "q"].includes(m1.piece) || m1.from[0] !== m1.to[0] || pawnsOnFile(x.start, m1.from[0]).length) return null;
  return rel(m1.to, x.me) >= 7 || m1.captured ? { file: m1.from[0] } : null;
};
D["pm-la-colonne-semi-ouverte"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  const m1 = x.mvs[0];
  if (m1.piece !== "r" || m1.from[0] !== m1.to[0] || !m1.captured) return null;
  const ps = pawnsOnFile(x.start, m1.from[0]);
  return !ps.some((p) => p.color === x.me) && ps.some((p) => p.color === x.them) ? { file: m1.from[0] } : null;
};

/** Tour à la 7e rangée : le 1er coup du solveur amène une Tour sur sa 7e (ou 8e) rangée relative, avec échec ou prise. */
D["pm-la-tour-a-la-7e-rangee"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  const m1 = x.mvs[0];
  return m1.piece === "r" && rel(m1.to, x.me) >= 7 && (m1.captured || /[+#]/.test(m1.san)) ? { rank: rel(m1.to, x.me), preferred: masterGame(t) } : null;
};

// Structures de pions : structure EXACTE des colonnes c à f du cours Li-Pokamp (voir COURSE_LESSONS)
const STRUCT = {
  "ps-formation-caro-kann": ["c4,d4,e2,f2", "c6,d5,e6,f7"],
  "ps-la-structure-grunfeld": ["c3,d4,e4,f2", "c5,e7,f7"],
  "ps-la-structure-stonewall": ["c4,d4,e3,f2", "c6,d5,e6,f5"],
  "ps-formation-benoni-asymetrique": ["d5,e4,f2", "c5,d6,f7"],
  "ps-formation-benoni-symetrique": ["c4,d5,f2", "c5,d6,f5"],
  "ps-structure-est-indienne-type-i": ["d5,e4,f3", "d6,e5,f7"],
  "ps-structure-est-indienne-type-iii": ["c4,d5,e4,f3", "c7,d6,e5,f4"],
  "ps-structure-est-indienne-ouverte": ["c4,e4,f2", "c6,d6,f7"],
  "ps-structure-francaise-type-i": ["c3,d3,e4,f2", "c5,d5,e6,f7"],
};
const central = (c, color) => pawnsOf(c, color).filter((p) => "cdef".includes(p[0])).sort().join(",");
for (const [id, [w, b]] of Object.entries(STRUCT)) {
  D[id] = (x, t) => (/middlegame/.test(t) && (decisive(t) || gain(t)) && central(x.start, "w") === w && central(x.start, "b") === b ? { structure: `${w} / ${b}` } : null);
}
D["ps-la-structure-grunfeld"] = (x, t) => {
  if (!/middlegame/.test(t) || !(decisive(t) || gain(t))) return null;
  const w = pawnsOf(x.start, "w"), b = pawnsOf(x.start, "b");
  const wCentral = w.filter((p) => "cde".includes(p[0])).sort().join(",");
  if (wCentral !== "c3,d4,e4" || w.some((p) => p[0] === "b")) return null;
  if (b.some((p) => p[0] === "d") || !b.some((p) => p[0] === "c")) return null;
  return { structure: "c3-d4-e4 (sans pion b) contre majorité noire, pion d échangé" };
};
D["pw-le-pion-arriere"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  const fwd = x.them === "w" ? 1 : -1;
  for (const p of pawnsOf(x.start, x.them)) {
    const f = fileOf(p), r = rankOf(p);
    const supported = pawnsOf(x.start, x.them).some((q) => Math.abs(fileOf(q) - f) === 1 && (fwd === 1 ? rankOf(q) <= r : rankOf(q) >= r));
    if (supported) continue;
    const stop = sqOf(f, r + fwd);
    if (!stop || !defendedByPawn(x.start, stop, x.me) && !pawnsOf(x.start, x.me).some((q) => Math.abs(fileOf(q) - f) === 1 && rankOf(q) === r + 2 * fwd)) continue;
    const hit = x.mvs.some((m, i) => i % 2 === 0 && ((m.to === p && m.captured === "p") || (m.to === stop && m.piece !== "p")));
    if (hit) return { backward: p, stop };
  }
  return null;
};

// Milieu de partie (NoseKnowsAll)
D["mg-les-cavaliers"] = (x, t) => (/trappedPiece/.test(t) && x.mvs.some((m, i) => i % 2 === 0 && m.captured === "n") ? {} : null);
D["mg-les-fous"] = (x, t) => {
  if (!(decisive(t) || gain(t)) || x.solver.length < 2) return null;
  const b = x.solver.filter((m) => m.piece === "b").length;
  return x.solver[0].piece === "b" && b >= Math.ceil(x.solver.length * 0.66) ? { bishopMoves: b } : null;
};
D["mg-les-tours"] = (x, t) => {
  if (!(decisive(t) || gain(t))) return null;
  const m = x.solver.find((s) => s.piece === "r" && rel(s.to, x.me) === 7 && (s.captured || /\+/.test(s.san)));
  return m && x.solver[0].piece === "r" ? { seventh: m.to } : null;
};
D["mg-toujours-sacrifier-la-qualite"] = (x, t) => (!x.mate && /crushing/.test(t) && exchangeSac(x) ? {} : null);
D["mg-cases-claires-et-cases-sombres"] = (x) => {
  if (!x.mate) return null;
  const last = x.mvs.at(-1);
  if (!["q", "b"].includes(last.piece)) return null;
  const colour = isLight(last.to);
  const theirBishopsOnColour = pieces(x.start, x.them, "b").filter((b) => isLight(b.square) === colour).length;
  const theirPawnsOther = pawnsOf(x.start, x.them).filter((p) => isLight(p) !== colour).length;
  return theirBishopsOnColour === 0 && theirPawnsOther >= 4 ? { complex: colour ? "cases claires" : "cases sombres" } : null;
};
D["mg-parle-a-tes-pieces"] = (x, t) => {
  const m1 = x.mvs[0];
  return /quietMove/.test(t) && gain(t) && !["p", "k"].includes(m1.piece) && !m1.captured && !/[+#]/.test(m1.san) ? {} : null;
};
D["mg-les-pions-ne-sont-pas-des-personnes"] = (x, t) => {
  const [m1, m2] = x.mvs;
  return m1 && m2 && m1.piece === "p" && !m1.promotion && m2.to === m1.to && decisive(t) ? {} : null;
};

// Finales
const material1 = (c, color) => pieces(c, color).map((p) => p.type).sort().join("");
D["eg-mats-de-force-ecrasante"] = (x) => {
  const m = material1(x.start, x.me);
  return x.mate && material1(x.start, x.them) === "k" && ["kr", "bbk", "bkn"].includes(m) && x.mvs.length >= 3 ? { material: m } : null;
};
D["eg-face-au-roi-seul"] = (x, t) => {
  const m = material1(x.start, x.me);
  return /crushing/.test(t) && material1(x.start, x.them) === "k" && /^kp{1,2}$/.test(m) && x.mvs.length >= 3 ? { material: m } : null;
};
D["eg-finales-de-pions-le-duel-des-rois"] = (x, t) => {
  const mine = material1(x.start, x.me), theirs = material1(x.start, x.them);
  return /crushing/.test(t) && /^kp+$/.test(mine) && /^kp+$/.test(theirs) && x.solver[0].piece === "k" && x.mvs.length >= 3 ? {} : null;
};

// Filtre optionnel : ONLY=th1,th2  MINPOP / MINPLAYS (défaut 75 / 100)
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
if (ONLY) for (const k of Object.keys(D)) if (!ONLY.has(k)) delete D[k];
const MINPOP = Number(process.env.MINPOP ?? 75), MINPLAYS = Number(process.env.MINPLAYS ?? 100);
// ── Passe unique ─────────────────────────────────────────────────────────────
const CAP = 2500;
const out = Object.fromEntries(Object.keys(D).map((k) => [k, []]));
const tagFreq = {};
let header = null, n = 0, replayed = 0;
await eachLine(csvPath, (line) => {
  if (!header) { header = line; return; }
  if (++n % 1000000 === 0) console.error(`${n} lignes, ${replayed} rejouées… ` + Object.entries(out).filter(([, v]) => v.length < 15).map(([k, v]) => `${k.slice(0, 18)}=${v.length}`).join(" "));
  const [id, fen, movesStr, rating, , popularity, nbPlays, themes, gameUrl] = line.split(",");
  if (!movesStr || !fen) return;
  for (const tg of themes.split(" ")) tagFreq[tg] = (tagFreq[tg] || 0) + 1;
  if (+popularity < MINPOP || +nbPlays < MINPLAYS) return;
  if (process.env.PREFILTER_GRUNFELD) { const rows = fen.split(" ")[0].split("/"); const r4 = rows[4].replace(/\d/g, (d) => ".".repeat(+d)); if (r4[3] !== "P" || r4[4] !== "P") return; } // préfiltre texte Grünfeld, avant tout rejeu
  const uci = movesStr.split(" ");
  if (uci.length < 3) return; // au moins 2 plis de solution
  let x;
  try { x = buildCtx(fen, uci); replayed++; } catch { return; }
  for (const [theme, fn] of Object.entries(D)) {
    if (out[theme].length >= CAP) continue;
    let info;
    try { info = fn(x, themes); } catch { info = null; }
    if (info) out[theme].push({ id, rating: +rating, popularity: +popularity, nbPlays: +nbPlays, themes, gameUrl, startFen: x.startFen, solutionSan: x.san, mate: x.mate, info });
  }
});
writeFileSync(outPath, JSON.stringify({ out, tagFreq }));
console.error(`FIN ${n} lignes, ${replayed} rejouées`);
for (const [k, v] of Object.entries(out)) console.error(`${k}: ${v.length}`);
