"use client";

/**
 * Un seul moteur pour toute l'application.
 *
 * Un worker Stockfish coûte ~7 Mo de WASM et plusieurs threads : en instancier
 * un par composant serait absurde. Le provider en possède un, monté à la
 * demande, et les écrans le consomment via `useEngine()`.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StockfishEngine } from "./stockfish-engine";
import type { EngineOptions } from "./types";

export type EngineStatus = "loading" | "ready" | "error";

interface EngineContextValue {
  engine: StockfishEngine | null;
  status: EngineStatus;
  error: Error | null;
  /** Vrai si la build multi-thread a pu être chargée. */
  multiThreaded: boolean;
}

const EngineContext = createContext<EngineContextValue | null>(null);

export function EngineProvider({
  children,
  options,
}: {
  children: ReactNode;
  options?: EngineOptions;
}) {
  const [engine, setEngine] = useState<StockfishEngine | null>(null);
  const [status, setStatus] = useState<EngineStatus>("loading");
  const [error, setError] = useState<Error | null>(null);

  // Les options ne doivent pas relancer le worker : on les lit à l'init puis on
  // passe par `configure()` pour tout changement ultérieur.
  const initialOptions = useRef(options);

  useEffect(() => {
    let disposed = false;
    let instance: StockfishEngine | null = null;

    (async () => {
      try {
        instance = new StockfishEngine();
        await instance.ready();
        await instance.configure(initialOptions.current ?? {});
        if (disposed) {
          instance.dispose();
          return;
        }
        setEngine(instance);
        setStatus("ready");
      } catch (cause) {
        if (disposed) return;
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setStatus("error");
      }
    })();

    return () => {
      disposed = true;
      instance?.dispose();
    };
  }, []);

  const value = useMemo<EngineContextValue>(
    () => ({
      engine,
      status,
      error,
      multiThreaded: engine?.build.multiThreaded ?? false,
    }),
    [engine, status, error],
  );

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

export function useEngine(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error("useEngine() doit être utilisé dans un <EngineProvider>.");
  }
  return context;
}
