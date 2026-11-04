/**
 * Générateur du Programme 1000 Heures : spec rédigée à la main + puzzles Lichess
 * filtrés et vérifiés → `src/core/programme/content/phase-<n>.json`.
 *
 *   node --import tsx scripts/programme/generate-phase.mts <phase> [select|verify|build|all]
 *
 * 1. select : une passe sur le dump officiel (`data/import/academy/lichess_db_puzzle.csv.zst`,
 *             CC0). Pour chaque jour : tags Lichess du concept + filtre géométrique
 *             (`geometry.mts`), fenêtre de rating centrée sur l'Elo cible du jour,
 *             longueur de combinaison bornée par la phase. Un puzzle et une partie
 *             d'origine ne servent qu'une fois dans TOUT le programme : ceux des
 *             phases déjà générées (`phase-<k>.json`, k < n) sont exclus.
 * 2. verify : Stockfish (`verify-worker.mts`, SHARDS processus en parallèle, 1 par défaut)
 *             sur chaque coup du solveur, avec reprise : `LIMIT=<n>` traite un lot de n
 *             candidats non encore vérifiés, puis s'arrête ; tablebase Syzygy pour les positions de ≤ 7 pièces et
 *             les positions pédagogiques construites (Lucena, Philidor).
 * 3. build  : seuls les puzzles validés entrent dans le JSON, avec squelette,
 *             solution PGN, coups équivalents et traçabilité complète.
 *
 * Fichiers intermédiaires : `data/programme/phase-<n>/` (hors dépôt).
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Chess } from "chess.js";
import type { ConstructedPosition, DaySpec } from "../../src/core/programme/content/spec-types";
import { getMetaphor } from "../../src/core/programme/metaphors";
import { blindfoldSeconds, conceptDayPlanning, getPhase, maxSolverMoves, PHASES, retentionDayPlanning, targetElo } from "../../src/core/programme/phases";
import { analyseSkeleton } from "../../src/core/programme/skeleton";
import { dayKey, type BlindfoldExercise, type PhaseId, type ProgrammeDay, type ProgrammePhaseContent, type ProgrammePuzzle, type PuzzleVerification } from "../../src/core/programme/types";
import { VISUAL_HACKS } from "../../src/core/programme/visual-hacks";
import { retentionSourceDays } from "../../src/core/programme/adaptive";
import { buildContext, matchesGeometry, pieceCount, uciMove } from "./geometry.mjs";
import { eachLine, parseRow, type LichessPuzzleRow } from "./lichess-csv.mjs";
import { categoryForMover, probe } from "./tablebase.mjs";
import type { VerifyInput, VerifyOutput } from "./verify-worker.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(here, "../..");
const CSV = resolve(WEB, "data/import/academy/lichess_db_puzzle.csv.zst");
const DEPTH = Number(process.env.DEPTH ?? 18);
const SHARDS = Number(process.env.SHARDS ?? 1);

const [phaseArg, stepArg = "all"] = process.argv.slice(2);
const phaseIndex = Number(phaseArg);
/** Spec de la phase : `phase-<n>.spec.ts` exporte `PHASE_<n>_DAYS` et `PHASE_<n>_CONSTRUCTED`. */
async function loadSpec(n: number): Promise<{ days: readonly DaySpec[]; constructed: readonly ConstructedPosition[] } | null> {
  const file = resolve(WEB, `src/core/programme/content/phase-${n}.spec.ts`);
  if (!Number.isInteger(n) || n < 1 || n > PHASES.length || !existsSync(file)) return null;
  const mod = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
  return { days: mod[`PHASE_${n}_DAYS`] as readonly DaySpec[], constructed: mod[`PHASE_${n}_CONSTRUCTED`] as readonly ConstructedPosition[] };
}
function usage(): never {
  console.error(`usage: generate-phase.mts <phase> [select|verify|build|all] — phase 1 à ${PHASES.length}, avec src/core/programme/content/phase-<n>.spec.ts`);
  process.exit(1);
}
const spec = (await loadSpec(phaseIndex)) ?? usage();
const phase = PHASES[phaseIndex - 1];
const OUT = resolve(WEB, `data/programme/phase-${phaseIndex}`);
mkdirSync(OUT, { recursive: true });

