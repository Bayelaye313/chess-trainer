import { ChartColumn, CircleCheck, Play } from "lucide-react";
import type { DeckId } from "@/core/chess/decks";
import type { DeckOverview } from "@/server/queries/reviews";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { DECK_ICON } from "./deck-icon";

function plural(count: number, one: string, many: string): string {
  return `${count} ${count > 1 ? many : one}`;
}

/**
 * Réviser : les 7 decks de cartes tirées de tes erreurs (répétition
 * espacée). Action principale : le deck qui a le plus de cartes dues.
 */
export function DeckDashboard({
  decks,
  onSelect,
  onOpenMistakesHub,
}: {
  decks: DeckOverview[];
  onSelect: (deckId: DeckId) => void;
  onOpenMistakesHub: () => void;
}) {
  const total = decks.reduce((sum, deck) => sum + deck.dueCount + deck.newCount, 0);
  const firstDeck = [...decks].filter((deck) => deck.dueCount + deck.newCount > 0).sort((a, b) => b.dueCount - a.dueCount)[0];

  return (
    <div>
      <PageHeader
        title="Réviser"
        description="Tes erreurs deviennent des cartes, revues au bon moment (répétition espacée)."
        action={
          firstDeck ? (
            <Button variant="primary" data-primary-action onClick={() => onSelect(firstDeck.id)} className="w-full sm:w-auto">
              <Play aria-hidden="true" />
              Réviser : {firstDeck.title}
            </Button>
          ) : (
            <Chip icon={CircleCheck} tone="success">
              Tout est à jour
            </Chip>
          )
        }
      />

      <p className="mb-3 text-sm text-foreground-muted">
        <span className="font-mono text-foreground">{total}</span> carte{total > 1 ? "s" : ""} à réviser sur 7 decks
      </p>

      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {decks.map((deck) => {
          const Icon = DECK_ICON[deck.id];
          const totalToPlay = deck.dueCount + deck.newCount;
          return (
            <li key={deck.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <Icon aria-hidden="true" className="size-5 shrink-0 text-foreground-subtle" />
              <div className="min-w-0 flex-1">
                <h2 className="font-medium text-foreground">{deck.title}</h2>
                <p className="text-sm text-foreground-muted">{deck.subtitle}</p>
              </div>
              <p className="w-full text-sm text-foreground-muted sm:w-auto">
                {totalToPlay === 0 ? (
                  <Chip icon={CircleCheck} tone="success">
                    À jour
                  </Chip>
                ) : (
                  <>
                    <span className="font-mono text-foreground">{deck.dueCount}</span> à revoir ·{" "}
                    <span className="font-mono text-foreground">{deck.newCount}</span> {deck.newCount > 1 ? "nouvelles" : "nouvelle"}
                  </>
                )}
              </p>
              <div className="flex gap-2">
                {deck.id === "opening_mistakes" && (
                  <Button variant="ghost" data-mistakes-hub onClick={onOpenMistakesHub}>
                    <ChartColumn aria-hidden="true" />
                    Analyser
                  </Button>
                )}
                {totalToPlay > 0 && (
                  <Button data-deck-start onClick={() => onSelect(deck.id)} aria-label={`Réviser ${deck.title} (${plural(totalToPlay, "carte", "cartes")})`}>
                    Réviser
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
