// Pré-passe des sources de cours d'ouverture : évalue CHAQUE nœud (mêmes réglages que
// _tmp-build-opening-course : prof. 16, MultiPV 1, Threads 2, Hash 256) dans le cache du générateur,
// pré-rempli à l'identique (même FEN, même profondeur) depuis les caches des autres cours, puis remplace
// dans les commentaires : §E = éval du nœud, §P = éval de la position avant le coup,
// §{12.Nf5} / §{12...Nf5} = éval du nœud du chapitre portant ce coup. Les chiffres cités sont donc
// toujours ceux des nœuds. Imprime l'arbre avec les évals (Δ signalé) sur stdout.
// usage: node --import tsx scripts/_tmp-fill-evals.mts <brouillon.pgn> <sortie.pgn> <op-id.ts>
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";

const [draftPath, outPath, cacheName] = process.argv.slice(2);
const DEPTH = 16;
const CACHE_PATH = join(tmpdir(), `${cacheName}.evalcache.json`);
const cache: Record<string, string> = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {};
const others: Record<string, string> = {};
for (const f of readdirSync(tmpdir()).filter((f) => f.endsWith(".evalcache.json") && f !== `${cacheName}.evalcache.json`)) {
  Object.assign(others, JSON.parse(readFileSync(join(tmpdir(), f), "utf8")));
}
let prefilled = 0, computed = 0;
let sf: Awaited<ReturnType<typeof startEngine>> | null = null;

async function evalTag(fen: string, san: string | null): Promise<string> {
  const key = `${fen}|${DEPTH}`;
  if (cache[key]) return cache[key];
  if (others[key]) { cache[key] = others[key]; prefilled++; return cache[key]; }
  sf ??= await startEngine({ multipv: 1 });
  const turn = fen.split(" ")[1] as "w" | "b";
  const [best] = await sf.analyse(fen, DEPTH);
  let tag: string;
  if (!best) tag = san?.endsWith("#") ? `[%eval #0]` : `[%eval 0.00]`;
  else if (best.kind === "mate") tag = `[%eval #${turn === "w" ? best.v : -best.v}]`;
  else tag = `[%eval ${whitePawns(best, turn)!.toFixed(2)}]`;
  cache[key] = tag;
  computed++;
  writeFileSync(CACHE_PATH, JSON.stringify(cache));
  return tag;
}
const num = (tag: string) => { const m = tag.match(/\[%eval ([^\]]+)\]/)![1]; if (m.startsWith("#")) return { txt: `mat`, v: m === "#0" ? 0 : Number(m.slice(1)) > 0 ? 99 : -99 }; const v = Number(m); return { txt: v === 0 ? "0.00" : (v > 0 ? "+" : "") + v.toFixed(2), v }; };

type Tok = { kind: "c" | "(" | ")" | "m" | "o"; text: string; start: number; end: number };
function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === "{") { const j = s.indexOf("}", i); out.push({ kind: "c", text: s.slice(i + 1, j), start: i, end: j + 1 }); i = j + 1; continue; }
    if (ch === "(" || ch === ")") { out.push({ kind: ch, text: ch, start: i, end: i + 1 }); i++; continue; }
    let j = i; while (j < s.length && !/[\s{}()]/.test(s[j])) j++;
    const w = s.slice(i, j).replace(/^\d+\.+/, "");
    if (w && w !== "*" && !/^\$\d+$/.test(w)) out.push({ kind: "m", text: w, start: i, end: j });
    i = j;
  }
  return out;
}

const src = readFileSync(draftPath, "utf8");
const parts = src.split(/^(?=## )/m);
const outParts: string[] = [];
for (const part of parts) {
  if (!part.startsWith("## ")) { outParts.push(part); continue; }
  const nl = part.indexOf("\n");
  const title = part.slice(3, nl).trim();
  const body = part.slice(nl);
  const toks = tokenize(body);
  // pass 1 : positions
  type N = { fen: string; parentFen: string; san: string; ply: number; depth: number };
  const comments: { tok: Tok; node: N | null }[] = [];
  const nodes: N[] = [];
  let game = new Chess();
  let last: N | null = null;
  const stack: { game: Chess; last: N | null; prevFen: string; prevLast: N | null }[] = [];
  let prevFen = game.fen(); let prevLast: N | null = null; // position avant le dernier coup (pour les variantes)
  let depth = 0;
  for (const t of toks) {
    if (t.kind === "c") comments.push({ tok: t, node: last });
    else if (t.kind === "(") {
      stack.push({ game, last, prevFen, prevLast });
      game = new Chess(prevFen); last = prevLast; depth++;
    } else if (t.kind === ")") {
      ({ game, last, prevFen, prevLast } = stack.pop()!); depth--;
    } else {
      const before = game.fen();
      let mv;
      try { mv = game.move(t.text); } catch { throw new Error(`« ${title} » : coup illégal ${t.text} (position ${before})`); }
      const n: N = { fen: game.fen(), parentFen: before, san: mv.san, ply: (last?.ply ?? 0) + 1, depth };
      prevFen = before; prevLast = last;
      nodes.push(n); last = n;
    }
  }
  const evals = new Map<string, { txt: string; v: number }>();
  const ev = async (fen: string, san: string | null) => { if (!evals.has(fen)) evals.set(fen, num(await evalTag(fen, san))); return evals.get(fen)!; };
  await ev(new Chess().fen(), null);
  for (const n of nodes) await ev(n.fen, n.san);
  // dump
  console.log(`\n## ${title}`);
  for (const n of nodes) {
    const e = evals.get(n.fen)!, p = evals.get(n.parentFen)!;
    const d = e.v - p.v; const white = n.ply % 2 === 1;
    const flag = (white && d < -0.5) ? `  <<< FAUTE BLANCHE ${d.toFixed(2)}` : (!white && d > 0.4) ? `  <<< NOIR +${d.toFixed(2)}` : "";
    console.log(`${"  ".repeat(n.depth)}${Math.ceil(n.ply / 2)}${white ? "." : "..."}${n.san} ${e.txt}${flag}`);
  }
  // pass 2 : substitutions
  let rebuilt = ""; let cur = 0;
  for (const { tok, node } of comments) {
    let text = tok.text;
    if (text.includes("§")) {
      text = text.replace(/§\{(\d+)(\.\.\.|\.)([^}]+)\}/g, (_m, no, dots, san) => {
        const ply = (Number(no) - 1) * 2 + (dots === "..." ? 2 : 1);
        const hit = nodes.find((n) => n.ply === ply && n.san.replace(/[+#]$/, "") === san.replace(/[+#]$/, ""));
        if (!hit) throw new Error(`« ${title} » : §{${no}${dots}${san}} sans nœud`);
        return evals.get(hit.fen)!.txt;
      });
      if (!node && /§[EP]/.test(text)) throw new Error(`« ${title} » : §E/§P dans l'introduction`);
      if (node) text = text.replace(/§E/g, evals.get(node.fen)!.txt).replace(/§P/g, evals.get(node.parentFen)!.txt);
      if (text.includes("§")) throw new Error(`« ${title} » : marqueur inconnu dans ${text.slice(0, 60)}`);
    }
    rebuilt += body.slice(cur, tok.start) + "{" + text + "}";
    cur = tok.end;
  }
  rebuilt += body.slice(cur);
  outParts.push(`## ${title}${rebuilt}`);
}
(sf as Awaited<ReturnType<typeof startEngine>> | null)?.quit();
writeFileSync(outPath, outParts.join(""));
console.error(`écrit ${outPath} — ${prefilled} évals reprises d'autres cours (même FEN, prof. 16), ${computed} calculées`);
