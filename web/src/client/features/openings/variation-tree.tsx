"use client";

/**
 * L'arbre des variantes : tous les coups théoriques (base ECO) jouables
 * depuis la position affichée, pas seulement le prochain coup de la ligne de
 * référence choisie par le catalogue — voir `listBookContinuations`. Cliquer
 * un coup le joue directement (`playMove`), qu'il prolonge la ligne de
 * référence ou ouvre le bac à sable sur une autre variante théorique connue.
 */
import { useBookContinuations } from "./use-book-continuations";

export function VariationTree({ fen, onPlay }: { fen: string; onPlay: (uci: string) => void }) {
  const state = useBookContinuations(fen);

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">Arbre des variantes</h2>
      <p className="mt-1 text-xs text-foreground-muted">Coups théoriques connus depuis la position affichée.</p>

      {state.status === "loading" && <p className="mt-3 text-xs text-foreground-muted">Recherche en base ECO…</p>}

      {state.status === "error" && <p className="mt-3 text-xs text-inaccuracy">Impossible d&apos;interroger la base ECO.</p>}

      {state.status === "ready" && state.continuations.length === 0 && (
        <p className="mt-3 text-xs text-foreground-muted">Aucun coup théorique connu ne part de cette position.</p>
      )}

      {state.status === "ready" && state.continuations.length > 0 && (
        <ul className="mt-3 space-y-1">
          {state.continuations.map((continuation) => (
            <li key={continuation.uci}>
              <button
                type="button"
                onClick={() => onPlay(continuation.uci)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-muted"
              >
                <span className="font-mono font-medium text-foreground">{continuation.san}</span>
                <span className="truncate text-xs text-foreground-muted">
                  {continuation.eco} · {continuation.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
