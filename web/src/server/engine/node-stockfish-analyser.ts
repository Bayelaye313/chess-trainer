import "server-only";

/**
 * Stockfish 18 côté Node, pour l'analyse en tâche de fond (import en masse).
 *
 * Distinct de `StockfishEngine` (navigateur, Worker + postMessage) : ici tout
 * tourne dans le même process via l'API Node du package `stockfish`
 * (`sendCommand` / `listener`, pas d'événements `message`). La logique de
 * file d'attente et de collecte de lignes est nécessairement dupliquée —
 * les deux transports (Worker vs callback direct) ne se laissent pas unifier
 * sans une couche d'abstraction que la taille du projet ne justifie pas.
 *
 * Le package n'a pas de types publiés ; `require()` dynamique plutôt qu'un
 * import statique, pour ne jamais le tirer dans un bundle client par erreur.
 *
 * **Une seule instance par process, pour toute sa durée de vie.** Constaté en
 * usage réel : appeler `initEngine()` une seconde fois dans le même process
 * Node fait planter tout le serveur (`WebAssembly.instantiate(): LinkError:
 * memory import must be a WebAssembly.Memory object`) — le module généré par
 * Emscripten porte un état global qui ne supporte pas d'être ré-instancié. Un
 * `Worker` navigateur se termine et se recrée sans souci ; ce module Node ne
 * le supporte pas. D'où `getNodeStockfishAnalyser()` (singleton) plutôt qu'un
 * `new NodeStockfishAnalyser()` par job, et l'absence volontaire de toute
 * méthode `dispose()`.
 */
import { createRequire } from "node:module";
import { goCommand, parseBestMove, parseInfoLine } from "@/core/engine/uci";
import type { AnalysisLimit, EngineLine, PositionAnalyser, PositionEvaluation } from "@/core/analysis/types";

const require = createRequire(import.meta.url);

interface NodeEngineHandle {
  sendCommand(command: string): void;
  listener: ((line: string) => void) | null;
}

type InitEngine = (build?: string) => Promise<NodeEngineHandle>;

const initEngine = require("stockfish") as InitEngine;

/**
 * Capturé AVANT tout appel à `initEngine()` : son shim de compatibilité Node
 * met `global.fetch = null` en pensant s'exécuter sur un vieux Node sans
 * fetch natif (voir le bundle Emscripten — un bloc dédié à l'environnement
 * Node y force ce nettoyage). Sur le Node moderne qu'on utilise, ça casse
 * silencieusement tout fetch() fait ailleurs dans le process après coup —
 * en particulier les connecteurs d'import (`chesscom.ts`, `lichess.ts`).
 * Restaurée juste après chaque initialisation, voir `initialize()`.
 */
const originalFetch: typeof fetch = globalThis.fetch;

/** Analyse de fond : plus généreux que l'interactif, une recherche profonde ne doit pas être coupée. */
const COMMAND_TIMEOUT_MS = 60_000;

const EMPTY_EVALUATION: PositionEvaluation = {
  cp: null,
  mate: null,
  bestMoveUci: null,
  pv: [],
  depth: 0,
  secondBest: null,
  lines: [],
};

function sideToMoveIsWhite(fen: string): boolean {
  return fen.split(" ")[1] !== "b";
}

export class NodeStockfishAnalyser implements PositionAnalyser {
  private handlePromise: Promise<NodeEngineHandle> | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  private getHandle(): Promise<NodeEngineHandle> {
    if (!this.handlePromise) this.handlePromise = this.initialize();
    return this.handlePromise;
  }

  private async initialize(): Promise<NodeEngineHandle> {
    // "lite-single" : suffisant pour une analyse de fond, et la seule build
    // dont le chemin de résolution du package Node est éprouvé (smoke:engine).
    const handle = await initEngine("lite-single");
    if (!globalThis.fetch) globalThis.fetch = originalFetch;
    const uciok = this.collect(handle, (line) => (line === "uciok" ? true : undefined));
    handle.sendCommand("uci");
    await uciok;
    // Deuxième ligne de recherche en permanence : détecte les positions
    // « critiques » (un seul bon coup) sans changer quel coup est retenu —
    // voir le commentaire équivalent dans stockfish-engine.ts (navigateur).
    handle.sendCommand("setoption name MultiPV value 2");
    await this.awaitReady(handle);
    return handle;
  }

  private async awaitReady(handle: NodeEngineHandle): Promise<void> {
    const readyok = this.collect(handle, (line) => (line === "readyok" ? true : undefined));
    handle.sendCommand("isready");
    await readyok;
  }

