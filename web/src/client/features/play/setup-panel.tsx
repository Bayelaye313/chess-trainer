"use client";

import { useState } from "react";
import { DEFAULT_ELO, MAX_ENGINE_ELO, MIN_ENGINE_ELO } from "./constants";

export function SetupPanel({
  engineReady,
  loading,
  onStart,
}: {
  engineReady: boolean;
  loading: boolean;
  onStart: (color: "w" | "b", elo: number) => void;
}) {
  const [color, setColor] = useState<"w" | "b">("w");
  const [elo, setElo] = useState(DEFAULT_ELO);

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h1 className="text-lg font-semibold">Nouvelle partie</h1>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">Couleur</span>
          <select
            value={color}
            onChange={(event) => setColor(event.target.value as "w" | "b")}
            className="rounded-md border border-border bg-surface px-3 py-1.5"
          >
            <option value="w">Blancs</option>
            <option value="b">Noirs</option>
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">
            Force du moteur — <span className="font-mono">{elo}</span> ELO
          </span>
          <input
            type="range"
            min={MIN_ENGINE_ELO}
            max={MAX_ENGINE_ELO}
            step={10}
            value={elo}
            onChange={(event) => setElo(Number(event.target.value))}
          />
        </label>

        <button
          type="button"
          disabled={!engineReady || loading}
          onClick={() => onStart(color, elo)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-40"
        >
          {loading ? "Préparation…" : "Commencer"}
        </button>
      </div>

      {!engineReady && (
        <p className="mt-3 text-sm text-foreground-muted">Chargement du moteur…</p>
      )}
    </section>
  );
}