// Quotas par jour de concept : 6 puzzles par défaut + réserve adaptative.
const QUOTA = { mid: 13, low: 5, high: 5, blind: 3 };
const CAP = 80;
const MIN_POPULARITY = 80;
const MIN_PLAYS = 150;
const MAX_RD = 100;
/**
 * Coups du solveur au plus pour un blindfold : 2, ou le minimum de la phase
 * quand il est plus grand (phases 4 et 5 : aucune combinaison de moins de 3 coups).
 */
const BLIND_MAX_SOLVER = Math.max(2, phase.soloMoves.min);

/** Puzzles déjà servis par les phases générées avant celle-ci (jamais deux fois dans le programme). */
function previousPhasePuzzleIds(): Set<string> {
  const ids = new Set<string>();
  for (let k = 1; k < phaseIndex; k += 1) {
    const file = resolve(WEB, `src/core/programme/content/phase-${k}.json`);
    if (!existsSync(file)) throw new Error(`Phase ${k} absente (${file}) : générer les phases dans l'ordre.`);
    const content = JSON.parse(readFileSync(file, "utf8")) as ProgrammePhaseContent;
    for (const d of content.jours) {
      for (const p of [...d.puzzles, ...(d.reserve ?? [])]) ids.add(p.puzzle_id);
      if (d.exercice_blindfold) ids.add(d.exercice_blindfold.puzzle_id);
    }
  }
  return ids;
}

type Band = "mid" | "low" | "high";
interface Candidate {
  id: string;
  row: LichessPuzzleRow;
  gameId: string;
  match: "geometry" | "tags";
  band: Band | "blind";
}
interface SelectedDay {
  key: string;
  semaine: number;
  jour: number;
  target: number;
  picks: Candidate[];
  constructed: { id: string; fen: string; ligne: string[]; description: string }[];
}

const gameIdOf = (url: string) => /lichess\.org\/(?:game\/)?([A-Za-z0-9]{8})/.exec(url)?.[1] ?? url;

function themesMatch(themes: string[], any: string[], all?: string[], none?: string[]) {
  if (any.length && !any.some((t) => themes.includes(t))) return false;
  if (all && !all.every((t) => themes.includes(t))) return false;
  if (none && none.some((t) => themes.includes(t))) return false;
  return true;
}

