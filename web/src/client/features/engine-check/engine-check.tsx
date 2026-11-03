"use client";

/**
 * Vérification du moteur de bout en bout : chargement du worker, isolation
 * cross-origin (multi-thread), dialogue UCI et normalisation des scores.
 */
import { useState } from "react";
import { Chess } from "chess.js";
import { CircleCheck, Loader2, RotateCw, TriangleAlert } from "lucide-react";
import type { PositionEvaluation } from "@/core/analysis/types";
import { useEngine } from "@/client/engine/engine-context";
import { formatEvaluation } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ENGINE_FAILURE_TEXT, useEngineDisplayStatus } from "./use-engine-timeout";

const ANALYSIS_DEPTH = 18;

export function EngineCheck() {
  const { engine, multiThreaded } = useEngine();
  const { status, errorMessage } = useEngineDisplayStatus();
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
      await engine.analyseWithProgress(fen, { depth: ANALYSIS_DEPTH }, setEvaluation);
    } catch (cause) {
      setRunError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {status === "loading" && <Chip icon={Loader2} tone="neutral">Chargement de Stockfish…</Chip>}
          {status === "ready" && (
            <Chip icon={CircleCheck} tone="success">
              Stockfish 18 prêt · {multiThreaded ? "multi-thread" : "mono-thread"}
            </Chip>
          )}
          {(status === "error" || status === "timeout") && (
            <Chip icon={TriangleAlert} tone="danger">
              {status === "timeout" ? "Moteur sans réponse" : "Moteur en échec"}
            </Chip>
          )}
        </div>
        {status === "error" || status === "timeout" ? (
          <Button onClick={() => window.location.reload()}>
            <RotateCw aria-hidden="true" />
            Recharger
          </Button>
        ) : (
          <Button onClick={runCheck} disabled={status !== "ready" || running}>
            {running ? "Analyse…" : "Tester le moteur"}
          </Button>
        )}
      </div>

      {status === "timeout" && <p className="mt-3 text-sm text-danger">{ENGINE_FAILURE_TEXT.timeout}</p>}
      {status === "error" && (
        <p className="mt-3 text-sm text-danger">
          {ENGINE_FAILURE_TEXT.error} {errorMessage}
        </p>
      )}
      {runError && <p className="mt-3 text-sm text-danger">{runError}</p>}

      {status === "ready" && !multiThreaded && (
        <p className="mt-3 text-sm text-warning">
          SharedArrayBuffer indisponible : repli sur la version mono-thread, plus lente. Vérifie les en-têtes COOP/COEP.
        </p>
      )}

      {evaluation && (
        <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-foreground-muted">Évaluation</dt>
            <dd className="mt-0.5 font-mono">{formatEvaluation(evaluation.cp, evaluation.mate)}</dd>
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
    </div>
  );
}