  /**
   * Écoute jusqu'à ce que `handleLine` renvoie une valeur. Le package Node
   * n'expose qu'un seul `listener` à la fois — sûr ici car `enqueue()`
   * garantit qu'un seul appel est en vol.
   */
  private collect<T>(handle: NodeEngineHandle, handleLine: (line: string) => T | undefined): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        handle.listener = null;
        reject(new Error("Le moteur (import) n'a pas répondu à temps."));
      }, COMMAND_TIMEOUT_MS);

      handle.listener = (line) => {
        const result = handleLine(line);
        if (result === undefined) return;
        clearTimeout(timeout);
        handle.listener = null;
        resolve(result);
      };
    });
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(task, task);
    this.queue = result.catch(() => undefined);
    return result;
  }

  /** À appeler entre deux parties d'un même job, pour vider les tables de hachage. */
  newGame(): Promise<void> {
    return this.enqueue(async () => {
      const handle = await this.getHandle();
      handle.sendCommand("ucinewgame");
      await this.awaitReady(handle);
    });
  }

  analyse(fen: string, limit: AnalysisLimit): Promise<PositionEvaluation> {
    return this.enqueue(() => this.search(fen, limit));
  }

  private async search(fen: string, limit: AnalysisLimit): Promise<PositionEvaluation> {
    const handle = await this.getHandle();
    const whiteToMove = sideToMoveIsWhite(fen);
    const toWhitePov = (value: number) => (whiteToMove ? value : -value);

    let latest: PositionEvaluation = { ...EMPTY_EVALUATION };
    // Toute ligne MultiPV vue (rang → ligne) — voir le commentaire équivalent
    // dans stockfish-engine.ts (navigateur). `limit.lines` n'est jamais utilisé
    // ici (import de fond, jamais de flèches à produire) : reste toujours borné
    // aux 2 lignes fixées par `initialize()`.
    const linesByRank = new Map<number, EngineLine>();

    const done = this.collect<PositionEvaluation>(handle, (line) => {
      const info = parseInfoLine(line);
      if (info) {
        const rank = info.multipv ?? 1;
        if (info.pv !== undefined || info.scoreCp !== undefined || info.scoreMate !== undefined) {
          const existing = linesByRank.get(rank);
          linesByRank.set(rank, {
            uci: info.pv?.[0] ?? existing?.uci ?? "",
            cp: info.scoreCp !== undefined ? toWhitePov(info.scoreCp) : (existing?.cp ?? null),
            mate: info.scoreMate !== undefined ? toWhitePov(info.scoreMate) : (existing?.mate ?? null),
          });
        }
        if (rank !== 1) return undefined;
        if (info.pv === undefined && info.scoreCp === undefined && info.scoreMate === undefined) {
          return undefined;
        }
        latest = {
          cp: info.scoreCp !== undefined ? toWhitePov(info.scoreCp) : null,
          mate: info.scoreMate !== undefined ? toWhitePov(info.scoreMate) : null,
          bestMoveUci: info.pv?.[0] ?? latest.bestMoveUci,
          pv: info.pv ?? latest.pv,
          depth: info.depth ?? latest.depth,
          secondBest: latest.secondBest,
          lines: latest.lines,
        };
        return undefined;
      }

      const best = parseBestMove(line);
      if (!best) return undefined;

      const lines = Array.from(linesByRank.entries())
        .sort(([rankA], [rankB]) => rankA - rankB)
        .map(([, candidate]) => candidate)
        .filter((candidate) => candidate.uci !== "");

      return {
        ...latest,
        bestMoveUci: best.bestMove ?? latest.bestMoveUci,
        lines,
        secondBest: lines[1] ? { cp: lines[1].cp, mate: lines[1].mate } : null,
      };
    });

    handle.sendCommand(`position fen ${fen}`);
    handle.sendCommand(goCommand(limit));

    return done;
  }

  // Pas de dispose() : voir le commentaire de classe. Envoyer "quit" serait
  // sûr en théorie (ce chemin n'appelle process.exit() que si ce fichier est
  // exécuté comme point d'entrée direct, pas via require() en bibliothèque),
  // mais quoi qu'il arrive, cette instance ne doit jamais être recréée dans
  // le même process — alors autant ne pas offrir la tentation.
}

/**
 * Instance unique, valable toute la durée de vie du process serveur.
 * `globalThis` : survit au rechargement à chaud de Next en dev, comme
 * `server/db/index.ts`.
 */
const globalForEngine = globalThis as unknown as {
  __chessTrainerNodeEngine?: NodeStockfishAnalyser;
};

export function getNodeStockfishAnalyser(): NodeStockfishAnalyser {
  if (!globalForEngine.__chessTrainerNodeEngine) {
    globalForEngine.__chessTrainerNodeEngine = new NodeStockfishAnalyser();
  }
  return globalForEngine.__chessTrainerNodeEngine;
}