// ── 1. Sélection ─────────────────────────────────────────────────────────────
async function select() {
  if (!existsSync(CSV)) throw new Error(`Dump Lichess introuvable : ${CSV} (https://database.lichess.org/#puzzles)`);
  const concept = spec.days.filter((d) => d.sourcing);
  const buckets = new Map<string, Record<string, Candidate[]>>();
  for (const d of concept) buckets.set(dayKey(d.semaine, d.jour), { geo_mid: [], geo_low: [], geo_high: [], fb_mid: [], fb_low: [], fb_high: [], blind: [] });
  const minRating = Math.min(...concept.map((d) => targetElo(d.semaine, d.jour))) - 300;
  const maxRating = Math.max(...concept.map((d) => targetElo(d.semaine, d.jour))) + 200;

  // Exclusion inter-phases : les puzzles déjà servis, et leurs parties d'origine (relevées pendant la passe).
  const previousIds = previousPhasePuzzleIds();
  const previousGames = new Set<string>();
  console.error(`${previousIds.size} puzzles des phases précédentes exclus.`);
  let rows = 0, replayed = 0, errors = 0;
  const maxRows = Number(process.env.MAXROWS ?? Infinity);
  await eachLine(CSV, (line: string) => {
    if (rows >= maxRows) return;
    try {
      scanRow(line);
    } catch (err) {
      if (errors++ < 3) console.error("erreur de ligne :", err);
    }
  });
  function scanRow(line: string) {
    const row = parseRow(line);
    if (!row) return;
    rows += 1;
    if (previousIds.has(row.id)) {
      previousGames.add(gameIdOf(row.gameUrl));
      return;
    }
    if (row.popularity < MIN_POPULARITY || row.nbPlays < MIN_PLAYS || row.ratingDeviation > MAX_RD) return;
    if (row.rating < minRating || row.rating > maxRating) return;
    const solver = row.moves.length / 2;
    let ctx: ReturnType<typeof buildContext> | undefined;
    for (const d of concept) {
      const s = d.sourcing!;
      const T = targetElo(d.semaine, d.jour);
      if (row.rating < T - 300 || row.rating > T + 200) continue;
      if (solver < phase.soloMoves.min || solver > maxSolverMoves(d.semaine, d.jour)) continue;
      const primaryTags = themesMatch(row.themes, s.anyThemes, s.allThemes, s.noThemes);
      const fallbackTags = !!s.fallbackThemes && themesMatch(row.themes, s.fallbackThemes, undefined, s.noThemes);
      if (!primaryTags && !fallbackTags) continue;
      const b = buckets.get(dayKey(d.semaine, d.jour))!;
      let geo = primaryTags && !s.geometry;
      if (primaryTags && s.geometry) {
        if (ctx === undefined) {
          ctx = buildContext(row.fen, row.moves);
          replayed += 1;
        }
        geo = !!ctx && matchesGeometry(s.geometry, ctx);
      }
      if (!geo && !fallbackTags) continue;
      const delta = row.rating - T;
      const band: Band | null = Math.abs(delta) <= 100 ? "mid" : delta < -100 && delta >= -200 ? "low" : delta > 100 ? "high" : null;
      const cand: Candidate = { id: row.id, row, gameId: gameIdOf(row.gameUrl), match: geo ? "geometry" : "tags", band: band ?? "blind" };
      if (band) {
        const list = b[`${geo ? "geo" : "fb"}_${band}`];
        if (list.length < CAP) list.push(cand);
      }
      if (solver <= BLIND_MAX_SOLVER && delta <= 0 && pieceCount(row.fen) <= 13 && b.blind.length < CAP) b.blind.push({ ...cand, band: "blind" });
    }
    if (rows % 500_000 === 0) console.error(`… ${rows} lignes lues, ${replayed} rejouées`);
  }
  console.error(`${rows} lignes lues, ${replayed} rejouées, ${previousGames.size} parties des phases précédentes exclues.`);

  // Attribution : jours les plus pauvres d'abord, aucun puzzle ni partie deux fois (phases précédentes comprises).
  const usedIds = new Set<string>(previousIds), usedGames = new Set<string>(previousGames);
  const ordered = [...concept].sort((a, b) => {
    const n = (d: DaySpec) => Object.entries(buckets.get(dayKey(d.semaine, d.jour))!).filter(([k]) => k.startsWith("geo")).reduce((s, [, v]) => s + v.length, 0);
    return n(a) - n(b);
  });
  const selected: SelectedDay[] = [];
  for (const d of ordered) {
    const key = dayKey(d.semaine, d.jour);
    const T = targetElo(d.semaine, d.jour);
    const b = buckets.get(key)!;
    const picks: Candidate[] = [];
    const take = (list: Candidate[], n: number, band: Candidate["band"]) => {
      const sorted = [...list].sort((x, y) => Math.abs(x.row.rating - T) - Math.abs(y.row.rating - T) || y.row.popularity - x.row.popularity);
      let got = 0;
      for (const c of sorted) {
        if (got >= n) break;
        if (usedIds.has(c.id) || usedGames.has(c.gameId)) continue;
        usedIds.add(c.id);
        usedGames.add(c.gameId);
        picks.push({ ...c, band });
        got += 1;
      }
      return got;
    };
    for (const band of ["mid", "low", "high"] as Band[]) {
      const got = take(b[`geo_${band}`], QUOTA[band], band);
      if (got < QUOTA[band]) take(b[`fb_${band}`], QUOTA[band] - got, band);
    }
    take(b.blind, QUOTA.blind, "blind");
    const constructed = (d.sourcing?.construites ?? []).flatMap((id) => variants(spec.constructed.find((c) => c.id === id)!));
    const counts = { geo: picks.filter((p) => p.match === "geometry").length, tags: picks.filter((p) => p.match === "tags").length };
    console.error(`${key} (${d.concept}) : ${picks.length} candidats — géométrie ${counts.geo}, repli tags ${counts.tags}, construits ${constructed.length}`);
    selected.push({ key, semaine: d.semaine, jour: d.jour, target: T, picks, constructed });
  }
  writeFileSync(resolve(OUT, "selected.json"), JSON.stringify(selected));
  const verify: VerifyInput[] = selected.flatMap((d) =>
    d.picks.map((p) => {
      const ctx = buildContext(p.row.fen, p.row.moves)!;
      return { key: p.id, fen: ctx.startFen, solutionUci: p.row.moves.slice(1) };
    }),
  );
  writeFileSync(resolve(OUT, "verify-in.json"), JSON.stringify(verify));
  console.error(`${verify.length} puzzles à vérifier.`);
}

