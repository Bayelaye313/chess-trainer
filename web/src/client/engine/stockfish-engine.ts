/**
 * Stockfish 18 WASM piloté dans un Web Worker.
 *
 * Client uniquement : ne jamais importer depuis un Server Component.
 *
 * Le moteur est mono-instance et sans état de requête : deux analyses
 * simultanées se marcheraient dessus. Toutes les commandes passent donc par une
 * file (`enqueue`) qui les sérialise.
 *
 * Stockfish est sous GPLv3. Il est chargé comme binaire séparé, non lié au code
 * de l'application.
 */
import type { AnalysisLimit, PositionEvaluation } from "@/core/analysis/types";
import { selectEngineBuild, recommendedThreads, type EngineBuild } from "./loader";
import { clampElo, type AnalysisProgress, type ChessEngine, type EngineOptions } from "./types";
import { goCommand, parseBestMove, parseInfoLine } from "@/core/engine/uci";

/**
 * Au-delà, on considère que le moteur ne répondra plus. Assez long pour une
 * recherche profonde sur la build mono-thread de repli, assez court pour ne
 * pas laisser l'utilisateur face à une interface figée sans explication.
 */
const COMMAND_TIMEOUT_MS = 45_000;

const EMPTY_EVALUATION: PositionEvaluation = {
  cp: null,
  mate: null,
  bestMoveUci: null,
  pv: [],
  depth: 0,
  secondBest: null,
};

type LineListener = (line: string) => void;
type PendingReject = (error: Error) => void;

function sideToMoveIsWhite(fen: string): boolean {
  return fen.split(" ")[1] !== "b";
}

export class StockfishEngine implements ChessEngine {
  private readonly worker: Worker;
  private readonly listeners = new Set<LineListener>();
  /** Rejet de chaque appel `collect()` en attente — déclenché en bloc si le worker plante. */
  private readonly pendingRejects = new Set<PendingReject>();
  /** Chaîne de sérialisation des commandes. */
  private queue: Promise<unknown> = Promise.resolve();
  private disposed = false;
  /** Le worker a planté : toute nouvelle commande échoue immédiatement, sans réessayer. */
  private crashed: Error | null = null;

  readonly build: EngineBuild;

  constructor(build: EngineBuild = selectEngineBuild()) {
    if (typeof window === "undefined") {
      throw new Error("StockfishEngine ne peut être instancié que côté client.");
    }
    this.build = build;
    this.worker = new Worker(build.url);
    this.worker.addEventListener("message", (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      for (const listener of this.listeners) listener(event.data);
    });
    // Sans ces deux écouteurs, un crash silencieux du WASM laissait les appels
    // en attente jusqu'au timeout (jusqu'à 45 s) au lieu d'échouer tout de
    // suite avec une cause claire.
    this.worker.addEventListener("error", (event: ErrorEvent) => {
      this.failAll(new Error(`Le moteur a planté : ${event.message || "erreur inconnue"}.`));
    });
    this.worker.addEventListener("messageerror", () => {
      this.failAll(new Error("Le moteur a envoyé un message illisible."));
    });
  }

  /** Fait échouer immédiatement tous les appels en attente et bloque les suivants. */
  private failAll(error: Error): void {
    this.crashed = error;
    for (const reject of this.pendingRejects) reject(error);
    this.pendingRejects.clear();
    this.listeners.clear();
  }

  private send(command: string): void {
    if (this.crashed) throw this.crashed;
    if (this.disposed) throw new Error("Moteur déjà libéré.");
    this.worker.postMessage(command);
  }

