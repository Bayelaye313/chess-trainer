/**
 * Choix de la build Stockfish à charger.
 *
 * Les fichiers sont servis en statique depuis public/engine/ (voir
 * scripts/setup-engine.mjs) : le glue Emscripten résout son `.wasm` par
 * convention de nom à côté de lui, ce que le bundler casserait.
 */

const ENGINE_DIR = "/engine";

export interface EngineBuild {
  url: string;
  /** La build multi-thread exige SharedArrayBuffer, donc l'isolation cross-origin. */
  multiThreaded: boolean;
}

const MULTI_THREADED: EngineBuild = {
  url: `${ENGINE_DIR}/stockfish-18-lite.js`,
  multiThreaded: true,
};

const SINGLE_THREADED: EngineBuild = {
  url: `${ENGINE_DIR}/stockfish-18-lite-single.js`,
  multiThreaded: false,
};

/**
 * `crossOriginIsolated` est vrai quand COOP/COEP sont bien appliqués (voir
 * next.config.ts). Sinon on retombe silencieusement sur la build single-thread :
 * plus lente, mais fonctionnelle partout.
 */
export function selectEngineBuild(): EngineBuild {
  const isolated =
    typeof globalThis.crossOriginIsolated === "boolean" && globalThis.crossOriginIsolated;
  return isolated ? MULTI_THREADED : SINGLE_THREADED;
}

/** Threads à demander au moteur, en gardant un cœur pour l'interface. */
export function recommendedThreads(): number {
  const cores = typeof navigator !== "undefined" ? (navigator.hardwareConcurrency ?? 4) : 4;
  return Math.max(1, Math.min(8, cores - 1));
}
