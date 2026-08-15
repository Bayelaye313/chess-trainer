"use client";

import { useState } from "react";
import type { ImportSource } from "@/server/actions/import";
import { DEFAULT_MAX_GAMES, MAX_MAX_GAMES, MIN_MAX_GAMES } from "@/lib/import-limits";

export function ImportForm({
  disabled,
  onStart,
}: {
  disabled: boolean;
  onStart: (source: ImportSource, username: string, maxGames: number) => void;
}) {
  const [source, setSource] = useState<ImportSource>("chesscom");
  const [username, setUsername] = useState("");
  const [maxGames, setMaxGames] = useState(DEFAULT_MAX_GAMES);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim()) return;
    onStart(source, username.trim(), maxGames);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-6">
      <h1 className="text-lg font-semibold">Importer des parties</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Analyse tes parties passées et alimente Practice avec tes erreurs — comme en direct,
        seuls tes propres coups sont évalués.
      </p>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">Plateforme</span>
          <select
            value={source}
            onChange={(event) => setSource(event.target.value as ImportSource)}
            className="rounded-md border border-border bg-surface px-3 py-1.5"
          >
            <option value="chesscom">Chess.com</option>
            <option value="lichess">Lichess</option>
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">Pseudo</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ton-pseudo"
            className="rounded-md border border-border bg-surface px-3 py-1.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">Nombre de parties</span>
          <input
            type="number"
            min={MIN_MAX_GAMES}
            max={MAX_MAX_GAMES}
            value={maxGames}
            onChange={(event) => setMaxGames(Number(event.target.value))}
            className="w-28 rounded-md border border-border bg-surface px-3 py-1.5"
          />
        </label>

        <button
          type="submit"
          disabled={disabled || !username.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-40"
        >
          Importer
        </button>
      </div>

      <p className="mt-3 text-xs text-foreground-muted">
        Au-delà de quelques dizaines de parties, l&apos;import peut prendre du temps — l&apos;analyse
        tourne en tâche de fond, tu peux naviguer ailleurs pendant ce temps.
      </p>
    </form>
  );
}