// ── Positions construites : symétries ────────────────────────────────────────
function mirrorFileFen(fen: string) {
  const [board, ...rest] = fen.split(" ");
  const expanded = board.split("/").map((r) => r.replace(/\d/g, (n) => "1".repeat(Number(n))).split("").reverse().join(""));
  return [expanded.map(compress).join("/"), ...rest].join(" ");
}
function colorFlipFen(fen: string) {
  const [board, turn, , , half, full] = fen.split(" ");
  const flipped = board.split("/").reverse().map((r) => r.replace(/[a-zA-Z]/g, (c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))).join("/");
  return [flipped, turn === "w" ? "b" : "w", "-", "-", half, full].join(" ");
}
function compress(rank: string) {
  return rank.replace(/1+/g, (m) => String(m.length));
}
const mirrorUci = (u: string) => u.replace(/[a-h]/g, (f) => "hgfedcba"["abcdefgh".indexOf(f)]);
const flipUci = (u: string) => u.replace(/[1-8]/g, (r) => String(9 - Number(r)));

function variants(c: ConstructedPosition) {
  return [
    { id: c.id, fen: c.fen, ligne: c.ligne, description: c.description },
    { id: `${c.id}-sym`, fen: mirrorFileFen(c.fen), ligne: c.ligne.map(mirrorUci), description: c.description },
    { id: `${c.id}-inv`, fen: colorFlipFen(c.fen), ligne: c.ligne.map(flipUci), description: c.description },
    { id: `${c.id}-sym-inv`, fen: colorFlipFen(mirrorFileFen(c.fen)), ligne: c.ligne.map((u) => flipUci(mirrorUci(u))), description: c.description },
  ];
}

// ── 2. Vérification ──────────────────────────────────────────────────────────
async function verify() {
  const input = resolve(OUT, "verify-in.json");
  const workers = Array.from({ length: SHARDS }, (_, i) =>
    new Promise<void>((resolveRun, reject) => {
      const child = spawn(process.execPath, ["--import", "tsx", resolve(here, "verify-worker.mts"), input, resolve(OUT, `verify-${i}.jsonl`), String(DEPTH)], {
        env: { ...process.env, SHARD: `${i}/${SHARDS}` },
        stdio: ["ignore", "inherit", "inherit"],
        cwd: WEB,
      });
      child.on("exit", (code) => (code === 0 ? resolveRun() : reject(new Error(`vérificateur ${i} : code ${code}`))));
    }),
  );
  await Promise.all(workers);
}

// ── 3. Construction du JSON ──────────────────────────────────────────────────
function solutionPgn(fen: string, uci: readonly string[]): string {
  const c = new Chess(fen);
  let moveNo = Number(fen.split(" ")[5] ?? 1);
  const parts: string[] = [];
  uci.forEach((u, i) => {
    const turn = c.turn();
    const san = c.move(uciMove(u)).san;
    if (turn === "w") parts.push(`${moveNo}. ${san}`);
    else {
      parts.push(i === 0 ? `${moveNo}... ${san}` : san);
      moveNo += 1;
    }
  });
  return parts.join(" ");
}

