/**
 * Écran de sélection : une carte par deck (voir `core/chess/decks.ts`), avec
 * le compte de cartes dues/nouvelles lu en base (`listDeckOverviews`). Pur —
 * la donnée est chargée par le parent (`ReviewsScreen`), ce composant ne fait
 * qu'afficher et remonter le choix.
 */
import type { DeckId } from "@/core/chess/decks";
import type { DeckOverview } from "@/server/queries/reviews";
import { DECK_ICON } from "./deck-icon";

export function DeckDashboard({
  decks,
  onSelect,
}: {
  decks: DeckOverview[];
  onSelect: (deckId: DeckId) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entraîner</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Sept decks alimentés par tes propres erreurs, en répétition espacée FSRS.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => {
          const totalToPlay = deck.dueCount + deck.newCount;
          return (
            <div
              key={deck.id}
              className="flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-2xl" aria-hidden>
                  {DECK_ICON[deck.id]}
                </span>
                {totalToPlay === 0 && (
                  <span className="shrink-0 rounded-full border border-best/30 bg-best/10 px-2.5 py-1 text-xs font-medium text-best">
                    À jour ! 👍
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-base font-semibold">{deck.title}</h2>
              <p className="mt-1 flex-1 text-sm text-foreground-muted">{deck.subtitle}</p>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="text-foreground-muted">
                  <span className="font-medium text-foreground">{deck.dueCount}</span> dû
                  {deck.dueCount > 1 ? "s" : ""}
                </span>
                <span className="text-foreground-muted">
                  <span className="font-medium text-foreground">{deck.newCount}</span> nouve
                  {deck.newCount > 1 ? "aux" : "au"}
                </span>
              </div>

              {totalToPlay > 0 && (
                <button
                  type="button"
                  onClick={() => onSelect(deck.id)}
                  className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                >
                  Démarrer la révision
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
