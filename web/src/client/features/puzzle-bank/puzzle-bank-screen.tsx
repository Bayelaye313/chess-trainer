"use client";

/**
 * Onglet "Casse-têtes" : banque tierce en direct (API publique Lichess), sans
 * file de révision — résolution libre, puzzle suivant sur demande. Distinct
 * de "Entraîner" (`ReviewsScreen`), qui ne présente que nos propres erreurs
 * en répétition espacée FSRS.
 */
import { useEffect, useState } from "react";
import {
  getDailyPuzzle,
  getNextPuzzle,
  type BankPuzzle,
  type PuzzleDifficulty,
  type PuzzleTheme,
} from "@/server/actions/puzzle-bank";
import { BankPuzzleBoard } from "./bank-puzzle-board";
import { ThemeFilter } from "./theme-filter";

type ScreenState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "puzzle"; puzzle: BankPuzzle };

export function PuzzleBankScreen() {
  const [theme, setTheme] = useState<PuzzleTheme>("mix");
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>("normal");
  const [state, setState] = useState<ScreenState>({ status: "loading" });
  const [solvedCount, setSolvedCount] = useState(0);

  async function loadNext(nextTheme: PuzzleTheme = theme, nextDifficulty: PuzzleDifficulty = difficulty) {
    setState({ status: "loading" });
    const result = await getNextPuzzle({ theme: nextTheme, difficulty: nextDifficulty });
    setState("error" in result ? { status: "error", message: result.error } : { status: "puzzle", puzzle: result.puzzle });
  }

  async function loadDaily() {
    setState({ status: "loading" });
    const result = await getDailyPuzzle();
    setState("error" in result ? { status: "error", message: result.error } : { status: "puzzle", puzzle: result.puzzle });
  }

  // Un seul chargement initial (puzzle aléatoire, réglages par défaut) — les
  // changements de filtre n'en déclenchent pas d'autre tant que l'utilisateur
  // n'a pas cliqué "Puzzle suivant" : changer le thème ne doit pas couper une
  // résolution en cours. Appel direct plutôt que via `loadNext` : l'état
  // initial est déjà `{ status: "loading" }`, resynchroniser un setState
  // synchrone en tête d'effet n'apporterait rien (et déclenche le lint
  // `react-hooks/set-state-in-effect`) — seul le résultat, une fois revenu,
  // doit mettre à jour l'état.
  useEffect(() => {
    let cancelled = false;
    getNextPuzzle({ theme, difficulty }).then((result) => {
      if (cancelled) return;
      setState("error" in result ? { status: "error", message: result.error } : { status: "puzzle", puzzle: result.puzzle });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(next: { theme: PuzzleTheme; difficulty: PuzzleDifficulty }) {
    setTheme(next.theme);
    setDifficulty(next.difficulty);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Casse-têtes</h1>
          <p className="mt-2 max-w-prose text-sm text-foreground-muted">
            Banque de puzzles tactiques Lichess, en direct — résolution libre, sans lien avec tes
            decks FSRS de l&apos;onglet Entraîner.
          </p>
        </div>
        {solvedCount > 0 && (
          <p className="shrink-0 text-sm text-foreground-muted">
            {solvedCount} puzzle{solvedCount > 1 ? "s" : ""} résolu{solvedCount > 1 ? "s" : ""} cette session
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <ThemeFilter
          theme={theme}
          difficulty={difficulty}
          onChange={handleFilterChange}
          disabled={state.status === "loading"}
        />
        <button
          type="button"
          onClick={() => void loadDaily()}
          disabled={state.status === "loading"}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground-muted hover:text-foreground disabled:opacity-40"
        >
          Puzzle du jour
        </button>
      </div>

      {state.status === "loading" && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          Chargement du puzzle…
        </p>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-blunder/30 bg-blunder/10 p-6 text-center text-sm text-blunder">
          <p>{state.message}</p>
          <button
            type="button"
            onClick={() => void loadNext()}
            className="mt-3 rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-surface-muted"
          >
            Réessayer
          </button>
        </div>
      )}

      {state.status === "puzzle" && (
        <div className="space-y-3">
          <p className="text-center text-xs text-foreground-muted">
            Difficulté estimée : <span className="font-mono">{state.puzzle.rating}</span>
            {state.puzzle.themes.length > 0 ? ` · ${state.puzzle.themes.join(", ")}` : ""}
          </p>
          <BankPuzzleBoard
            key={state.puzzle.id}
            puzzle={state.puzzle}
            onNext={() => {
              setSolvedCount((count) => count + 1);
              void loadNext();
            }}
          />
        </div>
      )}
    </div>
  );
}
