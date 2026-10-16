"use client";

/**
 * Vérification du moteur de bout en bout.
 *
 * Ce panneau n'est pas décoratif : il valide d'un coup le chargement du worker,
 * l'isolation cross-origin (donc le multi-thread), le dialogue UCI et la
 * normalisation des scores. Si quelque chose casse dans la couche moteur, ça se
 * voit ici avant de se voir en partie.
 */
import { useState } from "react";
import { Chess } from "chess.js";
import type { PositionEvaluation } from "@/core/analysis/types";
import { useEngine } from "@/client/engine/engine-context";
import { formatEvaluation } from "@/lib/labels";

const ANALYSIS_DEPTH = 18;

export function EngineCheck() {
  const { engine, status, error, multiThreaded } = useEngine();
  const [evaluation, setEvaluation] = useState<PositionEvaluation | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  async function runCheck() {
    if (!engine) return;
    setRunning(true);
    setEvaluation(null);
    setRunError(null);
    try {
      const fen = new Chess().fen();
      // Le retour de progression rend l'approfondissement visible en direct.
      await engine.analyseWithProgress(fen, { depth: ANALYSIS_DEPTH }, setEvaluation);
    } catch (cause) {
      setRunError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-medium">Moteur</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {status === "loading" && "Chargement de Stockfish…"}
            {status === "error" && `Échec : ${error?.message}`}
            {status === "ready" &&
              `Stockfish 18 prêt — ${multiThreaded ? "multi-thread" : "mono-thread"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={runCheck}
          disabled={status !== "ready" || running}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-40"
        >
          {running ? "Analyse…" : "Tester"}
        </button>
      </div>

      {runError && <p className="mt-3 text-sm text-blunder">{runError}</p>}

      {status === "ready" && !multiThreaded && (
        <p className="mt-3 text-sm text-inaccuracy">
          SharedArrayBuffer indisponible : repli sur la build mono-thread, plus lente.
          Vérifie les en-têtes COOP/COEP.
        </p>
      )}

      {evaluation && (
        <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-foreground-muted">Évaluation</dt>
            <dd className="mt-0.5 font-mono">
              {formatEvaluation(evaluation.cp, evaluation.mate)}
            </dd>
          </div>
          <div>
            <dt className="text-foreground-muted">Meilleur coup</dt>
            <dd className="mt-0.5 font-mono">{evaluation.bestMoveUci ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-foreground-muted">Profondeur</dt>
            <dd className="mt-0.5 font-mono">
              {evaluation.depth} / {ANALYSIS_DEPTH}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
