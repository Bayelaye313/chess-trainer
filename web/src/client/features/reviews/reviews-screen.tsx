"use client";

/**
 * Orchestrateur de l'onglet « Entraîner » : bascule entre le dashboard des
 * decks et la session de puzzle en cours. `initialDecks` vient du Server
 * Component (`app/entrainer/page.tsx`, voir `listDeckOverviews`) ; on ne
 * retourne au dashboard qu'après un aller-retour serveur pour rafraîchir les
 * compteurs (les cartes qu'on vient de réviser ne sont plus dues).
 */
import { useState } from "react";
import type { DeckId } from "@/core/chess/decks";
import { getDeckOverviews } from "@/server/actions/practice";
import type { DeckOverview } from "@/server/queries/reviews";
import { DeckDashboard } from "./deck-dashboard";
import { OpeningMistakesHub } from "./opening-mistakes-hub";
import { PuzzleSession } from "./puzzle-session";

export function ReviewsScreen({ initialDecks }: { initialDecks: DeckOverview[] }) {
  const [decks, setDecks] = useState(initialDecks);
  const [selectedDeck, setSelectedDeck] = useState<DeckId | null>(null);
  const [mistakesHubOpen, setMistakesHubOpen] = useState(false);

  async function exitSession() {
    setSelectedDeck(null);
    setDecks(await getDeckOverviews());
  }

  if (selectedDeck) {
    return <PuzzleSession deckId={selectedDeck} onExit={exitSession} />;
  }

  if (mistakesHubOpen) {
    return <OpeningMistakesHub onExit={() => setMistakesHubOpen(false)} />;
  }

  return <DeckDashboard decks={decks} onSelect={setSelectedDeck} onOpenMistakesHub={() => setMistakesHubOpen(true)} />;
}