  /**
   * Écoute les lignes du moteur jusqu'à ce que `handle` renvoie une valeur.
   * `handle` est appelé pour chaque ligne, y compris celles qu'il ignore.
   */
  private collect<T>(handle: (line: string) => T | undefined): Promise<T> {
    if (this.crashed) return Promise.reject(this.crashed);

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Le moteur n'a pas répondu à temps."));
      }, COMMAND_TIMEOUT_MS);

      const onReject: PendingReject = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      const listener: LineListener = (line) => {
        const result = handle(line);
        if (result === undefined) return;
        cleanup();
        resolve(result);
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.listeners.delete(listener);
        this.pendingRejects.delete(onReject);
      };

      this.listeners.add(listener);
      this.pendingRejects.add(onReject);
    });
  }

  /** Sérialise les tâches : une commande moteur à la fois. */
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(task, task);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async handshake(): Promise<void> {
    const uciok = this.collect((line) => (line === "uciok" ? true : undefined));
    this.send("uci");
    await uciok;
    await this.awaitReady();
  }

  private async awaitReady(): Promise<void> {
    const readyok = this.collect((line) => (line === "readyok" ? true : undefined));
    this.send("isready");
    await readyok;
  }

  ready(): Promise<void> {
    return this.enqueue(() => this.handshake());
  }

  configure(options: EngineOptions): Promise<void> {
    return this.enqueue(async () => {
      if (this.build.multiThreaded) {
        const threads = options.threads ?? recommendedThreads();
        this.send(`setoption name Threads value ${threads}`);
      }
      if (options.hashMb !== undefined) {
        this.send(`setoption name Hash value ${options.hashMb}`);
      }
      // Deux lignes de recherche en permanence : la seconde sert à détecter les
      // positions « critiques » (un seul bon coup) — voir chess/classify.ts.
      // Ne change jamais quel coup le moteur retient (`bestmove` reste celui
      // de la ligne 1), juste la richesse de ce qu'on observe.
      this.send("setoption name MultiPV value 2");
      if (options.elo === undefined) {
        this.send("setoption name UCI_LimitStrength value false");
      } else {
        this.send("setoption name UCI_LimitStrength value true");
        this.send(`setoption name UCI_Elo value ${clampElo(options.elo)}`);
      }
      await this.awaitReady();
    });
  }

  newGame(): Promise<void> {
    return this.enqueue(async () => {
      this.send("ucinewgame");
      await this.awaitReady();
    });
  }

  analyse(fen: string, limit: AnalysisLimit): Promise<PositionEvaluation> {
    return this.analyseWithProgress(fen, limit, () => {});
  }

  analyseWithProgress(
    fen: string,
    limit: AnalysisLimit,
    onProgress: AnalysisProgress,
  ): Promise<PositionEvaluation> {
    return this.enqueue(() => this.search(fen, limit, onProgress));
  }

  async play(fen: string, limit: AnalysisLimit): Promise<string | null> {
    const evaluation = await this.analyseWithProgress(fen, limit, () => {});
    return evaluation.bestMoveUci;
  }

  /**
   * Une recherche complète : `position` puis `go`, jusqu'à `bestmove`.
   *
   * Les scores UCI sont exprimés du point de vue du camp au trait ; on les
   * normalise ici en point de vue Blancs, seule convention utilisée en aval.
   */
  private search(
    fen: string,
    limit: AnalysisLimit,
    onProgress: AnalysisProgress,
  ): Promise<PositionEvaluation> {
    const whiteToMove = sideToMoveIsWhite(fen);
    const toWhitePov = (value: number) => (whiteToMove ? value : -value);

    let latest: PositionEvaluation = { ...EMPTY_EVALUATION };
    // Deuxième ligne (MultiPV=2, voir configure()) : seulement de quoi calculer
    // l'écart avec la première, jamais exposée à `onProgress`.
    let secondCp: number | null = null;
    let secondMate: number | null = null;

    const done = this.collect<PositionEvaluation>((line) => {
      const info = parseInfoLine(line);
      if (info) {
        if (info.multipv === 2) {
          if (info.scoreCp !== undefined) secondCp = toWhitePov(info.scoreCp);
          if (info.scoreMate !== undefined) secondMate = toWhitePov(info.scoreMate);
          return undefined;
        }
        // Rang > 2 : ne devrait pas arriver avec MultiPV=2, ignoré par prudence.
        if (info.multipv !== undefined && info.multipv > 2) return undefined;
        if (info.pv === undefined && info.scoreCp === undefined && info.scoreMate === undefined) {
          return undefined;
        }

        latest = {
          cp: info.scoreCp !== undefined ? toWhitePov(info.scoreCp) : null,
          mate: info.scoreMate !== undefined ? toWhitePov(info.scoreMate) : null,
          bestMoveUci: info.pv?.[0] ?? latest.bestMoveUci,
          pv: info.pv ?? latest.pv,
          depth: info.depth ?? latest.depth,
          secondBest: null,
        };
        onProgress(latest);
        return undefined;
      }

      const best = parseBestMove(line);
      if (!best) return undefined;

      // `bestmove` fait foi : c'est le coup que le moteur retient réellement.
      return {
        ...latest,
        bestMoveUci: best.bestMove ?? latest.bestMoveUci,
        secondBest: secondCp !== null || secondMate !== null ? { cp: secondCp, mate: secondMate } : null,
      };
    });

    this.send(`position fen ${fen}`);
    this.send(goCommand(limit));

    return done;
  }

  stop(): void {
    if (!this.disposed) this.send("stop");
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    // Fait échouer tout de suite les appels en attente plutôt que de les
    // laisser expirer 45 s plus tard sur un worker qui n'existe déjà plus.
    for (const reject of this.pendingRejects) reject(new Error("Moteur libéré."));
    this.pendingRejects.clear();
    this.listeners.clear();
    this.worker.terminate();
  }
}
