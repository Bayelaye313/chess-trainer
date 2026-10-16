"use client";

import type { PuzzleDifficulty, PuzzleTheme } from "@/server/actions/puzzle-bank";
import { PUZZLE_DIFFICULTIES, PUZZLE_THEMES } from "./constants";

export function ThemeFilter({
  theme,
  difficulty,
  onChange,
  disabled,
}: {
  theme: PuzzleTheme;
  difficulty: PuzzleDifficulty;
  onChange: (next: { theme: PuzzleTheme; difficulty: PuzzleDifficulty }) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-surface p-4 text-sm">
      <label className="flex flex-col gap-1.5">
        <span className="text-foreground-muted">Thème</span>
        <select
          value={theme}
          disabled={disabled}
          onChange={(event) => onChange({ theme: event.target.value, difficulty })}
          className="rounded-md border border-border bg-surface px-3 py-1.5 disabled:opacity-40"
        >
          {PUZZLE_THEMES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-foreground-muted">Difficulté</span>
        <select
          value={difficulty}
          disabled={disabled}
          onChange={(event) => onChange({ theme, difficulty: event.target.value as PuzzleDifficulty })}
          className="rounded-md border border-border bg-surface px-3 py-1.5 disabled:opacity-40"
        >
          {PUZZLE_DIFFICULTIES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