const today = new Date().toISOString().slice(0, 10);

async function tablebaseCheck(startFen: string, uci: readonly string[]): Promise<"win" | "draw" | "loss" | null | false> {
  if (pieceCount(startFen) > 7) return null;
  const c = new Chess(startFen);
  const root = await probe(startFen);
  const rootCat = root.category === "win" ? "win" : root.category === "loss" ? "loss" : "draw";
  for (let i = 0; i < uci.length; i += 1) {
    if (i % 2 === 0 && pieceCount(c.fen()) <= 7) {
      const tb = i === 0 ? root : await probe(c.fen());
      const move = tb.moves.find((m) => m.uci === uci[i]);
      if (!move || categoryForMover(move) !== rootCat) return false;
    }
    c.move(uciMove(uci[i]));
  }
  return rootCat;
}

async function buildConstructed(pos: SelectedDay["constructed"][number], target: number): Promise<ProgrammePuzzle | null> {
  const c = new Chess(pos.fen);
  const root = await probe(pos.fen);
  const expected = root.category === "win" ? "win" : root.category === "draw" ? "draw" : null;
  if (!expected) return null;
  const alternatives: string[][] = [];
  for (let i = 0; i < pos.ligne.length; i += 1) {
    const u = pos.ligne[i];
    if (i % 2 === 0) {
      const tb = i === 0 ? root : await probe(c.fen());
      const move = tb.moves.find((m) => m.uci === u);
      if (!move || categoryForMover(move) !== expected) {
        console.error(`✗ ${pos.id} : ${u} ne garde pas « ${expected} » (tablebase)`);
        return null;
      }
      const metric = (m: typeof move) => Math.abs(m.dtm ?? m.dtz ?? 0);
      // Gain : coups aussi rapides que celui de la ligne. Nulle : tout coup que la tablebase juge nul tient la position.
      alternatives.push(
        tb.moves
          .filter((m) => m.uci !== u && categoryForMover(m) === expected && (expected === "draw" || metric(m) <= metric(move)))
          .map((m) => m.uci),
      );
    } else alternatives.push([]);
    try {
      c.move(uciMove(u));
    } catch {
      console.error(`✗ ${pos.id} : ${u} illégal`);
      return null;
    }
  }
  const skeleton = analyseSkeleton(pos.fen, pos.ligne);
  return {
    source: "position_pedagogique",
    puzzle_id: `construite:${pos.id}`,
    url: `https://syzygy-tables.info/?fen=${encodeURIComponent(pos.fen)}`,
    fen: pos.fen,
    theme_lichess: ["rookEndgame"],
    rating_lichess: target,
    squelette_attendu: `Position pédagogique construite (${pos.description}) ${skeleton.description}`,
    squelette_cases: skeleton.squares,
    squelette_coeur: skeleton.core,
    solution_pgn: solutionPgn(pos.fen, pos.ligne),
    solution_uci: pos.ligne,
    alternatives,
    verification: { moteur: "tablebase Syzygy (tablebase.lichess.ovh)", profondeur: 0, eval_initiale: expected === "win" ? "gain (TB)" : "nulle (TB)", tablebase: expected, verifie_le: today },
  };
}

