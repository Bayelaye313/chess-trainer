"use client";

import { useEffect, useState } from "react";

/**
 * Micro-pause SMR après un bloc de calcul intense : un minuteur calme, sans
 * échiquier. Présentée comme une consolidation courte (yeux fermés, aucun
 * écran), jamais comme du sommeil.
 */
export function SmrPause({ minutes, consigne, onDone }: { minutes: number; consigne?: string; onDone: () => void }) {
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || left <= 0) return;
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(t);
  }, [running, left]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="max-w-md text-sm text-foreground-muted">
        {consigne ?? "Micro-pause de consolidation."} Le cerveau consolide ce qui vient d&apos;être calculé : ferme les yeux, respire lentement,
        ne regarde aucun écran. Ce n&apos;est pas une sieste, c&apos;est une consolidation courte.
      </p>
      <p className="font-mono text-5xl tabular-nums">{mm}:{ss}</p>
      <div className="flex gap-2">
        {!running && left > 0 && (
          <button type="button" onClick={() => setRunning(true)} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
            Démarrer la pause
          </button>
        )}
        <button type="button" onClick={onDone} className="rounded-md border border-border px-4 py-2">
          {left <= 0 ? "Reprendre" : "Passer"}
        </button>
      </div>
    </div>
  );
}