async function build() {
  const selected = JSON.parse(readFileSync(resolve(OUT, "selected.json"), "utf8")) as SelectedDay[];
  const results = new Map<string, VerifyOutput>();
  for (let i = 0; i < SHARDS; i += 1) {
    const file = resolve(OUT, `verify-${i}.jsonl`);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n").filter(Boolean)) {
      try {
        const r = JSON.parse(line) as VerifyOutput;
        results.set(r.key, r);
      } catch {
        // ligne tronquée par un lot interrompu : ignorée
      }
    }
  }
  const byKey = new Map(selected.map((d) => [d.key, d]));
  const toPuzzle = async (c: Candidate): Promise<ProgrammePuzzle | null> => {
    const r = results.get(c.id);
    if (!r?.ok) return null;
    const ctx = buildContext(c.row.fen, c.row.moves)!;
    const solution = c.row.moves.slice(1);
    let tablebase: "win" | "draw" | "loss" | undefined;
    const tb = await tablebaseCheck(ctx.startFen, solution).catch(() => null);
    if (tb === false) {
      console.error(`✗ ${c.id} : réfuté par la tablebase`);
      return null;
    }
    if (tb) tablebase = tb;
    const skeleton = analyseSkeleton(ctx.startFen, solution);
    const verification: PuzzleVerification = { moteur: "Stockfish 18 (lite, single)", profondeur: DEPTH, eval_initiale: r.firstEval, ...(tablebase ? { tablebase } : {}), verifie_le: today };
    return {
      source: "lichess_puzzle_db",
      puzzle_id: c.id,
      url: `https://lichess.org/training/${c.id}`,
      fen: ctx.startFen,
      coup_installation: { uci: c.row.moves[0], san: ctx.setup.san, fen_avant: ctx.setupFen },
      theme_lichess: c.row.themes,
      rating_lichess: c.row.rating,
      squelette_attendu: skeleton.description,
      squelette_cases: skeleton.squares,
      squelette_coeur: skeleton.core,
      solution_pgn: solutionPgn(ctx.startFen, solution),
      solution_uci: solution,
      alternatives: r.alternatives.some((a) => a.length) ? r.alternatives : undefined,
      verification,
    };
  };
  const toBlindfold = (p: ProgrammePuzzle, d: { semaine: number; jour: number }, concept: string): BlindfoldExercise => {
    const turn = p.fen.split(" ")[1] === "w" ? "les Blancs" : "les Noirs";
    return {
      source: p.source,
      puzzle_id: p.puzzle_id,
      url: p.url,
      fen_affichee_une_fois: p.fen,
      duree_affichage_s: blindfoldSeconds(d.semaine, d.jour),
      consigne_calcul: `Observe la position pendant ${blindfoldSeconds(d.semaine, d.jour)} secondes : ${turn} jouent. Elle disparaît ensuite. Thème : ${concept}. Calcule mentalement la combinaison complète, puis écris-la en notation algébrique (coups du solveur ET réponses adverses).`,
      solution: p.solution_pgn,
      solution_uci: p.solution_uci,
      rating_lichess: p.rating_lichess,
      verification: p.verification,
    };
  };

  const days: ProgrammeDay[] = [];
  const leftoverBlind = new Map<number, ProgrammePuzzle[]>();
  // Rotation continue sur tout le programme : le 1er jour d'une phase ne reprend pas le hack de la veille.
  let hackIndex = (phase.semaineDebut - 1) * 7;
  const report: string[] = [];
  for (const d of spec.days) {
    const key = dayKey(d.semaine, d.jour);
    const T = targetElo(d.semaine, d.jour);
    const metaphor = getMetaphor(d.metaphore_id);
    const hack = VISUAL_HACKS[(hackIndex++ * 5) % VISUAL_HACKS.length];
    const partie = d.jour === 7
      ? `Partie longue (30+0) contre un bot réglé vers ${T} (onglet « Jouer contre des Bots »), puis annotation : ${d.focus_partie}`
      : `Partie lente (15+10) contre un bot réglé vers ${T} (onglet « Jouer contre des Bots »), puis 10 min d'analyse : ${d.focus_partie}`;
    let puzzles: ProgrammePuzzle[] = [];
    let reserve: ProgrammePuzzle[] = [];
    let blindfold: BlindfoldExercise | null = null;
    const sel = byKey.get(key);
    if (sel) {
      const verified: Record<string, ProgrammePuzzle[]> = { mid: [], low: [], high: [], blind: [] };
      for (const c of sel.picks) {
        const p = await toPuzzle(c);
        if (p) verified[c.band].push(p);
      }
      // Relu depuis la spec (pas depuis selected.json) : corriger une position construite ne demande pas de relancer `select`.
      const positions = (d.sourcing?.construites ?? []).flatMap((id) => variants(spec.constructed.find((c) => c.id === id)!));
      const constructed = (await Promise.all(positions.map((c) => buildConstructed(c, T)))).filter((p): p is ProgrammePuzzle => !!p);
      const nearest = (list: ProgrammePuzzle[]) => [...list].sort((a, b) => Math.abs(a.rating_lichess - T) - Math.abs(b.rating_lichess - T));
      const pool = [...constructed.slice(0, 3), ...nearest(verified.mid), ...nearest([...verified.low, ...verified.high])];
      puzzles = pool.slice(0, 6).sort((a, b) => a.rating_lichess - b.rating_lichess);
      reserve = [...pool.slice(6), ...constructed.slice(3)].slice(0, 16);
      const blind = verified.blind.sort((a, b) => a.rating_lichess - b.rating_lichess);
      if (blind[0]) blindfold = toBlindfold(blind[0], d, d.concept);
      else {
        // Repli : le puzzle vérifié le plus court (≤ 2 coups du solveur, le moins de pièces) de la réserve.
        // Sinon (jour dont toutes les combinaisons sont longues, ex. mats en 3) : la plus courte de la réserve.
        const byLength = (a: ProgrammePuzzle, b: ProgrammePuzzle) => a.solution_uci.length - b.solution_uci.length || pieceCount(a.fen) - pieceCount(b.fen);
        const short = reserve.filter((p) => p.solution_uci.length <= 2 * BLIND_MAX_SOLVER - 1).sort(byLength)[0] ?? [...reserve].sort(byLength)[0];
        if (short) {
          blindfold = toBlindfold(short, d, d.concept);
          reserve = reserve.filter((p) => p !== short);
        }
      }
      leftoverBlind.set(d.semaine, [...(leftoverBlind.get(d.semaine) ?? []), ...blind.slice(1)]);
      report.push(`${key} ${d.concept} : ${puzzles.length} puzzles, réserve ${reserve.length}, blindfold ${blindfold ? "oui" : "NON"} (construites ${constructed.length}/${positions.length})`);
    } else {
      const spare = leftoverBlind.get(d.semaine)?.[0];
      if (spare) blindfold = toBlindfold(spare, d, "thèmes de la semaine");
      report.push(`${key} rétention : blindfold ${blindfold ? "oui" : "NON"}`);
    }
    days.push({
      phase: phase.id as PhaseId,
      semaine: d.semaine,
      jour: d.jour,
      theme_metaphore: d.theme_metaphore,
      metaphore_id: d.metaphore_id,
      concept_echiquéen: d.concept,
      elo_cible: T,
      planning_4h: d.jour === 7 ? retentionDayPlanning(partie) : conceptDayPlanning(d.concept, partie),
      cours_palais_memoire: { texte: `${metaphor.image} ${d.cours}`, ancrage_sensoriel: d.ancrage_sensoriel, rappels: d.rappels },
      hack_visuel: { id: hack.id, consigne: hack.consigne, mecanisme_neuro: hack.mecanisme_neuro },
      puzzles,
      reserve,
      exercice_blindfold: blindfold,
      reconsolidation: { ...d.reconsolidation, ...(d.jour === 7 ? { jours_source: retentionSourceDays(d.semaine) } : {}) },
      checklist: d.checklist,
    });
  }
  const content: ProgrammePhaseContent = {
    phase: getPhase(phase.id as PhaseId).id,
    genere_le: today,
    sources: [
      "Base officielle des puzzles Lichess (lichess_db_puzzle.csv, CC0) — https://database.lichess.org/#puzzles",
      `Stockfish 18 (lite, single), profondeur ${DEPTH}, MultiPV 3`,
      "Tablebase Syzygy — https://tablebase.lichess.ovh",
    ],
    jours: days,
  };
  const target = resolve(WEB, `src/core/programme/content/phase-${phaseIndex}.json`);
  writeFileSync(target, `${JSON.stringify(content, null, 1)}\n`);
  writeFileSync(resolve(OUT, "report.txt"), report.join("\n"));
  console.error(report.join("\n"));
  console.error(`→ ${target}`);
}

if (stepArg === "select" || stepArg === "all") await select();
if (stepArg === "verify" || stepArg === "all") await verify();
if (stepArg === "build" || stepArg === "all") await build();
